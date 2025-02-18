import type { WorkoutActiveSessionOutput } from "@/server/api/types/output";

type Session = NonNullable<WorkoutActiveSessionOutput>
type Log = Session["workoutSessionLogs"][number]
type Fragment = Log["workoutSessionLogFragments"][number]
type Set = Session["workout"]["workoutSets"][number]
type SetCollection = Set["workoutSetCollections"][number]

export function hasActiveSessionLog (session: Session): boolean {
  return session.workoutSessionLogs.some(log => !log.endedAt)
}

export function getActiveSessionLog (session: Session): Log | undefined {
  return session.workoutSessionLogs.find(log => !log.endedAt)
}

export function hasActiveSessionLogFragment (
  { sessionLog, session }:
  { session?: Session, sessionLog?: Session["workoutSessionLogs"][number] }
): boolean {
  if (sessionLog) {
    return sessionLog.workoutSessionLogFragments.some(fragment => !fragment.endedAt)
  }

  if (session) {
    return session.workoutSessionLogs.some(log => log.workoutSessionLogFragments.some(
      fragment => !fragment.endedAt
    ))
  }

  return false
}

export function getActiveSessionLogFragment ({ sessionLog, session }: { session?: Session, sessionLog?: Log }): Fragment | undefined {
  if (sessionLog) {
    return sessionLog.workoutSessionLogFragments.find(fragment => !fragment.endedAt)
  }

  if (session) {
    for (const log of session.workoutSessionLogs) {
      const activeFragment = log.workoutSessionLogFragments.find(fragment => !fragment.endedAt)
      if (activeFragment) return activeFragment
    }
  }
}

export function hasActiveWorkoutSet (session: Session): boolean {
  return session.workout.workoutSets.some(set => {
    return set.workoutSetCollections.some(col => {
      return session.workoutSessionLogs.some(log => log.workoutSetCollectionId === col.id)
    })
  })
}

export function getActiveWorkoutSet (session: Session): Set | undefined {
  return session.workout.workoutSets.find(set => {
    return set.workoutSetCollections.some(col => {
      return session.workoutSessionLogs.some(log => log.workoutSetCollectionId === col.id)
    })
  })
}

export function getNextWorkoutSet (session: Session): Set | undefined {
  if (hasActiveSessionLog(session)) {
    const sessionLog = getActiveSessionLog(session)!
    return session.workout.workoutSets.find(set => set.workoutSetCollections.some(col => col.id === sessionLog.workoutSetCollectionId))
  }

  const sessionLogFragmentCountMap = new Map(
    session.workoutSessionLogs.map(log => ([
      log.id,
      log.workoutSessionLogFragments.filter(f => !f.endedAt).length
    ]))
  )

  const completedSets = new Set(session.workout.workoutSets.filter(
    set => set.workoutSetCollections.every(col => {
      // Set is completed if there exists a log for that set
      // and the log has a fragment for each workout
      const fragmentCount = sessionLogFragmentCountMap.get(col.id)
      return fragmentCount && fragmentCount === col.reps.length
    })
  ).map(set => set.id))

  const nonCompletedSets = session.workout.workoutSets.filter(set => !completedSets.has(set.id))

  return nonCompletedSets.sort((a, b) => a.order - b.order).at(0)
}

export function hasNextWorkoutSetCollection ({ fragment, session }: { fragment: Fragment, session: Session }): boolean {
  const activeSet = session.workout.workoutSets.find(set => {
    return set.workoutSetCollections.some(col => col.id === fragment.workoutSessionLogId)
  })

  if (!activeSet || activeSet.workoutSetCollections.length <= 1) return false

  return true
}

export function getNextWorkoutSetCollection (set: Set) {
  return set.workoutSetCollections.sort((a, b) => a.order - b.order).at(0)
}

export function isWorkoutStarted (session: Session): boolean {
  return session.workoutSessionLogs.length > 0
}

export function isWorkoutCompleted (session: Session): boolean {
  const sessionLogFragmentCountMap = new Map(
    session.workoutSessionLogs.map(log => ([
      log.id,
      log.workoutSessionLogFragments.filter(f => !f.endedAt).length
    ]))
  )

  const completedSets = new Set(session.workout.workoutSets.filter(
    set => set.workoutSetCollections.every(col => {
      // Set is completed if there exists a log for that set
      // and the log has a fragment for each workout
      const fragmentCount = sessionLogFragmentCountMap.get(col.id)
      return fragmentCount && fragmentCount === col.reps.length
    })
  ).map(set => set.id))

  const nonCompletedSets = session.workout.workoutSets.filter(set => !completedSets.has(set.id))

  return nonCompletedSets.length === 0
}

