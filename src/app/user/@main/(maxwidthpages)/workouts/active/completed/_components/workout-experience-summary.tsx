"use client"

import { animate as animateValue, motion, useReducedMotion } from "framer-motion"
import { ShieldAlert, Sparkles, Star, Trophy, Zap } from "lucide-react"
import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { WorkoutExperienceBreakdown } from "@/lib/experience"

type Progression = {
  level: number
  totalExperience: number
  experienceIntoLevel: number
  experienceForLevel: number
  experienceToNextLevel: number
  progressPercent: number
}

type ReviewStatus = "pending" | "approved" | "rejected" | null

export function WorkoutExperienceSummary({
  afterProgression,
  beforeProgression,
  experience,
  reviewStatus,
}: {
  afterProgression: Progression
  beforeProgression: Progression
  experience: WorkoutExperienceBreakdown
  reviewStatus: ReviewStatus
}) {
  const reduceMotion = useReducedMotion()
  const experienceAwarded = reviewStatus === "pending" || reviewStatus === "rejected"
    ? 0
    : experience.total
  const leveledUp = afterProgression.level > beforeProgression.level
  const [displayExperience, setDisplayExperience] = useState(
    reduceMotion ? experienceAwarded : 0,
  )
  const [displayProgress, setDisplayProgress] = useState(
    reduceMotion ? afterProgression.progressPercent : beforeProgression.progressPercent,
  )
  const [displayLevel, setDisplayLevel] = useState(
    reduceMotion ? afterProgression.level : beforeProgression.level,
  )

  useEffect(() => {
    if (reduceMotion || experienceAwarded === 0) {
      setDisplayExperience(experienceAwarded)
      setDisplayProgress(afterProgression.progressPercent)
      setDisplayLevel(afterProgression.level)
      return
    }

    const counter = animateValue(0, experienceAwarded, {
      delay: 0.3,
      duration: 1.35,
      ease: "easeOut",
      onUpdate: (value) => setDisplayExperience(Math.round(value)),
    })
    const revealTimers = leveledUp
      ? [
          window.setTimeout(() => setDisplayProgress(100), 650),
          window.setTimeout(() => {
            setDisplayLevel(afterProgression.level)
            setDisplayProgress(0)
          }, 1_250),
          window.setTimeout(() => setDisplayProgress(afterProgression.progressPercent), 1_400),
        ]
      : [window.setTimeout(() => setDisplayProgress(afterProgression.progressPercent), 850)]

    return () => {
      counter.stop()
      revealTimers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [afterProgression.level, afterProgression.progressPercent, experienceAwarded, leveledUp, reduceMotion])

  const sources = [
    { label: "Finish", value: experience.finish },
    { label: "Completed sets", value: experience.sets },
    { label: "Repetitions", value: experience.reps },
    { label: "Weight moved", value: experience.volume },
    { label: "Active time", value: experience.activeTime },
  ]
  return (
    <Card className="relative mt-6 overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 via-warning/10 to-success/15 shadow-lg shadow-primary/10">
      <CelebrationSparkles reduceMotion={Boolean(reduceMotion)} />

      <CardContent className="relative space-y-6 p-5 sm:p-7">
        {reviewStatus === "pending" && (
          <Alert className="border-warning/40 bg-background/80 backdrop-blur-sm">
            <ShieldAlert className="size-4 text-warning" />
            <AlertTitle>XP is pending review</AlertTitle>
            <AlertDescription>
              Your workout is saved. An unusual metric triggered a safety check, so no XP,
              quest progress, or training achievements will be awarded until an admin approves it.
            </AlertDescription>
          </Alert>
        )}
        {reviewStatus === "rejected" && (
          <Alert className="border-danger/40 bg-background/80" variant="destructive">
            <ShieldAlert className="size-4" />
            <AlertTitle>Workout XP was not awarded</AlertTitle>
            <AlertDescription>
              An admin reviewed this workout and rejected its progression rewards.
            </AlertDescription>
          </Alert>
        )}

        <motion.div
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
          className="flex flex-col items-center text-center"
          initial={reduceMotion ? undefined : { opacity: 0, scale: 0.85, y: 16 }}
          transition={{ duration: 0.55, type: "spring" }}
        >
          <Badge
            className="gap-1.5 px-3 py-1"
            variant={reviewStatus === "pending" ? "warning" : reviewStatus === "rejected" ? "danger" : "success"}
          >
            <Sparkles className="size-3.5" />
            {reviewStatus === "pending"
              ? "Safety check in progress"
              : reviewStatus === "rejected"
                ? "Reviewed"
                : "Workout cleared"}
          </Badge>

          <div className="mt-4 flex items-center gap-2 text-primary">
            <Zap className="size-8 fill-current" />
            <p
              aria-label={`${experienceAwarded.toLocaleString()} workout XP earned`}
              aria-live="polite"
              className="text-5xl font-black tracking-tight tabular-nums sm:text-7xl"
            >
              +{displayExperience.toLocaleString()}
              <span className="ml-2 text-2xl font-bold sm:text-3xl">XP</span>
            </p>
          </div>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
            {reviewStatus === "pending"
              ? `${experience.total.toLocaleString()} XP will be awarded if this workout is approved.`
              : reviewStatus === "rejected"
                ? "This workout did not change your XP total."
                : "Every completed set pushed your adventure forward."}
          </p>
        </motion.div>

        {leveledUp && experienceAwarded > 0 && (
          <motion.div
            animate={reduceMotion ? undefined : { opacity: 1, rotate: 0, scale: 1 }}
            className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-xl border border-warning/40 bg-warning/15 p-4 text-warning"
            initial={reduceMotion ? undefined : { opacity: 0, rotate: -3, scale: 0.8 }}
            transition={{ delay: 0.9, duration: 0.65, type: "spring" }}
          >
            <Trophy className="size-8" />
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-widest">Level up!</p>
              <p className="text-xl font-black text-foreground">Level {afterProgression.level}</p>
            </div>
          </motion.div>
        )}

        <div className="rounded-xl border bg-background/75 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Adventure progress</p>
              <p className="mt-1 text-xl font-bold">Level {displayLevel}</p>
            </div>
            <p className="text-right text-sm tabular-nums text-muted-foreground">
              <span className="font-semibold text-foreground">
                {afterProgression.experienceIntoLevel.toLocaleString()}
              </span>
              /{afterProgression.experienceForLevel.toLocaleString()} XP
            </p>
          </div>
          <Progress
            aria-label={`Level ${afterProgression.level} progress`}
            className="h-4 shadow-inner"
            value={displayProgress}
            variant={leveledUp ? "warning" : "default"}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{afterProgression.totalExperience.toLocaleString()} total XP</span>
            <span>{afterProgression.experienceToNextLevel.toLocaleString()} XP to next level</span>
          </div>
        </div>

        <motion.div
          animate={reduceMotion ? undefined : "visible"}
          className="grid grid-cols-2 gap-2 sm:grid-cols-5"
          initial={reduceMotion ? undefined : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { delayChildren: 0.45, staggerChildren: 0.1 } },
          }}
        >
          {sources.map((source) => (
            <motion.div
              className="rounded-lg border bg-background/75 p-3 text-center shadow-sm backdrop-blur-sm"
              key={source.label}
              variants={{
                hidden: { opacity: 0, scale: 0.8, y: 12 },
                visible: { opacity: 1, scale: 1, y: 0 },
              }}
            >
              <p className="text-xs text-muted-foreground">{source.label}</p>
              <p className="mt-1 font-bold tabular-nums text-primary">
                +{source.value.toLocaleString()} XP
              </p>
            </motion.div>
          ))}
        </motion.div>

        {experience.wasCapped && (
          <p className="text-center text-xs text-muted-foreground">
            The 2,000 XP workout cap was applied.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function CelebrationSparkles({ reduceMotion }: { reduceMotion: boolean }) {
  const sparkles = [
    { className: "left-[7%] top-12 text-warning", delay: 0, icon: Star },
    { className: "right-[8%] top-16 text-primary", delay: 0.25, icon: Sparkles },
    { className: "left-[16%] top-[42%] text-success", delay: 0.5, icon: Sparkles },
    { className: "right-[14%] top-[48%] text-info", delay: 0.75, icon: Star },
  ]

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={reduceMotion ? undefined : { opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.12, 0.9] }}
        className="absolute left-1/2 top-20 size-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        transition={{ duration: 3, repeat: Infinity }}
      />
      {sparkles.map(({ className, delay, icon: Icon }) => (
        <motion.div
          animate={reduceMotion ? undefined : {
            opacity: [0.25, 1, 0.25],
            rotate: [0, 180, 360],
            scale: [0.7, 1.25, 0.7],
            y: [0, -12, 0],
          }}
          className={`absolute ${className}`}
          key={className}
          transition={{ delay, duration: 2.5, repeat: Infinity }}
        >
          <Icon className="size-6 fill-current" />
        </motion.div>
      ))}
    </div>
  )
}
