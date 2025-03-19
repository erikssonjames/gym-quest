// import { db } from "@/server/db"
import { badge, badgeProgress } from "@/server/db/schema/badges"
import { users } from "@/server/db/schema/user"
import { BADGES } from "@/variables/badges"
import { and, count, eq } from "drizzle-orm"

export async function updateBadgeStatisticsCronJob () {
  try {
    const { db } = await import("@/server/db")

    const numUsers = await db.$count(users)
    const usersWithEachBadge = await db
      .select({
        id: badge.id,
        name: badge.name,
        numCompletedBadge: count(badgeProgress.id)
      })
      .from(badge)
      .fullJoin(
        badgeProgress,
        and(eq(badgeProgress.badgeId, badge.id), eq(badgeProgress.completed, true))
      )
      .groupBy(badge.id);
      

    const badgeIdWithPercentage = BADGES.map(badge => {
      const numCompleted = usersWithEachBadge.find(b => b.id === badge.id)?.numCompletedBadge

      const percentage = numCompleted
        ? Math.floor((numCompleted ?? 0) / numUsers * 100)
        : 0

      return {
        id: badge.id,
        percentage
      }
    })

    for (const { id, percentage } of badgeIdWithPercentage) {
      await db.update(badge).set({
        percentageOfUsersHasBadge: percentage
      }).where(eq(badge.id, id))
    }
  } catch(e) {
    console.error(e)
  }
}