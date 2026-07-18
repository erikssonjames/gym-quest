"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Timer from "@/components/ui/timer";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  Check,
  CircleGauge,
  Dumbbell,
  Loader2,
  Play,
  SkipForward,
  TimerReset,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  deriveSessionProgress,
  getFollowingSessionItem,
  type ActiveSession,
  type SessionSequenceItem,
} from "./session-progress";

export default function WorkoutController() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: session } = api.workout.getActiveWorkoutSession.useQuery();

  const startWorkout = api.workout.startWorkoutSession.useMutation();
  const startLogs = api.workout.startWorkoutSessionLogs.useMutation();
  const startFragment =
    api.workout.startWorkoutSessionLogFragment.useMutation();
  const endFragment = api.workout.endWorkoutSessionLogFragment.useMutation();
  const skipFragment = api.workout.skipWorkoutSessionLogFragment.useMutation();
  const endWorkout = api.workout.endWorkoutSession.useMutation();

  const isPending = [
    startWorkout,
    startLogs,
    startFragment,
    endFragment,
    skipFragment,
    endWorkout,
  ].some((mutation) => mutation.isPending);

  const progress = useMemo(
    () => (session ? deriveSessionProgress(session) : null),
    [session],
  );

  const invalidateSession = useCallback(async () => {
    await utils.workout.getActiveWorkoutSession.invalidate();
  }, [utils]);

  const runAction = useCallback(async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the workout.",
      );
    }
  }, []);

  const startSessionItem = useCallback(
    async (item: SessionSequenceItem, invalidate = true) => {
      const logsToStart = item.groupLogs.filter(
        (log) => log.startedAt === null && log.endedAt === null,
      );

      if (logsToStart.length > 0) {
        await startLogs.mutateAsync(
          logsToStart.map((log) => ({
            workoutSessionId: log.workoutSessionId,
            workoutSessionLogId: log.id,
          })),
        );
      }

      await startFragment.mutateAsync({
        fragmentId: item.fragment.id,
        sessionId: item.log.workoutSessionId,
      });

      if (invalidate) await invalidateSession();
    },
    [invalidateSession, startFragment, startLogs],
  );

  if (!session || !progress) return null;

  const handleStartWorkout = () =>
    runAction(async () => {
      await startWorkout.mutateAsync(session.id);

      if (progress.nextItem) {
        await startSessionItem(progress.nextItem);
      } else {
        await invalidateSession();
      }
    });

  const handleStartSet = (item: SessionSequenceItem) =>
    runAction(async () => {
      await startSessionItem(item);
    });

  const handleSkipSet = (item: SessionSequenceItem) =>
    runAction(async () => {
      await skipFragment.mutateAsync({
        fragmentId: item.fragment.id,
        sessionId: session.id,
      });

      const followingItem = getFollowingSessionItem(session, item.fragment.id);
      const continuesSupersetRound =
        followingItem &&
        followingItem.groupOrder === item.groupOrder &&
        followingItem.roundIndex === item.roundIndex;

      if (followingItem && continuesSupersetRound) {
        await startSessionItem(followingItem);
      } else {
        await invalidateSession();
      }
    });

  const handleCompleteSet = (
    item: SessionSequenceItem,
    values: { reps: number; weight: number; duration: number },
  ) =>
    runAction(async () => {
      await endFragment.mutateAsync({
        sessionId: session.id,
        fragment: {
          ...item.fragment,
          reps: values.reps,
          weight: values.weight,
          duration: values.duration,
        },
      });

      const followingItem = getFollowingSessionItem(session, item.fragment.id);
      const continuesSupersetRound =
        followingItem &&
        followingItem.groupOrder === item.groupOrder &&
        followingItem.roundIndex === item.roundIndex;

      if (followingItem && continuesSupersetRound) {
        await startSessionItem(followingItem);
      } else {
        await invalidateSession();
      }
    });

  const handleEndWorkout = () =>
    runAction(async () => {
      const result = await endWorkout.mutateAsync(session.id);
      await invalidateSession();
      await Promise.all([
        utils.quests.getQuestBoard.invalidate(),
        utils.progression.getProgression.invalidate(),
        utils.badges.getBadgesWithProgress.invalidate(),
      ]);

      router.push(
        result
          ? `/user/workouts/active/completed/${result.sessionId}`
          : "/user/workouts",
      );
    });

  return (
    <SessionRunnerView
      isPending={isPending}
      onCompleteSet={handleCompleteSet}
      onEndWorkout={handleEndWorkout}
      onSkipSet={handleSkipSet}
      onStartSet={handleStartSet}
      onStartWorkout={handleStartWorkout}
      progress={progress}
      session={session}
    />
  );
}

