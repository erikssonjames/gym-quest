import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { and, eq } from "drizzle-orm"

import { env } from "@/env"
import { getStripeClient } from "@/server/billing/stripe"
import { db } from "@/server/db"
import { billingCustomer, billingPrice, billingSubscription, billingSubscriptionEvent, ownerRevenueLedger } from "@/server/db/schema/billing"
import { ensureBillingCatalog } from "@/server/services/billing-catalog"

function getStripeObjectId (value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id
}

async function findUserIdForCustomer (customerId: string, metadata?: Stripe.Metadata) {
  if (metadata?.userId) return metadata.userId

  const customer = await db.query.billingCustomer.findFirst({
    where: eq(billingCustomer.stripeCustomerId, customerId),
  })
  return customer?.userId
}

async function handleCheckoutCompleted (session: Stripe.Checkout.Session) {
  const customerId = getStripeObjectId(session.customer)
  const userId = session.metadata?.userId
  if (!customerId || !userId) return

  await db
    .insert(billingCustomer)
    .values({ userId, stripeCustomerId: customerId })
    .onConflictDoNothing()
}

async function handleSubscriptionEvent (subscription: Stripe.Subscription, eventType: string) {
  const customerId = getStripeObjectId(subscription.customer)
  if (!customerId) throw new Error("Stripe subscription has no customer.")

  const userId = await findUserIdForCustomer(customerId, subscription.metadata)
  if (!userId) throw new Error("Could not map Stripe subscription to a GymQuest user.")

  const subscriptionItem = subscription.items.data[0]
  if (!subscriptionItem) throw new Error("Stripe subscription has no price item.")

  await ensureBillingCatalog(db)
  const price = await db.query.billingPrice.findFirst({
    where: eq(billingPrice.stripePriceId, subscriptionItem.price.id),
  })
  if (!price) throw new Error("Stripe price is not present in the GymQuest billing catalog.")

  const periodStart = subscriptionItem.current_period_start ?? subscription.start_date
  const periodEnd = subscriptionItem.current_period_end ?? periodStart
  const status = eventType === "customer.subscription.deleted" ? "canceled" : subscription.status

  await db
    .insert(billingSubscription)
    .values({
      userId,
      planId: price.planId,
      stripeSubscriptionId: subscription.id,
      status,
      currentPeriodStart: new Date(periodStart * 1000),
      currentPeriodEnd: new Date(periodEnd * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: billingSubscription.stripeSubscriptionId,
      set: {
        planId: price.planId,
        status,
        currentPeriodStart: new Date(periodStart * 1000),
        currentPeriodEnd: new Date(periodEnd * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        updatedAt: new Date(),
      },
    })
}

async function handleInvoiceEvent (invoice: Stripe.Invoice, event: Stripe.Event) {
  const isPaid = event.type === "invoice.paid"
  const grossAmount = isPaid ? invoice.amount_paid : 0
  const taxAmount = isPaid ? invoice.total_taxes?.reduce((total, tax) => total + tax.amount, 0) ?? 0 : 0

  await db
    .insert(ownerRevenueLedger)
    .values({
      stripeEventId: event.id,
      stripeInvoiceId: invoice.id,
      entryType: isPaid ? "invoice_paid" : "invoice_payment_failed",
      grossAmount,
      taxAmount,
      netAmount: grossAmount - taxAmount,
      currency: invoice.currency,
      status: invoice.status ?? event.type,
      occurredAt: new Date(event.created * 1000),
    })
    .onConflictDoNothing()
}

async function processEvent (event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      return
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionEvent(event.data.object as Stripe.Subscription, event.type)
      return
    case "invoice.paid":
    case "invoice.payment_failed":
      await handleInvoiceEvent(event.data.object as Stripe.Invoice, event)
  }
}

export async function POST (request: Request) {
  const stripe = getStripeClient()
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 })
  }

  const payload = await request.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 })
  }

  const payloadHash = createHash("sha256").update(payload).digest("hex")
  const existing = await db.query.billingSubscriptionEvent.findFirst({
    where: eq(billingSubscriptionEvent.stripeEventId, event.id),
  })

  if (existing?.status === "completed") {
    return NextResponse.json({ received: true })
  }

  if (existing?.status === "processing") {
    return NextResponse.json({ received: true })
  }

  if (!existing) {
    await db
      .insert(billingSubscriptionEvent)
      .values({
        stripeEventId: event.id,
        eventType: event.type,
        payloadHash,
        status: "processing",
      })
      .onConflictDoNothing()
  } else {
    await db
      .update(billingSubscriptionEvent)
      .set({ status: "processing", errorMessage: null, payloadHash })
      .where(and(eq(billingSubscriptionEvent.id, existing.id), eq(billingSubscriptionEvent.status, "failed")))
  }

  try {
    await processEvent(event)
    await db
      .update(billingSubscriptionEvent)
      .set({ status: "completed", processedAt: new Date(), errorMessage: null })
      .where(eq(billingSubscriptionEvent.stripeEventId, event.id))
    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Stripe webhook error."
    await db
      .update(billingSubscriptionEvent)
      .set({ status: "failed", errorMessage: message })
      .where(eq(billingSubscriptionEvent.stripeEventId, event.id))
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 })
  }
}