// New stuff

function getCompletedSets (session: Session): Set[] {
  const sessionLogFragmentCountMap = new Map(
    session.workoutSessionLogs.map(log => ([
      log.workoutSetCollectionId,
      log.workoutSessionLogFragments.filter(f => !!f.endedAt).length
    ]))
  )

  return session.workout.workoutSets.filter(
    set => set.workoutSetCollections.every(col => {
      // Set is completed if there exists a log for that set
      // and the log has a fragment for each workout
      const fragmentCount = sessionLogFragmentCountMap.get(col.id)
      return fragmentCount && fragmentCount === col.reps.length
    })
  )
}

export function getWorkoutSetBySessionLog (session: Session, sessionLog: Log): Set | undefined {
  return session.workout.workoutSets.find(set => {
    return set.workoutSetCollections.some(col => col.id === sessionLog.workoutSetCollectionId)
  })
}

export function getSessionLogBySetCollection (session: Session, setCollection: SetCollection): Log | undefined {
  return session.workoutSessionLogs.find(log => log.workoutSetCollectionId === setCollection.id)
}

export function getLastActiveSessionLog (session: Session, set: Set): Log & { endedAt: Date } | undefined {
  return session.workoutSessionLogs.filter((log): log is Log & { endedAt: Date } => 
    !!log.endedAt &&
    set.workoutSetCollections.some(col => col.id === log.workoutSetCollectionId)
  ).sort((a, b) => a.endedAt.getTime() - b.endedAt.getTime()).at(0)
}

export function getLastActiveSessionLogFragment (session: Session, set: Set): Fragment & { endedAt: Date } | undefined {
  const logs = session.workoutSessionLogs.filter(log => (
    set.workoutSetCollections.some(col => col.id === log.workoutSetCollectionId)
  ))

  let allFragments: Array<Fragment & { endedAt: Date }> = []
  for (const log of logs) {
    const foundFragments = log.workoutSessionLogFragments.filter((fragment): fragment is Fragment & { endedAt: Date } => 
      !!fragment.endedAt
    )
    allFragments = [...allFragments, ...foundFragments ?? []]
  }
  return allFragments.sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime()).at(0)
}

export function getSessionLogWithFewestFragments (session: Session, set: Set): Log {
  const sessionLogs = session.workoutSessionLogs
  const filtered = sessionLogs.filter(log => set.workoutSetCollections.some(col => col.id === log.workoutSetCollectionId))
  
  const sessionLogIdWithLeastFragments =
    filtered.map(log => ({
      id: log.id,
      count: log.workoutSessionLogFragments.length
    })).sort((a, b) => a.count - b.count).at(0)?.id

  if (!sessionLogIdWithLeastFragments) throw new Error("Reallsdfsafd should not be undefined!!");

  const sessionLog = sessionLogs.find(log => log.id === sessionLogIdWithLeastFragments)
  
  if (!sessionLog) throw new Error("Omg why is undefined!!?123123");

  return sessionLog
}

export function getMostRecentEndedSessionLog (session: Session) {
  return session.workoutSessionLogs
    .filter(l => !!l.endedAt)
    .sort((a, b) => (b.endedAt?.getTime() ?? 0) - (a.endedAt?.getTime() ?? 0))
    .at(0)
}

export function getSetCollectionBySessionLog (session: Session, log: Log): SetCollection | undefined {
  const workoutSet = getWorkoutSetBySessionLog(session, log)
  return workoutSet?.workoutSetCollections.find(col => col.id === log.workoutSetCollectionId)
}