export function SessionRunnerView({
  isPending,
  onCompleteSet,
  onEndWorkout,
  onSkipSet,
  onStartSet,
  onStartWorkout,
  progress,
  session,
}: {
  isPending: boolean;
  onCompleteSet: (
    item: SessionSequenceItem,
    values: { reps: number; weight: number; duration: number },
  ) => void;
  onEndWorkout: () => void;
  onSkipSet: (item: SessionSequenceItem) => void;
  onStartSet: (item: SessionSequenceItem) => void;
  onStartWorkout: () => void;
  progress: ReturnType<typeof deriveSessionProgress>;
  session: ActiveSession;
}) {
  return (
    <Card className="mt-5 overflow-hidden border-primary/20 shadow-sm">
      <SessionProgressHeader session={session} progress={progress} />
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        {progress.kind === "not_started" && (
          <StartWorkoutState
            hasPlan={progress.totalCount > 0}
            isPending={isPending}
            onStart={onStartWorkout}
          />
        )}

        {progress.kind === "empty" && <EmptyWorkoutState />}

        {progress.kind === "ready_set" && progress.nextItem && (
          <ReadySetState
            isPending={isPending}
            item={progress.nextItem}
            onSkip={() => onSkipSet(progress.nextItem!)}
            onStart={() => onStartSet(progress.nextItem!)}
            session={session}
          />
        )}

        {progress.kind === "active_set" && progress.nextItem && (
          <ActiveSetState
            isPending={isPending}
            item={progress.nextItem}
            key={progress.nextItem.fragment.id}
            onComplete={(values) => onCompleteSet(progress.nextItem!, values)}
            session={session}
          />
        )}

        <RestProgressState
          isPending={isPending}
          onSkipSet={onSkipSet}
          onStartSet={onStartSet}
          progress={progress}
        />

        {progress.kind === "workout_complete" && (
          <WorkoutCompleteState
            isPending={isPending}
            onEnd={onEndWorkout}
            performedCount={progress.performedCount}
          />
        )}
      </CardContent>
    </Card>
  );
}

function SessionProgressHeader({
  session,
  progress,
}: {
  session: ActiveSession;
  progress: ReturnType<typeof deriveSessionProgress>;
}) {
  const progressPercent =
    progress.totalCount > 0
      ? Math.round((progress.resolvedCount / progress.totalCount) * 100)
      : 0;

  return (
    <CardHeader className="space-y-3 p-4 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Now training
          </p>
          <p className="truncate text-lg font-semibold">
            {session.workout?.name ?? "Open workout"}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <CircleGauge className="size-4" />
          <span>
            {progress.resolvedCount}/{progress.totalCount} sets
          </span>
        </div>
      </div>
      <div
        aria-label={`${progressPercent}% of the session resolved`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progressPercent}
        className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
      >
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </CardHeader>
  );
}

function StartWorkoutState({
  hasPlan,
  isPending,
  onStart,
}: {
  hasPlan: boolean;
  isPending: boolean;
  onStart: () => void;
}) {
  return (
    <div className="py-3 text-center md:py-8">
      <Dumbbell className="mx-auto size-9 text-primary" />
      <h1 className="mt-4 text-xl font-semibold">Ready to train?</h1>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {hasPlan
          ? "Your first set will start with the session timer."
          : "Start the timer, then add your first exercise below."}
      </p>
      <Button
        className="mt-6 h-12 w-full max-w-sm"
        disabled={isPending}
        onClick={onStart}
      >
        {isPending ? <Loader2 className="animate-spin" /> : <Play />}
        Start workout
      </Button>
    </div>
  );
}

function EmptyWorkoutState() {
  return (
    <div className="py-5 text-center">
      <Dumbbell className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 font-semibold">Add your first exercise</p>
      <p className="mt-1 text-sm text-muted-foreground">
        The session timer is running. Use the session plan below to add a set.
      </p>
    </div>
  );
}

