import { userRouter } from "@/server/api/routers/user"
import { bodyRouter } from "@/server/api/routers/body"
import { exerciseRouter } from "@/server/api/routers/exercise"
import { workoutRouter } from "@/server/api/routers/workout"
import { notificationsRouter } from "@/server/api/routers/notifications"
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { type inferRouterOutputs } from "@trpc/server";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  body: bodyRouter,
  exercise: exerciseRouter,
  workout: workoutRouter,
  notification: notificationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

export type RouterOutput = inferRouterOutputs<AppRouter>