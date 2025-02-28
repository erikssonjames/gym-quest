import { friendShip } from "@/server/db/schema/user";
import type { TRPCContext } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { eq, or } from "drizzle-orm";

export async function getUserFriendsIds (ctx: NonNullable<TRPCContext>) {
  const userId = ctx.session?.user.id

  if (!userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This requires a valid session."
    })
  }

  const friendShips = await ctx.db.query.friendShip.findMany({
    where: or(
      eq(friendShip.userOne, userId),
      eq(friendShip.userTwo, userId)
    ),
    columns: {
      userOne: true,
      userTwo: true
    }
  })

  return friendShips.map(fs => {
    return fs.userOne !== userId
      ? fs.userOne
      : fs.userTwo
  })
}