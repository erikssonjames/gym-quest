import type { WorkoutActiveSessionOutput } from "@/server/api/types/output";

export type ActiveSession = NonNullable<WorkoutActiveSessionOutput>;
export type SessionLog = ActiveSession["workoutSessionLogs"][number];
export type SessionFragment = SessionLog["workoutSessionLogFragments"][number];

export interface SessionSequenceItem {
  fragment: SessionFragment;
  groupCount: number;
  groupLogs: SessionLog[];
  groupNumber: number;
  groupOrder: number;
  log: SessionLog;
  roundCount: number;
  roundIndex: number;
  roundNumber: number;
  sequenceIndex: number;
}

export type SessionProgressKind =
  | "not_started"
  | "empty"
  | "ready_set"
  | "active_set"
  | "rest"
  | "workout_complete";

export interface SessionProgress {
  kind: SessionProgressKind;
  nextItem?: SessionSequenceItem;
  performedCount: number;
  resolvedCount: number;
  restSeconds?: number;
  restStartedAt?: Date;
  skippedCount: number;
  totalCount: number;
}

export function isPerformedFragment(fragment: SessionFragment) {
  return fragment.startedAt !== null && fragment.endedAt !== null;
}

export function isSkippedFragment(fragment: SessionFragment) {
  return fragment.startedAt === null && fragment.endedAt !== null;
}

export function getSessionSequence(
  session: ActiveSession,
): SessionSequenceItem[] {
  const groupedLogs = new Map<number, SessionLog[]>();

  for (const log of session.workoutSessionLogs) {
    const logs = groupedLogs.get(log.order) ?? [];
    logs.push(log);
    groupedLogs.set(log.order, logs);
  }

  const groups = [...groupedLogs.entries()]
    .sort(([leftOrder], [rightOrder]) => leftOrder - rightOrder)
    .map(([groupOrder, logs]) => ({
      groupOrder,
      logs: [...logs].sort((left, right) => {
        return (
          left.exercise.name.localeCompare(right.exercise.name) ||
          left.id.localeCompare(right.id)
        );
      }),
    }));

  const sequence: SessionSequenceItem[] = [];

  for (const [groupIndex, group] of groups.entries()) {
    const roundIndexes = [
      ...new Set(
        group.logs.flatMap((log) =>
          log.workoutSessionLogFragments.map((fragment) => fragment.order),
        ),
      ),
    ].sort((left, right) => left - right);

    for (const [roundNumberIndex, roundIndex] of roundIndexes.entries()) {
      for (const log of group.logs) {
        const fragment = log.workoutSessionLogFragments.find(
          (item) => item.order === roundIndex,
        );
        if (!fragment) continue;

        sequence.push({
          fragment,
          groupCount: groups.length,
          groupLogs: group.logs,
          groupNumber: groupIndex + 1,
          groupOrder: group.groupOrder,
          log,
          roundCount: roundIndexes.length,
          roundIndex,
          roundNumber: roundNumberIndex + 1,
          sequenceIndex: sequence.length,
        });
      }
    }
  }

  return sequence;
}

export function getFollowingSessionItem(
  session: ActiveSession,
  fragmentId: string,
): SessionSequenceItem | undefined {
  const sequence = getSessionSequence(session);
  const currentIndex = sequence.findIndex(
    (item) => item.fragment.id === fragmentId,
  );
  if (currentIndex < 0) return undefined;

  return sequence
    .slice(currentIndex + 1)
    .find((item) => item.fragment.endedAt === null);
}

export function deriveSessionProgress(session: ActiveSession): SessionProgress {
  const sequence = getSessionSequence(session);
  const performedCount = sequence.filter((item) =>
    isPerformedFragment(item.fragment),
  ).length;
  const skippedCount = sequence.filter((item) =>
    isSkippedFragment(item.fragment),
  ).length;
  const baseProgress = {
    performedCount,
    resolvedCount: performedCount + skippedCount,
    skippedCount,
    totalCount: sequence.length,
  };

  const firstPendingItem = sequence.find(
    (item) => item.fragment.endedAt === null,
  );

  if (session.startedAt === null) {
    return {
      ...baseProgress,
      kind: "not_started",
      nextItem: firstPendingItem,
    };
  }

  if (sequence.length === 0) {
    return { ...baseProgress, kind: "empty" };
  }

  const activeItem = sequence.find(
    (item) =>
      item.fragment.startedAt !== null && item.fragment.endedAt === null,
  );

  if (activeItem) {
    return {
      ...baseProgress,
      kind: "active_set",
      nextItem: activeItem,
    };
  }

  if (!firstPendingItem) {
    return { ...baseProgress, kind: "workout_complete" };
  }

  const previousPerformedItem = sequence
    .slice(0, firstPendingItem.sequenceIndex)
    .reverse()
    .find((item) => isPerformedFragment(item.fragment));

  const startsNewRound =
    previousPerformedItem &&
    (previousPerformedItem.groupOrder !== firstPendingItem.groupOrder ||
      previousPerformedItem.roundIndex !== firstPendingItem.roundIndex);

  if (previousPerformedItem?.fragment.endedAt && startsNewRound) {
    const completedRound = sequence.filter(
      (item) =>
        item.groupOrder === previousPerformedItem.groupOrder &&
        item.roundIndex === previousPerformedItem.roundIndex &&
        isPerformedFragment(item.fragment),
    );
    const restSeconds = completedRound.reduce(
      (longest, item) => Math.max(longest, item.fragment.restTime),
      0,
    );
    const restStartedAt = completedRound.reduce<Date>(
      (latest, item) =>
        item.fragment.endedAt! > latest ? item.fragment.endedAt! : latest,
      previousPerformedItem.fragment.endedAt,
    );

    return {
      ...baseProgress,
      kind: "rest",
      nextItem: firstPendingItem,
      restSeconds,
      restStartedAt,
    };
  }

  return {
    ...baseProgress,
    kind: "ready_set",
    nextItem: firstPendingItem,
  };
}
