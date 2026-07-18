import { and, eq, isNull } from "drizzle-orm"

import { EXPERIENCE_SOURCE, getWorkoutExperience } from "@/lib/experience"
import { assessWorkoutExperienceSafety } from "@/lib/workout-experience-safety"
import { type db } from "@/server/db"
import { workoutExperienceReview } from "@/server/db/schema/progression"
import { workoutSession } from "@/server/db/schema/workout"
import { awardExperience } from "@/server/services/progression"

type CompletionSession = Parameters<typeof getWorkoutExperience>[0] &
  Parameters<typeof assessWorkoutExperienceSafety>[0] & {
    id: string
    startedAt: Date | null
    userId: string
  }

export async function completeWorkoutWithExperience(
  database: typeof db,
  input: {
    endedAt: Date
    session: CompletionSession
    userId: string
  },
) {
  const { endedAt, session, userId } = input
  const experience = getWorkoutExperience(session)
  const safetyAssessment = assessWorkoutExperienceSafety(session)

  const completed = await database.transaction(async (tx) => {
    const updatedSessions = await tx
      .update(workoutSession)
      .set({
        startedAt: session.startedAt ?? endedAt,
        endedAt,
      })
      .where(and(
        eq(workoutSession.id, session.id),
        eq(workoutSession.userId, userId),
        isNull(workoutSession.endedAt),
      ))
      .returning({ id: workoutSession.id })

    if (updatedSessions.length === 0) return false

    if (safetyAssessment.requiresReview) {
      await tx.insert(workoutExperienceReview).values({
        workoutSessionId: session.id,
        userId,
        proposedExperience: experience.total,
        reasons: safetyAssessment.reasons,
        ...safetyAssessment.metrics,
      })
    } else if (experience.total > 0) {
      await awardExperience(tx, {
        userId,
        source: EXPERIENCE_SOURCE.workout,
        sourceId: session.id,
        amount: experience.total,
      })
    }

    return true
  })

  if (!completed) return null

  return {
    experience,
    pendingReview: safetyAssessment.requiresReview,
  }
}
