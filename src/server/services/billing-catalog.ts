import { and, desc, eq, inArray } from "drizzle-orm"

import { env } from "@/env"
import { db } from "@/server/db"
import { billingEntitlement, billingPlan, billingPrice, billingSubscription } from "@/server/db/schema/billing"

export const BILLING_PLAN_KEYS = ["free", "pro"] as const
export type BillingPlanKey = typeof BILLING_PLAN_KEYS[number]

export const BILLING_FEATURES = {
  AI_CHAT: "ai_chat",
  ADVANCED_AI_PLANNER: "advanced_ai_planner",
  ADVANCED_ANALYTICS: "advanced_analytics",
} as const

const catalog = [
  {
    key: "free" as const,
    name: "Free",
    description: "Build workouts, track progress, and try the planner every month.",
    stripeProductId: null,
    entitlements: [
      { featureKey: BILLING_FEATURES.AI_CHAT, limitValue: 25_000, limitUnit: "tokens_per_month" },
      { featureKey: BILLING_FEATURES.ADVANCED_AI_PLANNER, limitValue: 0, limitUnit: "boolean" },
      { featureKey: BILLING_FEATURES.ADVANCED_ANALYTICS, limitValue: 0, limitUnit: "boolean" },
    ],
  },
  {
    key: "pro" as const,
    name: "Pro",
    description: "More AI planning capacity, the stronger model, and deeper insights.",
    stripeProductId: env.STRIPE_PRO_PRODUCT_ID ?? null,
    entitlements: [
      { featureKey: BILLING_FEATURES.AI_CHAT, limitValue: 250_000, limitUnit: "tokens_per_month" },
      { featureKey: BILLING_FEATURES.ADVANCED_AI_PLANNER, limitValue: 1, limitUnit: "boolean" },
      { featureKey: BILLING_FEATURES.ADVANCED_ANALYTICS, limitValue: 1, limitUnit: "boolean" },
    ],
  },
]

const priceCatalog = [
  {
    key: "pro" as const,
    stripePriceId: env.STRIPE_PRO_MONTHLY_PRICE_ID,
    currency: env.STRIPE_BILLING_CURRENCY,
    amount: env.STRIPE_PRO_MONTHLY_AMOUNT,
    interval: "month",
  },
  {
    key: "pro" as const,
    stripePriceId: env.STRIPE_PRO_ANNUAL_PRICE_ID,
    currency: env.STRIPE_BILLING_CURRENCY,
    amount: env.STRIPE_PRO_ANNUAL_AMOUNT,
    interval: "year",
  },
]

export async function ensureBillingCatalog (database: typeof db = db) {
  for (const plan of catalog) {
    await database
      .insert(billingPlan)
      .values({
        key: plan.key,
        name: plan.name,
        description: plan.description,
        stripeProductId: plan.stripeProductId,
      })
      .onConflictDoUpdate({
        target: billingPlan.key,
        set: {
          name: plan.name,
          description: plan.description,
          stripeProductId: plan.stripeProductId,
          active: true,
        },
      })
  }

  const plans = await database.query.billingPlan.findMany({
    where: inArray(billingPlan.key, [...BILLING_PLAN_KEYS]),
  })

  for (const plan of catalog) {
    const planRow = plans.find(({ key }) => key === plan.key)
    if (!planRow) continue

    for (const entitlement of plan.entitlements) {
      await database
        .insert(billingEntitlement)
        .values({ ...entitlement, planId: planRow.id })
        .onConflictDoUpdate({
          target: [billingEntitlement.planId, billingEntitlement.featureKey],
          set: {
            limitValue: entitlement.limitValue,
            limitUnit: entitlement.limitUnit,
          },
        })
    }
  }

  const proPlan = plans.find(({ key }) => key === "pro")
  if (proPlan) {
    for (const price of priceCatalog) {
      if (!price.stripePriceId) continue

      await database
        .insert(billingPrice)
        .values({
          planId: proPlan.id,
          stripePriceId: price.stripePriceId,
          currency: price.currency,
          amount: price.amount,
          interval: price.interval,
        })
        .onConflictDoUpdate({
          target: billingPrice.stripePriceId,
          set: {
            planId: proPlan.id,
            currency: price.currency,
            amount: price.amount,
            interval: price.interval,
            active: true,
          },
        })
    }
  }

  return database.query.billingPlan.findMany({
    where: inArray(billingPlan.key, [...BILLING_PLAN_KEYS]),
    with: {
      prices: true,
      entitlements: true,
    },
  })
}

export async function getEffectiveBillingPlan (userId: string, database: typeof db = db) {
  const plans = await ensureBillingCatalog(database)
  const freePlan = plans.find(({ key }) => key === "free")
  if (!freePlan) throw new Error("The free billing plan is missing.")

  const subscription = await database.query.billingSubscription.findFirst({
    where: and(
      eq(billingSubscription.userId, userId),
      inArray(billingSubscription.status, ["active", "trialing"]),
    ),
    orderBy: [desc(billingSubscription.currentPeriodEnd)],
    with: {
      plan: {
        with: {
          prices: true,
          entitlements: true,
        },
      },
    },
  })

  const currentDate = new Date()
  const hasCurrentSubscription = subscription && subscription.currentPeriodEnd > currentDate
  const plan = hasCurrentSubscription ? subscription.plan : freePlan

  return {
    plan,
    subscription: hasCurrentSubscription ? subscription : null,
  }
}

export function getPlanEntitlement (plan: Awaited<ReturnType<typeof getEffectiveBillingPlan>>["plan"], featureKey: string) {
  return plan.entitlements.find((entitlement) => entitlement.featureKey === featureKey)
}
