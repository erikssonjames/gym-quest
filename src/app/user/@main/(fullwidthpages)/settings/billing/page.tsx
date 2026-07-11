"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Check, CreditCard, ExternalLink, Gauge, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/trpc/react"

function formatPrice (amount: number, currency: string) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

function formatTokens (tokens: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(tokens)
}

export default function BillingSettings () {
  const searchParams = useSearchParams()
  const [actionError, setActionError] = React.useState<string | null>(null)
  const { data: plans, isPending: plansPending } = api.billing.getPlans.useQuery()
  const { data: subscription, isPending: subscriptionPending } = api.billing.getMySubscription.useQuery()
  const { data: usage, isPending: usagePending } = api.billing.getMyAiUsage.useQuery()
  const checkout = api.billing.createCheckoutSession.useMutation({
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (error) => setActionError(error.message),
  })
  const portal = api.billing.createPortalSession.useMutation({
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (error) => setActionError(error.message),
  })

  const proPlan = plans?.find((plan) => plan.key === "pro")
  const monthlyPrice = proPlan?.prices.find((price) => price.interval === "month")
  const annualPrice = proPlan?.prices.find((price) => price.interval === "year")
  const usedPercentage = usage && usage.quotaTokens > 0
    ? Math.min(100, (usage.usedTokens + usage.reservedTokens) / usage.quotaTokens * 100)
    : 0
  const isPro = subscription?.plan.key === "pro"
  const checkoutState = searchParams.get("checkout")

  if (plansPending || subscriptionPending || usagePending) {
    return <div className="space-y-4"><Skeleton className="h-40 w-full rounded-xl" /><Skeleton className="h-64 w-full rounded-xl" /><Skeleton className="h-48 w-full rounded-xl" /></div>
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/20 bg-primary/[0.03]">
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CreditCard className="size-5" /></div>
            <div>
              <CardTitle>Billing & AI capacity</CardTitle>
              <CardDescription className="mt-1">Manage your plan, AI allowance, and payment settings from one place.</CardDescription>
            </div>
          </div>
          <Badge variant={isPro ? "default" : "secondary"}>{subscription?.plan.name ?? "Free"}</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-background/70 p-4"><p className="text-xs text-muted-foreground">Current plan</p><p className="mt-1 text-lg font-semibold">{subscription?.plan.name}</p><p className="mt-1 text-sm text-muted-foreground">{subscription?.plan.description}</p></div>
          <div className="rounded-xl border bg-background/70 p-4"><p className="text-xs text-muted-foreground">AI allowance</p><p className="mt-1 text-lg font-semibold">{usage ? formatTokens(usage.quotaTokens) : "--"} tokens</p><p className="mt-1 text-sm text-muted-foreground">Resets {usage ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(usage.periodEnd)) : "with your period"}.</p></div>
          <div className="rounded-xl border bg-background/70 p-4"><p className="text-xs text-muted-foreground">Subscription status</p><p className="mt-1 text-lg font-semibold">{subscription?.subscription?.status ?? "No subscription"}</p><p className="mt-1 text-sm text-muted-foreground">{subscription?.subscription?.cancelAtPeriodEnd ? "Cancels at period end" : isPro ? "Renews automatically" : "No recurring charge"}</p></div>
        </CardContent>
      </Card>

      {checkoutState === "success" && <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm">Checkout completed. Your plan will update as soon as Stripe confirms the subscription.</div>}
      {checkoutState === "cancelled" && <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">Checkout was cancelled. No changes were made.</div>}
      {actionError && <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{actionError}</div>}

      <Card>
        <CardHeader><CardTitle>AI usage this period</CardTitle><CardDescription>Usage is counted on the backend using Gemini's reported input and output tokens. Short bursts are rate-limited separately.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between gap-4"><div><p className="text-2xl font-semibold">{usage ? formatTokens(usage.usedTokens + usage.reservedTokens) : "--"} <span className="text-base font-normal text-muted-foreground">of {usage ? formatTokens(usage.quotaTokens) : "--"}</span></p><p className="text-sm text-muted-foreground">{usage?.requestCount ?? 0} completed requests this period</p></div><Gauge className="size-6 text-primary" /></div>
          <Progress value={usedPercentage} aria-label="AI token usage" />
          <p className="text-xs text-muted-foreground">Reserved tokens are held briefly while a request is running, which prevents concurrent requests from exceeding the limit.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Free</CardTitle><CardDescription>Everything needed to start building a consistent training habit.</CardDescription></CardHeader>
          <CardContent className="space-y-4"><div className="text-3xl font-semibold">{formatTokens(25_000)} <span className="text-sm font-normal text-muted-foreground">AI tokens / month</span></div><ul className="space-y-2 text-sm text-muted-foreground"><li className="flex gap-2"><Check className="size-4 shrink-0 text-primary" />Manual workout builder</li><li className="flex gap-2"><Check className="size-4 shrink-0 text-primary" />AI clarification and draft flow</li><li className="flex gap-2"><Check className="size-4 shrink-0 text-primary" />Progress and community features</li></ul>{!isPro && <Badge variant="secondary">Current plan</Badge>}</CardContent>
        </Card>
        <Card className="border-primary/40 bg-primary/[0.03]">
          <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-primary" />Pro</CardTitle><Badge>Recommended</Badge></div><CardDescription>{proPlan?.description ?? "More room to plan and progress."}</CardDescription></CardHeader>
          <CardContent className="space-y-4"><div className="flex flex-wrap items-baseline gap-x-4 gap-y-1"><div className="text-3xl font-semibold">{monthlyPrice ? formatPrice(monthlyPrice.amount, monthlyPrice.currency) : "Configure Stripe"}<span className="text-sm font-normal text-muted-foreground"> / month</span></div>{annualPrice && <span className="text-sm text-muted-foreground">or {formatPrice(annualPrice.amount, annualPrice.currency)} / year</span>}</div><ul className="space-y-2 text-sm text-muted-foreground"><li className="flex gap-2"><Check className="size-4 shrink-0 text-primary" />{formatTokens(250_000)} AI tokens / month</li><li className="flex gap-2"><Check className="size-4 shrink-0 text-primary" />Stronger workout planner model</li><li className="flex gap-2"><Check className="size-4 shrink-0 text-primary" />Advanced analytics entitlement</li></ul>{isPro ? <Button variant="outline" onClick={() => { setActionError(null); portal.mutate() }} disabled={portal.isPending}><ExternalLink />Manage subscription</Button> : <div className="flex flex-wrap gap-2"><Button onClick={() => { setActionError(null); checkout.mutate({ interval: "month" }) }} disabled={checkout.isPending || !monthlyPrice}>{checkout.isPending ? "Opening checkout..." : "Choose monthly"}</Button><Button variant="outline" onClick={() => { setActionError(null); checkout.mutate({ interval: "year" }) }} disabled={checkout.isPending || !annualPrice}>Choose annual</Button></div>}</CardContent>
        </Card>
      </div>
    </div>
  )
}
