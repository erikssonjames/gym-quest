"use client"

import { BadgeDollarSign, Bot, CreditCard, ReceiptText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageShell } from "@/app/user/@main/_components/page-shell"
import { api } from "@/trpc/react"

function formatAmount (amount: number, currency: string) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

function formatUsdMicros (amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount / 1_000_000)
}

export default function AdminBillingPage () {
  const { data, isPending } = api.billing.getOwnerRevenueSummary.useQuery()

  if (isPending) {
    return <PageShell eyebrow="Admin" title="Billing overview" description="Track subscription revenue and AI operating cost."><div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-32 rounded-xl" /></div></PageShell>
  }

  return (
    <PageShell eyebrow="Admin" title="Billing overview" description="Track subscription revenue and AI operating cost. Stripe remains the source of truth for payments; this view is the app's reconciliation layer.">
      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard icon={<BadgeDollarSign className="size-5" />} label="Gross collected" value={data ? formatAmount(data.grossAmount, data.currency) : "--"} detail="Paid invoice totals before tax and fees" />
        <SummaryCard icon={<ReceiptText className="size-5" />} label="Owner net" value={data ? formatAmount(data.netAmount, data.currency) : "--"} detail="Gross less tracked tax and fee amounts" />
        <SummaryCard icon={<CreditCard className="size-5" />} label="Active subscriptions" value={data?.activeSubscriptions.toLocaleString() ?? "--"} detail="Active and trialing subscriptions" />
        <SummaryCard icon={<Bot className="size-5" />} label="Estimated AI cost" value={data ? formatUsdMicros(data.estimatedAiCostMicros) : "--"} detail="Gemini estimate, currently tracked in USD" />
      </div>
      <Card>
        <CardHeader><div className="flex items-center justify-between gap-4"><div><CardTitle>Reconciliation notes</CardTitle><CardDescription>The ledger is intentionally separated from subscription state so refunds, taxes, fees, and future payouts can be reconciled independently.</CardDescription></div><Badge variant="secondary">Foundation live</Badge></div></CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3"><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Tax tracked</p><p className="mt-1 font-medium">{data ? formatAmount(data.taxAmount, data.currency) : "--"}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Fees tracked</p><p className="mt-1 font-medium">{data ? formatAmount(data.feeAmount, data.currency) : "--"}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Next hardening</p><p className="mt-1 font-medium">Stripe balance reconciliation</p></div></CardContent>
      </Card>
    </PageShell>
  )
}

function SummaryCard ({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <Card><CardHeader className="gap-3"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div><div><CardDescription>{label}</CardDescription><CardTitle className="mt-1 text-2xl">{value}</CardTitle></div></div></CardHeader><CardContent className="pt-0 text-sm text-muted-foreground">{detail}</CardContent></Card>
}
