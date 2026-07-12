"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Check, Scale, TrendingDown, TrendingUp } from "lucide-react"
import { toast } from "sonner"

import { MetricCard, PageSection, PageShell } from "@/app/user/@main/_components/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { api } from "@/trpc/react"
import { calculateGoalProgress, parseWeightInput } from "@/lib/weight-progress"

function formatWeight(value: number | null | undefined) {
  return value == null ? "—" : `${value.toFixed(1)} kg`
}

function getGoalTrendTone({
  previousWeight,
  currentWeight,
  goalWeight,
}: {
  previousWeight: number | null | undefined
  currentWeight: number | null | undefined
  goalWeight: number | null | undefined
}) {
  if (previousWeight == null || currentWeight == null || goalWeight == null) return "info" as const

  const previousDistance = Math.abs(previousWeight - goalWeight)
  const currentDistance = Math.abs(currentWeight - goalWeight)

  if (currentDistance < previousDistance) return "success" as const
  if (currentDistance > previousDistance) return "danger" as const
  return "info" as const
}

export default function WeightProgressPage() {
  const utils = api.useUtils()
  const localDate = format(new Date(), "yyyy-MM-dd")
  const { data, isPending } = api.weight.getOverview.useQuery()
  const [weightInput, setWeightInput] = useState("")
  const [goalInput, setGoalInput] = useState("")

  const entries = data?.entries ?? []
  const currentEntry = entries[0]
  const startingEntry = entries.at(-1)
  const todayEntry = entries.find((entry) => entry.recordedOn === localDate)
  const currentWeight = currentEntry?.weightKg ?? null
  const startingWeight = startingEntry?.weightKg ?? null
  const goalWeight = data?.goalWeightKg ?? null
  const totalChange = currentWeight != null && startingWeight != null
    ? currentWeight - startingWeight
    : null

  const goalProgress = calculateGoalProgress({ startingWeight, currentWeight, goalWeight })
  const trendTone = getGoalTrendTone({
    previousWeight: startingWeight,
    currentWeight,
    goalWeight,
  })

  const invalidateWeightData = async () => {
    await Promise.all([
      utils.weight.getOverview.invalidate(),
      utils.weight.getReminderStatus.invalidate(),
    ])
  }

  const { mutate: saveWeight, isPending: isSavingWeight } = api.weight.upsertEntry.useMutation({
    onSuccess: async () => {
      setWeightInput("")
      await invalidateWeightData()
      toast.success(todayEntry ? "Today's weight was updated." : "Today's weight was logged.")
    },
    onError: (error) => toast.error(error.message),
  })

  const { mutate: saveGoal, isPending: isSavingGoal } = api.weight.setGoal.useMutation({
    onSuccess: async () => {
      setGoalInput("")
      await invalidateWeightData()
      toast.success("Weight goal updated.")
    },
    onError: (error) => toast.error(error.message),
  })

  const { mutate: setReminder, isPending: isSavingReminder } = api.weight.setReminder.useMutation({
    onSuccess: async ({ enabled }) => {
      await invalidateWeightData()
      toast.success(enabled ? "Daily navbar reminder enabled." : "Daily reminder disabled.")
    },
    onError: (error) => toast.error(error.message),
  })

  const submitWeight = () => {
    const weightKg = parseWeightInput(weightInput)
    if (weightKg == null) {
      toast.error("Enter a weight between 20 and 500 kg.")
      return
    }
    saveWeight({ recordedOn: localDate, weightKg })
  }

  const submitGoal = () => {
    const weightKg = parseWeightInput(goalInput)
    if (weightKg == null) {
      toast.error("Enter a goal between 20 and 500 kg.")
      return
    }
    saveGoal({ weightKg })
  }

  return (
    <PageShell
      eyebrow="Body progress"
      title="Weight tracking"
      description="Log one measurement a day, keep a target in view, and follow the trend without overreacting to a single reading."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard tone="info" label="Current weight" value={isPending ? "…" : formatWeight(currentWeight)} detail={currentEntry ? format(parseISO(currentEntry.recordedOn), "MMM d, yyyy") : "No entries yet"} />
        <MetricCard tone="warning" label="Goal" value={isPending ? "…" : formatWeight(goalWeight)} detail={goalWeight == null ? "Set your target below" : "Your current target"} />
        <MetricCard
          tone={totalChange == null ? "default" : trendTone}
          label="Change"
          value={isPending ? "…" : totalChange == null ? "—" : `${totalChange > 0 ? "+" : ""}${totalChange.toFixed(1)} kg`}
          detail={entries.length > 1 ? `Across ${entries.length} daily entries` : "Log at least twice to see change"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <CardTitle>Today’s check-in</CardTitle>
                <CardDescription>{format(new Date(), "EEEE, MMMM d")}</CardDescription>
              </div>
              {todayEntry && (
                <Badge variant="success">
                  <Check />
                  Logged
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="daily-weight">Weight in kilograms</FieldLabel>
                <FieldContent>
                  <Input
                    id="daily-weight"
                    type="number"
                    inputMode="decimal"
                    min={20}
                    max={500}
                    step="0.1"
                    value={weightInput}
                    onChange={(event) => setWeightInput(event.target.value)}
                    placeholder={todayEntry ? todayEntry.weightKg.toFixed(1) : currentWeight?.toFixed(1) ?? "75.0"}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") submitWeight()
                    }}
                  />
                  <FieldDescription>
                    {todayEntry ? "Saving again replaces today’s measurement." : "One entry per local calendar day."}
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button onClick={submitWeight} disabled={isSavingWeight || !weightInput}>
              <Scale data-icon="inline-start" />
              {todayEntry ? "Update today" : "Log today"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal and reminder</CardTitle>
            <CardDescription>Keep the next action easy to find.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Field>
              <FieldLabel htmlFor="weight-goal">Goal weight</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id="weight-goal"
                    type="number"
                    inputMode="decimal"
                    min={20}
                    max={500}
                    step="0.1"
                    value={goalInput}
                    onChange={(event) => setGoalInput(event.target.value)}
                    placeholder={goalWeight?.toFixed(1) ?? "70.0"}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") submitGoal()
                    }}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton onClick={submitGoal} disabled={isSavingGoal || !goalInput}>
                      Set goal
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
            </Field>

            <Field orientation="horizontal">
              <Switch
                id="weight-reminder"
                checked={data?.reminderEnabled ?? false}
                disabled={isPending || isSavingReminder}
                onCheckedChange={(enabled) => setReminder({ enabled })}
              />
              <FieldContent>
                <FieldLabel htmlFor="weight-reminder">Daily navbar reminder</FieldLabel>
                <FieldDescription>Shown until today’s weight has been logged.</FieldDescription>
              </FieldContent>
            </Field>
          </CardContent>
        </Card>
      </div>

      <PageSection title="Progress" description="Daily changes are normal. The longer trend matters more.">
        {isPending ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : entries.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Scale /></EmptyMedia>
              <EmptyTitle>Your progress starts with one entry</EmptyTitle>
              <EmptyDescription>Log today’s weight to establish a baseline.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <CardTitle>Goal progress</CardTitle>
                  <CardDescription>
                    {goalWeight == null
                      ? "Set a goal to see completion progress."
                      : `${formatWeight(currentWeight)} now · ${formatWeight(goalWeight)} target`}
                  </CardDescription>
                </div>
                {totalChange != null && (
                  <Badge variant={trendTone}>
                    {totalChange <= 0 ? <TrendingDown /> : <TrendingUp />}
                    {Math.abs(totalChange).toFixed(1)} kg
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {goalProgress != null && (
                <div className="flex flex-col gap-2">
                  <Progress value={goalProgress} variant="success" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatWeight(startingWeight)}</span>
                    <span>{Math.round(goalProgress)}%</span>
                    <span>{formatWeight(goalWeight)}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                {entries.slice(0, 14).map((entry, index) => {
                  const olderEntry = entries[index + 1]
                  const change = olderEntry ? entry.weightKg - olderEntry.weightKg : null
                  const entryTrendTone = getGoalTrendTone({
                    previousWeight: olderEntry?.weightKg,
                    currentWeight: entry.weightKg,
                    goalWeight,
                  })
                  return (
                    <div key={entry.id}>
                      <div className="flex items-center justify-between gap-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium">{format(parseISO(entry.recordedOn), "EEEE, MMM d")}</p>
                          <p className="text-xs text-muted-foreground">{entry.recordedOn}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {change != null && (
                            <Badge variant={change === 0 ? "secondary" : entryTrendTone}>
                              {change > 0 ? "+" : ""}{change.toFixed(1)} kg
                            </Badge>
                          )}
                          <p className="font-semibold tabular-nums">{entry.weightKg.toFixed(1)} kg</p>
                        </div>
                      </div>
                      {index < Math.min(entries.length, 14) - 1 && <Separator />}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </PageSection>
    </PageShell>
  )
}
