import { expect, test } from "vitest";
import type { ActiveSession } from "./session-progress";
import {
  deriveSessionProgress,
  getFollowingSessionItem,
} from "./session-progress";

const exercise = (id: string, name: string) => ({ id, name });

function makeSession(
  logs: Array<{
    id: string;
    order: number;
    exercise: { id: string; name: string };
    fragments: Array<{
      id: string;
      order: number;
      startedAt?: Date | null;
      endedAt?: Date | null;
      restTime?: number;
    }>;
  }>,
  startedAt: Date | null = new Date("2026-07-10T10:00:00Z"),
): ActiveSession {
  return {
    id: "session",
    userId: "user",
    workoutId: null,
    workout: null,
    startedAt,
    endedAt: null,
    previousData: {},
    workoutSessionLogs: logs.map((log) => ({
      id: log.id,
      order: log.order,
      workoutSessionId: "session",
      exerciseId: log.exercise.id,
      exercise: log.exercise,
      startedAt: null,
      endedAt: null,
      workoutSessionLogFragments: log.fragments.map((fragment) => ({
        id: fragment.id,
        order: fragment.order,
        workoutSessionLogId: log.id,
        reps: 8,
        weight: 80,
        duration: 0,
        restTime: fragment.restTime ?? 90,
        startedAt: fragment.startedAt ?? null,
        endedAt: fragment.endedAt ?? null,
      })),
    })),
  } as ActiveSession;
}

void test("starts the first set when a planned workout has not begun", () => {
  const session = makeSession(
    [
      {
        id: "squat",
        order: 0,
        exercise: exercise("squat", "Squat"),
        fragments: [{ id: "set-1", order: 0 }],
      },
    ],
    null,
  );

  const progress = deriveSessionProgress(session);

  expect(progress.kind).toBe("not_started");
  expect(progress.nextItem?.fragment.id).toBe("set-1");
});

void test("keeps the active fragment as the primary action", () => {
  const session = makeSession([
    {
      id: "squat",
      order: 0,
      exercise: exercise("squat", "Squat"),
      fragments: [
        { id: "set-1", order: 0, startedAt: new Date("2026-07-10T10:01:00Z") },
      ],
    },
  ]);

  expect(deriveSessionProgress(session).kind).toBe("active_set");
});

void test("moves directly through exercises in the same superset round", () => {
  const endedAt = new Date("2026-07-10T10:02:00Z");
  const session = makeSession([
    {
      id: "bench",
      order: 0,
      exercise: exercise("bench", "Bench press"),
      fragments: [{ id: "bench-1", order: 0, startedAt: new Date(), endedAt }],
    },
    {
      id: "row",
      order: 0,
      exercise: exercise("row", "Row"),
      fragments: [{ id: "row-1", order: 0 }],
    },
  ]);

  const progress = deriveSessionProgress(session);

  expect(progress.kind).toBe("ready_set");
  expect(progress.nextItem?.fragment.id).toBe("row-1");
  expect(getFollowingSessionItem(session, "bench-1")?.fragment.id).toBe(
    "row-1",
  );
});

void test("rests after a completed round and uses the longest round rest target", () => {
  const endedAt = new Date("2026-07-10T10:02:00Z");
  const session = makeSession([
    {
      id: "bench",
      order: 0,
      exercise: exercise("bench", "Bench press"),
      fragments: [
        {
          id: "bench-1",
          order: 0,
          startedAt: new Date(),
          endedAt,
          restTime: 60,
        },
        { id: "bench-2", order: 1 },
      ],
    },
    {
      id: "row",
      order: 0,
      exercise: exercise("row", "Row"),
      fragments: [
        { id: "row-1", order: 0, startedAt: new Date(), endedAt, restTime: 90 },
        { id: "row-2", order: 1 },
      ],
    },
  ]);

  const progress = deriveSessionProgress(session);

  expect(progress.kind).toBe("rest");
  expect(progress.restSeconds).toBe(90);
  expect(progress.nextItem?.fragment.id).toBe("bench-2");
});

void test("counts skipped fragments as resolved but not performed", () => {
  const session = makeSession([
    {
      id: "squat",
      order: 0,
      exercise: exercise("squat", "Squat"),
      fragments: [
        { id: "set-1", order: 0, startedAt: new Date(), endedAt: new Date() },
        { id: "set-2", order: 1, endedAt: new Date() },
      ],
    },
  ]);

  const progress = deriveSessionProgress(session);

  expect(progress.kind).toBe("workout_complete");
  expect(progress.performedCount).toBe(1);
  expect(progress.skippedCount).toBe(1);
  expect(progress.resolvedCount).toBe(2);
});
