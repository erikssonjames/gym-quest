import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { getUserProgression } from "@/server/services/progression"
import { ensureBadgeProgressRows } from "@/server/services/user-provisioning"
import { ensureEarlyUserBadge } from "@/server/services/progression"
import { getCtxUserId } from "@/server/utils/user"

export const progressionRouter = createTRPCRouter({
  getProgression: protectedProcedure.query(async ({ ctx }) => {
    const userId = getCtxUserId(ctx)
    await ensureBadgeProgressRows(ctx.db, userId)
    await ensureEarlyUserBadge(ctx.db, userId)
    return await getUserProgression(ctx.db, userId)
  }),
})
