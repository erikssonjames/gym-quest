import type { TRPCContext } from "@/trpc/server";
import { TRPCError } from "@trpc/server";

export function getCtxUserId (ctx: TRPCContext) {
  const userId = ctx.session?.user.id
  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authorized to fetch this resource"
    });
  }
  return userId
}