export function getSetCollectionWithFewestFragments (session: Session, set: Set): SetCollection | undefined {
  const sessionLogs = session.workoutSessionLogs
  const filtered = sessionLogs.filter(log => set.workoutSetCollections.some(col => col.id === log.workoutSetCollectionId))
  
  const setCollectionIdWithLeastFragments =
    filtered.map(log => ({
      id: log.workoutSetCollectionId,
      count: log.workoutSessionLogFragments.length
    })).sort((a, b) => a.count - b.count).at(0)?.id

  if (!setCollectionIdWithLeastFragments) throw new Error("Really should not be undefined!!");

  const setCollection = set.workoutSetCollections.find(col => col.id === setCollectionIdWithLeastFragments)
  
  if (!setCollection) throw new Error("Omg why is undefined!!?");

  return setCollection
}

export function getNextExercise(session: Session) {
  const completedSets = new Set(getCompletedSets(session).map(set => set.id))
  const nonCompletedSets = session.workout.workoutSets.filter(set => !completedSets.has(set.id))
  return nonCompletedSets.sort((a, b) => a.order - b.order).at(0)
}

export function getIndexForFragment (session: Session, fragment: Fragment): number {
  const sessionLog = session.workoutSessionLogs.find(log => {
    return log.workoutSessionLogFragments.some(f => f.id === fragment.id)
  })

  if (!sessionLog) return 0

  const index = sessionLog.workoutSessionLogFragments.findIndex(f => f.id === fragment.id)

  return index === -1 ? 0 : index
}

export function getWorkoutSetByFragment (session: Session, fragment: Fragment): Set | undefined {
  const sessionLog = session.workoutSessionLogs.find(log => {
    return log.workoutSessionLogFragments.some(f => f.id === fragment.id)
  })

  if (!sessionLog) return undefined

  return session.workout.workoutSets.find(set => {
    return set.workoutSetCollections.some(col => sessionLog.workoutSetCollectionId === col.id)
  })
}

export function getWorkoutSetCollectionByFragment (session: Session, fragment: Fragment): SetCollection | undefined {
  const sessionLog = session.workoutSessionLogs.find(log => {
    return log.workoutSessionLogFragments.some(f => f.id === fragment.id)
  })

  if (!sessionLog) return undefined

  for (const set of session.workout.workoutSets) {
    const foundSetCollection = set.workoutSetCollections.find(col => sessionLog.workoutSetCollectionId === col.id)
    if (foundSetCollection) return foundSetCollection
  }
}



export function hasUnfinishedExercise (session: Session): boolean {
  const completedSets = new Set(getCompletedSets(session).map(set => set.id))
  const nonCompletedSets = session.workout.workoutSets.filter(set => !completedSets.has(set.id))
  return nonCompletedSets.length > 0
}

export function hasStartedSessionLog (session: Session): boolean {
  return session.workoutSessionLogs.some(log => !log.endedAt)
}

export function getStartedSessionLog (session: Session): Log | undefined {
  return session.workoutSessionLogs.find(log => !log.endedAt)
}

export function getStartedSessionLogs (session: Session): Log[] {
  return session.workoutSessionLogs.filter(log => !log.endedAt)
}

export function hasStartedSessionLogFragment (sessionLog: Log): boolean {
  return sessionLog.workoutSessionLogFragments.some(fragment => !fragment.endedAt)
}

export function getStartedSessionLogFragment (sessionLog: Log): Fragment | undefined {
  return sessionLog.workoutSessionLogFragments.find(fragment => !fragment.endedAt)
}

export function isSuperSet (set: Set): boolean {
  return set.workoutSetCollections.length > 1
}

export function hasEqualNumberOfFragments (session: Session, set: Set): boolean {
  const sessionLogs = session.workoutSessionLogs
  const filtered = sessionLogs.filter(log => set.workoutSetCollections.some(col => col.id === log.workoutSetCollectionId))
  
  if (filtered.length > 0 && filtered.length !== set.workoutSetCollections.length) return false

  const setCollectionIdToFragmentCountMap = new Map(
    filtered.map(log => ([
      log.workoutSetCollectionId,
      log.workoutSessionLogFragments.length
    ]))
  )

  const firstSetCollectionId = set.workoutSetCollections.at(0)?.id
  if (!firstSetCollectionId) throw new Error("Should not be undefined...")
  const firstFragmentCount = setCollectionIdToFragmentCountMap.get(firstSetCollectionId)
  if (!firstFragmentCount) throw new Error("Also should not be undefined...")

  return set.workoutSetCollections.every(col => {
    const count = setCollectionIdToFragmentCountMap.get(col.id)
    return !count && count === firstFragmentCount
  })
}
