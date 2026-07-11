import { Button } from "@/components/ui/button";
import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { format, formatDistanceStrict } from "date-fns";
import {
  ArrowLeft,
  Check,
  Clock3,
  Dumbbell,
  Gauge,
  SkipForward,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ActiveWorkoutSummary({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const sessionId = (await params).sessionId;

  let session;
  try {
    session = await api.workout.getWorkoutSessionById(sessionId);
  } catch (error) {
    if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
      redirect("/user/workouts/active");
    }
  }

  if (!session) redirect("/user/workouts");

  const performedLogs = session.workoutSessionLogs
    .map((log) => ({
      ...log,
      fragments: log.workoutSessionLogFragments
        .filter(
          (fragment) =>
            fragment.startedAt !== null && fragment.endedAt !== null,
        )
        .sort((left, right) => left.order - right.order),
    }))
    .filter((log) => log.fragments.length > 0)
    .sort((left, right) => left.order - right.order);
  const totalPlannedSets = session.workoutSessionLogs.reduce(
    (count, log) => count + log.workoutSessionLogFragments.length,
    0,
  );
  const performedSets = performedLogs.reduce(
    (count, log) => count + log.fragments.length,
    0,
  );
  const skippedSets = Math.max(0, totalPlannedSets - performedSets);
  const totalVolume = performedLogs.reduce((volume, log) => {
    return (
      volume +
      log.fragments.reduce(
        (logVolume, fragment) => logVolume + fragment.reps * fragment.weight,
        0,
      )
    );
  }, 0);
  const duration =
    session.startedAt && session.endedAt
      ? formatDistanceStrict(session.startedAt, session.endedAt)
      : "0 minutes";

  return (
    <main className="w-full pb-10">
      <div className="border-b pb-6 pt-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">
              Workout complete
            </p>
            <h1 className="mt-1 text-2xl font-semibold md:text-3xl">
              {session.workout?.name ?? "Open workout"}
            </h1>
            {session.endedAt && (
              <p className="mt-1 text-sm text-muted-foreground">
                {format(session.endedAt, "EEEE, MMMM d · HH:mm")}
              </p>
            )}
          </div>
          <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="size-6" />
          </div>
        </div>
      </div>

      <section
        aria-label="Workout totals"
        className="grid grid-cols-2 border-b md:grid-cols-4"
      >
        <SummaryMetric icon={<Clock3 />} label="Duration" value={duration} />
        <SummaryMetric
          icon={<Dumbbell />}
          label="Sets"
          value={performedSets.toString()}
        />
        <SummaryMetric
          icon={<Gauge />}
          label="Volume"
          value={`${totalVolume.toLocaleString()} kg`}
        />
        <SummaryMetric
          icon={<SkipForward />}
          label="Not performed"
          value={skippedSets.toString()}
        />
      </section>

      <section className="py-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Exercises</h2>
            <p className="text-sm text-muted-foreground">
              {performedLogs.length} exercise
              {performedLogs.length === 1 ? "" : "s"} performed
            </p>
          </div>
        </div>

        {performedLogs.length === 0 ? (
          <div className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">
            No sets were completed in this session.
          </div>
        ) : (
          <div className="divide-y border-y">
            {performedLogs.map((log) => (
              <div className="py-4" key={log.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold">{log.exercise.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {log.fragments.length} set
                    {log.fragments.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {log.fragments.map((fragment) => (
                    <div
                      className="grid grid-cols-[2rem,1fr,1fr,1fr] gap-2 text-sm"
                      key={fragment.id}
                    >
                      <span className="text-muted-foreground">
                        #{fragment.order + 1}
                      </span>
                      <span>{fragment.weight} kg</span>
                      <span>{fragment.reps} reps</span>
                      <span>{fragment.duration}s</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Button asChild variant="outline">
        <Link href="/user/workouts">
          <ArrowLeft />
          Back to workouts
        </Link>
      </Button>
    </main>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 border-r px-2 py-5 last:border-r-0 md:px-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground [&>svg]:size-3.5">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 truncate font-semibold tabular-nums">{value}</p>
    </div>
  );
}
