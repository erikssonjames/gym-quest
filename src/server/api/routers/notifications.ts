import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { notification } from "@/server/db/schema/notifications";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";

export const notificationsRouter = createTRPCRouter({
  getNotifications: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You need a valid session to access this data."
        })
      }

      const notifications = await ctx.db.query.notification.findMany({
        where: and(
          eq(notification.userId, userId),
          eq(notification.hidden, false)
        ),
        with: {
          friendRequest: {
            with: {
              friendRequest: {
                with: {
                  fromUser: true
                }
              }
            }
          },
          workoutReview: {
            with: {
              workoutReview: {
                with: {
                  workout: true
                }
              }
            }
          }
        }
      })

      return notifications.sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
      
    }),

  deleteNotification: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You need a valid session to access this data."
        })
      }

      const notificationId = input

      await ctx.db.delete(notification).where(and(
        eq(notification.id, notificationId),
        eq(notification.userId, userId)
      ))
    }),

  deleteNotifications: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You need a valid session to access this data."
        })
      }

      const notificationIds = input

      await ctx.db.delete(notification).where(and(
        inArray(notification.id, notificationIds),
        eq(notification.userId, userId)
      ))
    }),
  
  markNotificationAsRead: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You need a valid session to access this data."
        })
      }

      const notificationId = input

      await ctx.db.update(notification).set({ readAt: new Date() }).where(
        and(
          and(
            eq(notification.id, notificationId),
            eq(notification.userId, userId)
          ),
          isNull(notification.readAt)
        )
      )
    }),

  markNotificationsAsRead: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You need a valid session to access this data."
        })
      }

      const notificationIds = input

      await ctx.db.update(notification).set({ readAt: new Date() }).where(
        and(
          and(
            inArray(notification.id, notificationIds),
            eq(notification.userId, userId)
          ),
          isNull(notification.readAt)
        )
      )
    }),
});
