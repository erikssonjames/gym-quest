import { and, eq, sql } from "drizzle-orm"

import { db } from "@/server/db"
import { aiUsageEvent, aiUsagePeriod } from "@/server/db/schema/billing"
import { BILLING_FEATURES, getEffectiveBillingPlan, getPlanEntitlement, type BillingPlanKey } from "@/server/services/billing-catalog"
import type { WorkoutAiChatMessage } from "@/server/ai/workout-schema"

export class AiQuotaExceededError extends Error {}

type UsageReservation = {
  userId: string
  periodId: string
  estimatedTokens: number
  planKey: BillingPlanKey
}

type UsageResult = {
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

function getUtcMonthWindow () {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  return { start, end }
}

function getUsageWindow (subscription: Awaited<ReturnType<typeof getEffectiveBillingPlan>>["subscription"]) {
  if (subscription) {
    return {
      start: subscription.currentPeriodStart,
      end: subscription.currentPeriodEnd,
    }
  }

  return getUtcMonthWindow()
}

async function getOrCreateUsagePeriod (userId: string, window: { start: Date; end: Date }, database: typeof db) {
  await database
    .insert(aiUsagePeriod)
    .values({
      userId,
      periodStart: window.start,
      periodEnd: window.end,
    })
    .onConflictDoNothing({ target: [aiUsagePeriod.userId, aiUsagePeriod.periodStart] })

  const period = await database.query.aiUsagePeriod.findFirst({
    where: and(
      eq(aiUsagePeriod.userId, userId),
      eq(aiUsagePeriod.periodStart, window.start),
    ),
  })

  if (!period) throw new Error("Could not create the AI usage period.")
  return period
}

export function estimateWorkoutAiTokens (messages: WorkoutAiChatMessage[], planKey: BillingPlanKey) {
  const messageCharacters = messages.reduce((total, message) => total + message.content.length, 0)
  const catalogCharacters = planKey === "pro" ? 18_000 : 12_000
  const outputAllowance = planKey === "pro" ? 2_800 : 1_800
  return Math.max(1, Math.ceil((messageCharacters + catalogCharacters) / 4) + outputAllowance)
}

export async function reserveAiTokens ({ userId, estimatedTokens, database = db }: { userId: string; estimatedTokens: number; database?: typeof db }): Promise<UsageReservation> {
  const { plan, subscription } = await getEffectiveBillingPlan(userId, database)
  const entitlement = getPlanEntitlement(plan, BILLING_FEATURES.AI_CHAT)
  const tokenQuota = entitlement?.limitValue ?? 0
  const period = await getOrCreateUsagePeriod(userId, getUsageWindow(subscription), database)

  const reserved = await database
    .update(aiUsagePeriod)
    .set({
      reservedTokens: sql`${aiUsagePeriod.reservedTokens} + ${estimatedTokens}`,
    })
    .where(and(
      eq(aiUsagePeriod.id, period.id),
      sql`${aiUsagePeriod.totalTokens} + ${aiUsagePeriod.reservedTokens} + ${estimatedTokens} <= ${tokenQuota}`,
    ))
    .returning({ id: aiUsagePeriod.id })

  if (!reserved[0]) {
    throw new AiQuotaExceededError("Monthly AI token limit reached.")
  }

  return {
    userId,
    periodId: period.id,
    estimatedTokens,
    planKey: plan.key as BillingPlanKey,
  }
}

export async function releaseAiTokens (reservation: UsageReservation, database: typeof db = db) {
  await database
    .update(aiUsagePeriod)
    .set({
      reservedTokens: sql`GREATEST(${aiUsagePeriod.reservedTokens} - ${reservation.estimatedTokens}, 0)`,
    })
    .where(eq(aiUsagePeriod.id, reservation.periodId))
}

function estimateCostMicros (model: string, inputTokens: number, outputTokens: number) {
  const pricing = model.includes("flash-lite")
    ? { input: 100_000, output: 400_000 }
    : { input: 300_000, output: 2_500_000 }

  return Math.ceil((inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000)
}

export async function finalizeAiTokens (reservation: UsageReservation, requestId: string, usage: UsageResult, database: typeof db = db) {
  const chargedTotalTokens = Math.max(usage.totalTokens, reservation.estimatedTokens)
  const estimatedCostMicros = estimateCostMicros(usage.model, usage.inputTokens, usage.outputTokens)

  await database.transaction(async (transaction) => {
    await transaction
      .update(aiUsagePeriod)
      .set({
        reservedTokens: sql`GREATEST(${aiUsagePeriod.reservedTokens} - ${reservation.estimatedTokens}, 0)`,
        inputTokens: sql`${aiUsagePeriod.inputTokens} + ${usage.inputTokens}`,
        outputTokens: sql`${aiUsagePeriod.outputTokens} + ${usage.outputTokens}`,
        totalTokens: sql`${aiUsagePeriod.totalTokens} + ${chargedTotalTokens}`,
        requestCount: sql`${aiUsagePeriod.requestCount} + 1`,
        estimatedCostMicros: sql`${aiUsagePeriod.estimatedCostMicros} + ${estimatedCostMicros}`,
      })
      .where(eq(aiUsagePeriod.id, reservation.periodId))

    await transaction.insert(aiUsageEvent).values({
      userId: reservation.userId,
      periodId: reservation.periodId,
      requestId,
      model: usage.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: chargedTotalTokens,
      estimatedCostMicros,
      status: "completed",
    })
  })
}

export async function getAiUsageSnapshot (userId: string, database: typeof db = db) {
  const { plan, subscription } = await getEffectiveBillingPlan(userId, database)
  const entitlement = getPlanEntitlement(plan, BILLING_FEATURES.AI_CHAT)
  const period = await getOrCreateUsagePeriod(userId, getUsageWindow(subscription), database)

  return {
    planKey: plan.key as BillingPlanKey,
    planName: plan.name,
    quotaTokens: entitlement?.limitValue ?? 0,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    usedTokens: period.totalTokens,
    reservedTokens: period.reservedTokens,
    requestCount: period.requestCount,
    estimatedCostMicros: period.estimatedCostMicros,
  }
}
