import { z } from "zod"
import { eq, inArray, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"

import { env } from "@/env"
import { aiUsagePeriod, billingCustomer, billingSubscription, ownerRevenueLedger } from "@/server/db/schema/billing"
import { users } from "@/server/db/schema/user"
import { adminProcedure, createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { getStripeClient, isStripeConfigured } from "@/server/billing/stripe"
import { ensureBillingCatalog, getEffectiveBillingPlan } from "@/server/services/billing-catalog"
import { getAiUsageSnapshot } from "@/server/services/ai-usage"
import { getCtxUserId } from "@/server/utils/user"

async function getOrCreateStripeCustomer ({ userId, email, database, stripe }: { userId: string; email?: string | null; database: typeof import("@/server/db").db; stripe: NonNullable<ReturnType<typeof getStripeClient>> }) {
  const storedCustomer = await database.query.billingCustomer.findFirst({
    where: eq(billingCustomer.userId, userId),
  })
  if (storedCustomer) return storedCustomer.stripeCustomerId

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { userId },
  })

  await database
    .insert(billingCustomer)
    .values({ userId, stripeCustomerId: customer.id })
    .onConflictDoNothing()

  const customerAfterInsert = await database.query.billingCustomer.findFirst({
    where: eq(billingCustomer.userId, userId),
  })

  return customerAfterInsert?.stripeCustomerId ?? customer.id
}

export const billingRouter = createTRPCRouter({
  getPlans: protectedProcedure.query(async ({ ctx }) => {
    const plans = await ensureBillingCatalog(ctx.db)
    return plans.map((plan) => ({
      key: plan.key,
      name: plan.name,
      description: plan.description,
      prices: plan.prices
        .filter((price) => price.active)
        .map(({ stripePriceId: _stripePriceId, ...price }) => price),
      entitlements: plan.entitlements,
    }))
  }),

  getMySubscription: protectedProcedure.query(async ({ ctx }) => {
    const userId = getCtxUserId(ctx)
    const { plan, subscription } = await getEffectiveBillingPlan(userId, ctx.db)
    return {
      plan: {
        key: plan.key,
        name: plan.name,
        description: plan.description,
      },
      subscription: subscription
        ? {
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            trialEnd: subscription.trialEnd,
          }
        : null,
    }
  }),

  getMyAiUsage: protectedProcedure.query(async ({ ctx }) => {
    return getAiUsageSnapshot(getCtxUserId(ctx), ctx.db)
  }),

  getOwnerRevenueSummary: adminProcedure.query(async ({ ctx }) => {
    const [revenue] = await ctx.db
      .select({
        grossAmount: sql<number>`coalesce(sum(${ownerRevenueLedger.grossAmount}), 0)`,
        taxAmount: sql<number>`coalesce(sum(${ownerRevenueLedger.taxAmount}), 0)`,
        feeAmount: sql<number>`coalesce(sum(${ownerRevenueLedger.feeAmount}), 0)`,
        netAmount: sql<number>`coalesce(sum(${ownerRevenueLedger.netAmount}), 0)`,
      })
      .from(ownerRevenueLedger)

    const activeSubscriptions = await ctx.db
      .select({ id: billingSubscription.id })
      .from(billingSubscription)
      .where(inArray(billingSubscription.status, ["active", "trialing"]))

    const [aiCost] = await ctx.db
      .select({ estimatedCostMicros: sql<number>`coalesce(sum(${aiUsagePeriod.estimatedCostMicros}), 0)` })
      .from(aiUsagePeriod)

    return {
      grossAmount: Number(revenue?.grossAmount ?? 0),
      taxAmount: Number(revenue?.taxAmount ?? 0),
      feeAmount: Number(revenue?.feeAmount ?? 0),
      netAmount: Number(revenue?.netAmount ?? 0),
      activeSubscriptions: activeSubscriptions.length,
      estimatedAiCostMicros: Number(aiCost?.estimatedCostMicros ?? 0),
      currency: "sek",
      aiCostCurrency: "usd",
    }
  }),

  createCheckoutSession: protectedProcedure
    .input(z.object({ interval: z.enum(["month", "year"]) }))
    .mutation(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      const stripe = getStripeClient()
      if (!stripe || !isStripeConfigured()) {
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Billing is not configured on the server yet.",
        })
      }

      const plans = await ensureBillingCatalog(ctx.db)
      const { subscription } = await getEffectiveBillingPlan(userId, ctx.db)
      if (subscription) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You already have an active subscription. Manage it through the billing portal.",
        })
      }
      const proPlan = plans.find((plan) => plan.key === "pro")
      const price = proPlan?.prices.find((candidate) => candidate.active && candidate.interval === input.interval)
      if (!price) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This billing option is not configured yet.",
        })
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { email: true },
      })
      const customerId = await getOrCreateStripeCustomer({
        userId,
        email: user?.email ?? ctx.session.user.email,
        database: ctx.db,
        stripe,
      })

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: price.stripePriceId, quantity: 1 }],
        allow_promotion_codes: true,
        automatic_tax: { enabled: env.STRIPE_TAX_ENABLED === "true" },
        subscription_data: {
          metadata: {
            userId,
            planKey: "pro",
          },
        },
        metadata: {
          userId,
          planKey: "pro",
        },
        success_url: `${env.HOST_URL}/user/settings/billing?checkout=success`,
        cancel_url: `${env.HOST_URL}/user/settings/billing?checkout=cancelled`,
      })

      if (!checkoutSession.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe did not return a checkout URL.",
        })
      }

      return { url: checkoutSession.url }
    }),

  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = getCtxUserId(ctx)
    const stripe = getStripeClient()
    if (!stripe || !isStripeConfigured()) {
      throw new TRPCError({
        code: "SERVICE_UNAVAILABLE",
        message: "Billing is not configured on the server yet.",
      })
    }

    const customer = await ctx.db.query.billingCustomer.findFirst({
      where: eq(billingCustomer.userId, userId),
    })
    if (!customer) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No billing account exists yet. Start a subscription first.",
      })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: `${env.HOST_URL}/user/settings/billing`,
    })

    return { url: portalSession.url }
  }),
})
