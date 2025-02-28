import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { feedback, InsertFeedbackZod } from "@/server/db/schema/feedback";

export const feedbackRouter = createTRPCRouter({
  sendFeedback: protectedProcedure
    .input(InsertFeedbackZod)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(feedback).values(input)
    })
});