function ReadySetState({
  isPending,
  item,
  onSkip,
  onStart,
  session,
}: {
  isPending: boolean;
  item: SessionSequenceItem;
  onSkip: () => void;
  onStart: () => void;
  session: ActiveSession;
}) {
  return (
    <div>
      <SetHeading item={item} />
      <TargetMetrics item={item} />
      <PreviousPerformance item={item} session={session} />
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button className="h-12 flex-1" disabled={isPending} onClick={onStart}>
          {isPending ? <Loader2 className="animate-spin" /> : <Play />}
          Start set
        </Button>
        <Button
          className="h-12"
          disabled={isPending}
          onClick={onSkip}
          variant="outline"
        >
          <SkipForward />
          Skip set
        </Button>
      </div>
    </div>
  );
}

function ActiveSetState({
  isPending,
  item,
  onComplete,
  session,
}: {
  isPending: boolean;
  item: SessionSequenceItem;
  onComplete: (values: {
    reps: number;
    weight: number;
    duration: number;
  }) => void;
  session: ActiveSession;
}) {
  const previousValues = getPreviousValues(session, item);
  const [reps, setReps] = useState(item.fragment.reps);
  const [weight, setWeight] = useState(
    item.fragment.weight || Math.round(previousValues?.weight ?? 0),
  );
  const [duration, setDuration] = useState(item.fragment.duration);

  const completeSet = () => {
    const elapsedSeconds = item.fragment.startedAt
      ? (Date.now() - item.fragment.startedAt.getTime()) / 1000
      : 0;
    const automaticDuration = Math.max(0, Math.round(elapsedSeconds));

    onComplete({
      duration: duration || automaticDuration,
      reps: Math.max(0, reps),
      weight: Math.max(0, weight),
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <SetHeading item={item} />
        <div className="flex flex-shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <TimerReset className="size-4" />
          <Timer
            className="tabular-nums"
            startTime={item.fragment.startedAt ?? undefined}
          />
        </div>
      </div>
      <TargetMetrics item={item} />
      <PreviousPerformance item={item} session={session} />

      <div className="mt-6 grid grid-cols-3 gap-2 md:gap-4">
        <NumberField label="Weight (kg)" onChange={setWeight} value={weight} />
        <NumberField label="Reps" onChange={setReps} value={reps} />
        <NumberField
          label="Duration (s)"
          onChange={setDuration}
          value={duration}
        />
      </div>

      <Button
        className="mt-6 h-14 w-full text-base"
        disabled={isPending}
        onClick={completeSet}
      >
        {isPending ? <Loader2 className="animate-spin" /> : <Check />}
        Complete set
      </Button>
    </div>
  );
}

function RestState({
  isPending,
  item,
  onSkipSet,
  onStart,
  restSeconds,
  restStartedAt,
}: {
  isPending: boolean;
  item: SessionSequenceItem;
  onSkipSet: () => void;
  onStart: () => void;
  restSeconds: number;
  restStartedAt: Date;
}) {
  const remainingSeconds = useRestCountdown(restStartedAt, restSeconds);

  return (
    <div className="py-2 text-center">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        Rest
      </p>
      <p
        className={cn(
          "mt-2 text-5xl font-semibold tabular-nums",
          remainingSeconds === 0 && "text-primary",
        )}
      >
        {formatTimer(remainingSeconds)}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">Up next</p>
      <p className="text-lg font-semibold">{item.log.exercise.name}</p>
      <p className="text-sm text-muted-foreground">
        {item.groupLogs.length > 1
          ? `Superset round ${item.roundNumber}`
          : `Set ${item.roundNumber} of ${item.roundCount}`}
      </p>

      <div className="mx-auto mt-6 flex max-w-lg flex-col gap-2 sm:flex-row">
        <Button className="h-12 flex-1" disabled={isPending} onClick={onStart}>
          {isPending ? <Loader2 className="animate-spin" /> : <Play />}
          {remainingSeconds > 0 ? "Skip rest" : "Start next set"}
        </Button>
        <Button
          className="h-12"
          disabled={isPending}
          onClick={onSkipSet}
          variant="outline"
        >
          <SkipForward />
          Skip set
        </Button>
      </div>
    </div>
  );
}

function RestProgressState({
  isPending,
  onSkipSet,
  onStartSet,
  progress,
}: {
  isPending: boolean;
  onSkipSet: (item: SessionSequenceItem) => void;
  onStartSet: (item: SessionSequenceItem) => void;
  progress: ReturnType<typeof deriveSessionProgress>;
}) {
  if (
    progress.kind !== "rest" ||
    !progress.nextItem ||
    !progress.restStartedAt
  ) return null;

  return (
    <RestState
      isPending={isPending}
      item={progress.nextItem}
      onSkipSet={() => onSkipSet(progress.nextItem!)}
      onStart={() => onStartSet(progress.nextItem!)}
      restSeconds={progress.restSeconds ?? 0}
      restStartedAt={progress.restStartedAt}
    />
  );
}

function WorkoutCompleteState({
  isPending,
  onEnd,
  performedCount,
}: {
  isPending: boolean;
  onEnd: () => void;
  performedCount: number;
}) {
  return (
    <div className="py-5 text-center">
      <Check className="mx-auto size-10 text-primary" />
      <h2 className="mt-3 text-xl font-semibold">Session complete</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {performedCount} set{performedCount === 1 ? "" : "s"} performed
      </p>
      <Button
        className="mt-6 h-12 w-full max-w-sm"
        disabled={isPending}
        onClick={onEnd}
      >
        {isPending && <Loader2 className="animate-spin" />}
        Finish and view summary
      </Button>
    </div>
  );
}

function SetHeading({ item }: { item: SessionSequenceItem }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {item.groupLogs.length > 1
          ? `Superset ${item.groupNumber} · Round ${item.roundNumber}/${item.roundCount}`
          : `Exercise ${item.groupNumber}/${item.groupCount} · Set ${item.roundNumber}/${item.roundCount}`}
      </p>
      <h2 className="mt-1 text-2xl font-semibold">{item.log.exercise.name}</h2>
    </div>
  );
}

function TargetMetrics({ item }: { item: SessionSequenceItem }) {
  const metrics = [
    { label: "Target", value: `${item.fragment.reps} reps` },
    ...(item.fragment.weight > 0
      ? [{ label: "Weight", value: `${item.fragment.weight} kg` }]
      : []),
    ...(item.fragment.duration > 0
      ? [{ label: "Duration", value: `${item.fragment.duration}s` }]
      : []),
    ...(item.fragment.restTime > 0
      ? [{ label: "Rest", value: `${item.fragment.restTime}s` }]
      : []),
  ];

  return (
    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-y py-3">
      {metrics.map((metric) => (
        <div key={metric.label}>
          <p className="text-xs text-muted-foreground">{metric.label}</p>
          <p className="font-medium">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

function PreviousPerformance({
  item,
  session,
}: {
  item: SessionSequenceItem;
  session: ActiveSession;
}) {
  const previousValues = getPreviousValues(session, item);
  const previousReps =
    session.previousData[item.log.exerciseId]?.orderToReps[item.fragment.order];

  if (previousReps === undefined && !previousValues) return null;

  const details = [
    previousValues?.weight !== undefined
      ? `${Math.round(previousValues.weight)} kg`
      : null,
    previousReps !== undefined ? `${previousReps} reps` : null,
    previousValues?.duration !== undefined
      ? `${Math.round(previousValues.duration)}s`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <p className="mt-3 text-sm text-muted-foreground">
      Last time: <span className="font-medium text-foreground">{details}</span>
    </p>
  );
}

function NumberField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="min-w-0 space-y-2">
      <span className="block truncate text-xs text-muted-foreground">
        {label}
      </span>
      <Input
        className="h-14 px-2 text-center !text-xl tabular-nums md:!text-2xl"
        inputMode="numeric"
        min={0}
        onChange={(event) =>
          onChange(Math.max(0, Math.round(Number(event.target.value) || 0)))
        }
        type="number"
        value={value}
      />
    </label>
  );
}

function getPreviousValues(session: ActiveSession, item: SessionSequenceItem) {
  const previousData = session.previousData[item.log.exerciseId];
  if (!previousData) return undefined;

  const previousReps = previousData.orderToReps[item.fragment.order];
  return (
    previousData.repsToValues[item.fragment.reps]?.lastSet ??
    (previousReps !== undefined
      ? previousData.repsToValues[previousReps]?.lastSet
      : undefined)
  );
}

function useRestCountdown(startedAt: Date, restSeconds: number) {
  const calculateRemaining = useCallback(() => {
    const elapsedSeconds = Math.floor(
      (Date.now() - startedAt.getTime()) / 1000,
    );
    return Math.max(0, restSeconds - elapsedSeconds);
  }, [restSeconds, startedAt]);
  const [remaining, setRemaining] = useState(calculateRemaining);

  useEffect(() => {
    setRemaining(calculateRemaining());
    const interval = window.setInterval(
      () => setRemaining(calculateRemaining()),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [calculateRemaining]);

  return remaining;
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
