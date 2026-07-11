import Stripe from "stripe"

import { env } from "@/env"

let stripeClient: Stripe | null = null

export function getStripeClient () {
  if (!env.STRIPE_SECRET_KEY) return null

  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY)
  return stripeClient
}

export function isStripeConfigured () {
  return Boolean(env.STRIPE_SECRET_KEY)
}
