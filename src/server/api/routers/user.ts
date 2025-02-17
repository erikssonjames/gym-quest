import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure
} from "@/server/api/trpc";
import { 
  type NewUser, 
  type NewAccount, 
  users, 
  accounts, 
  userSettings, 
  type NewUserSettings, 
  verificationQueue, 
  waitlists, 
  friendShip, 
  friendRequest 
} from "@/server/db/schema/user";
import { and, eq, inArray, isNotNull, ne, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { hashPassword } from "@/lib/hash";
import { BORDER_RADIUS_ARRAY, COLOR_THEMES_ARRAY } from "@/variables/settings";
import jwt from 'jsonwebtoken'
import { env } from "@/env";
import { type TRPCContext } from "@/trpc/server";
import sendVerifyEmail from "@/lib/emailUtils";
import crypto from "crypto"
import { emailLimiter } from "@/server/limiters";
import { isBefore, subHours } from "date-fns";
import { createAddedFriendRequestNotification, createNewFriendRequestNotification } from "@/server/utils/send-notification";
import { UserEvents } from "@/socket/enums/user";
import { emitServerSocketEvent } from "@/server/socket";
import { UserNotifications } from "@/socket/enums/notifications";

type UserDetails = { email: string, password: string }

const createUserAccount = async ({
  email,
  password,
  ctx
}: UserDetails & { ctx: TRPCContext }
): Promise<TRPCError | UserDetails & { userId: string }> => {
  const userExists = await ctx.db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (userExists) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Email is already used"
    });
  }

  const transactionResponse: string | TRPCError = await ctx.db.transaction(async (transaction) => {
    try {
      const newUser: NewUser = { email, password };

      const createdUser = await transaction
        .insert(users)
        .values(newUser)
        .returning({ id: users.id });

      const createdUserId = createdUser[0]?.id;
      if (!createdUserId) {
        return new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong creating your user account."
        });
      }

      const newAccount: NewAccount = {
        type: "credentials",
        provider: "credentials",
        providerAccountId: crypto.randomUUID(),
        userId: createdUserId
      };

      const createdAccount = await transaction.insert(accounts).values(newAccount).returning();

      if (createdAccount.length === 0) {
        return new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong creating your user account."
        });
      }

      return createdUserId;
    } catch (error) {
      return new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database transaction failed."
      });
    }
  });

  if (transactionResponse instanceof TRPCError) {
    throw transactionResponse;
  }

  return {
    userId: transactionResponse,
    email,
    password
  };
};

const generateSecureCode = () => {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += crypto.randomInt(0, 10).toString()
  }
  return code
}

export const userRouter = createTRPCRouter({
  createUser: protectedProcedure
    .input(z.object({
      username: z.string().min(3)
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Incorrect session.'
        })
      }
            
      const { username } = input
      await ctx.db.transaction(async (transcation) => {
        await transcation
          .update(users)
          .set({ username })
          .where(eq(users.id, userId))

        const newUserSettings: NewUserSettings = { userId }
                
        await transcation
          .insert(userSettings)
          .values(newUserSettings)
      })
    }),

  getMe: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id

      if (!userId) throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Invalid session.'
      })

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
          userSettings: true
        }
      })

      if (!user) throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User not found.'
      })

      return user
    }),

  getUsers: protectedProcedure
    .query(async ({ ctx }) => {
      const myUserId = ctx.session.user.id

      if (!myUserId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Incorrect session.'
        })
      }

      return await ctx.db.query.users.findMany({
        where: and(
          ne(users.id, myUserId),
          isNotNull(users.username)
        ),
      })
    }),

  updateUserSettings: protectedProcedure
    .input(z.object({
      colorTheme: z.enum(COLOR_THEMES_ARRAY).optional().nullable(),
      borderRadius: z.enum(BORDER_RADIUS_ARRAY).optional().nullable()
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      if (!userId) throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Invalid session.'
      })

      const { colorTheme, borderRadius } = input

      const updateUserSettings: Partial<NewUserSettings> = {}
      if (colorTheme) updateUserSettings.colorTheme = colorTheme
      if (borderRadius) updateUserSettings.borderRadius = borderRadius

      return await ctx.db
        .update(userSettings)
        .set(updateUserSettings)
        .where(eq(userSettings.userId, userId))
    }),

  verifyEmail: publicProcedure
    .input(
      z.object({
        code: z.string().length(6),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session?.user) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Already signed in",
        })
      }

      const { code, email } = input;
      
      const pendingRequests = await ctx.db.query.verificationQueue.findMany({
        where: eq(verificationQueue.email, email)
      })

      const date24HoursAgo = subHours(new Date(), 24)
      const invalidPendingRequests = pendingRequests.filter(r => isBefore(r.timeRequested, date24HoursAgo)).map(r => r.token)
      const validPendingRequests = pendingRequests.filter(r => !invalidPendingRequests.some(token => token === r.token))

      await ctx.db.delete(verificationQueue).where(inArray(verificationQueue.token, invalidPendingRequests))

      let decodedEmail = '';
      let decodedHashedPassword = '';
      for (const request of validPendingRequests) {
        try {
          const decoded = jwt.verify(request.token, env.AUTH_EMAIL_SECRET + code);
          if (decoded && typeof decoded === 'object') {
            const { email: tokenEmail, hashedPassword: tokenPassword } = decoded as { email: string; hashedPassword: string };
            if (tokenEmail === email) {
              decodedEmail = tokenEmail;
              decodedHashedPassword = tokenPassword;
              break;
            }
          }
        } catch (err) {
          // Optionally log error per token, but continue with the loop.
          continue;
        }
      }
      

      if (!decodedEmail || !decodedHashedPassword) {
        await ctx.db.delete(verificationQueue).where(inArray(verificationQueue.token, invalidPendingRequests))
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid or expired token.",
        });
      }


      try {
        // 🔹 Create User Account
        const createdUser = await createUserAccount({
          ctx,
          email: decodedEmail,
          password: decodedHashedPassword,
        });
  
        if (createdUser instanceof TRPCError) {
          throw createdUser;
        }
      } catch (error) {
        console.error("Verify Email Error:", error);
  
        if (error instanceof TRPCError) {
          throw error;
        }
  
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while verifying the email.",
        });
      }

      await ctx.db.delete(verificationQueue).where(eq(verificationQueue.email, email))
    }),
  
  signUp: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8)
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session?.user) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Already signed in",
        })
      }

      const { email, password } = input
      try {
        await emailLimiter.consume(email)
      } catch (rejRes) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests, please try again later."
        })
      }

      const userExists = (await ctx.db.query.users.findMany({
        where: eq(users.email, email)
      })).length > 0

      if (userExists) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "A user with that email is already registered."
        })
      }

      const code = generateSecureCode()
      const hashedPassword = await hashPassword(password)

      const token = jwt.sign({ email, hashedPassword }, env.AUTH_EMAIL_SECRET + code, { 
        expiresIn: 60 * 60 * 24 
      })

      await ctx.db.insert(verificationQueue).values({ token, email })

      const { error } = await sendVerifyEmail({ email, code })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not send the email. Please try again.'
        })
      }
    }),

  joinWaitlist: publicProcedure
    .input(z.object({
      email: z.string().email()
    }))
    .mutation(async ({ ctx, input }) => {
      const { email } = input

      const alreadySubmitted = await ctx.db.query.waitlists.findFirst({
        where: eq(waitlists.email, email)
      })

      if (alreadySubmitted) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Already in the waitlist.'
        })
      }

      await ctx.db.insert(waitlists).values({ email })
    }),

  checkIfUsernameIsAvailable: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const foundUsers = await ctx.db.query.users.findMany({
        where: eq(users.username, input),
        columns: {
          username: true
        }
      })

      return { available: foundUsers.length === 0, username: input }
    }),

  getFriends: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Incorrect session.'
        })
      }

      const friendShips = await ctx.db.query.friendShip.findMany({
        where: or(
          eq(friendShip.userOne, userId),
          eq(friendShip.userTwo, userId),
        ),
        with: {
          userOneUser: true,
          userTwoUser: true
        }
      })

      return friendShips.map(friendShip => {
        const friend = friendShip.userOneUser.id === userId
          ? friendShip.userTwoUser
          : friendShip.userOneUser

        return {
          createdAt: friendShip.createdAt,
          ...friend
        }
      })
    }),

  getFriendRequests: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id

      if (!userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Incorrect session.'
        })
      }

      const friendRequests = await ctx.db.query.friendRequest.findMany({
        where: and(
          or(
            eq(friendRequest.fromUserId, userId),
            eq(friendRequest.toUserId, userId)
          ),
          eq(friendRequest.accepted, false),
          eq(friendRequest.ignored, false)
        ),
        with: {
          fromUser: true,
          toUser: true
        }
      })

      return friendRequests.reduce<
        { incoming: Array<typeof friendRequests[number]>, outgoing: Array<typeof friendRequests[number]> }
      >((acc, curr) => {
        if (curr.fromUserId === userId) {
          acc.outgoing.push(curr)
        } else {
          acc.incoming.push(curr)
        }
        return acc
      }, { incoming: [], outgoing: [] })
    }),

  sendFriendRequest: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const myUserId = ctx.session.user.id
      const toUserId = input

      let num = 0
      console.log(++num)

      if (!myUserId || !toUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing data in the request."
        })
      }

      console.log(++num)

      const existingPendingRequest = await ctx.db.query.friendRequest.findFirst({
        where: and(
          or(
            inArray(friendRequest.toUserId, [myUserId, toUserId]),
            inArray(friendRequest.fromUserId, [myUserId, toUserId])
          ),
          ne(friendRequest.accepted, true),
          ne(friendRequest.ignored, true)
        )
      })

      console.log(++num)

      if (existingPendingRequest) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have a pending friend request with this user."
        })
      }

      console.log(++num)

      const createdFriendRequest = (await ctx.db.insert(friendRequest).values({
        fromUserId: myUserId,
        toUserId: toUserId
      }).returning()).at(0)

      console.log(++num)

      try {
        if (createdFriendRequest) {
          await createNewFriendRequestNotification(ctx, createdFriendRequest)
        }
      } catch (e) {
        console.log(e)
      }

      console.log(++num)
    }),

  acceptFriendRequest: protectedProcedure
    .input(z.object({
      friendRequestId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const myUserId = ctx.session.user.id

      if (!myUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing data in the request."
        })
      }

      const { friendRequestId } = input

      const activeFriendRequest = await ctx.db.query.friendRequest.findFirst({
        where: and(
          eq(friendRequest.toUserId, myUserId),
          eq(friendRequest.accepted, false),
          eq(friendRequest.id, friendRequestId)
        )
      })

      if (!activeFriendRequest) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have no pending friend request from this user."
        })
      }

      await ctx.db.insert(friendShip).values({
        userOne: activeFriendRequest.toUserId,
        userTwo: activeFriendRequest.fromUserId
      })

      const updatedFriendRequest = (await ctx.db.update(friendRequest).set({
        accepted: true
      }).where(eq(friendRequest.id, activeFriendRequest.id)).returning()).at(0)

      if (updatedFriendRequest) {
        await createAddedFriendRequestNotification(ctx, updatedFriendRequest)
      }
    }),

  ignoreFriendRequest: protectedProcedure
    .input(z.object({
      friendRequestId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const myUserId = ctx.session.user.id

      if (!myUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing data in the request."
        })
      }

      const { friendRequestId } = input

      const activeFriendRequest = await ctx.db.query.friendRequest.findFirst({
        where: and(
          eq(friendRequest.toUserId, myUserId),
          eq(friendRequest.ignored, false),
          eq(friendRequest.accepted, false),
          eq(friendRequest.id, friendRequestId)
        )
      })

      if (!activeFriendRequest) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have no pending friend request from this user."
        })
      }

      await ctx.db.update(friendRequest).set({
        ignored: true
      }).where(eq(friendRequest.id, activeFriendRequest.id))
    }),

  removeFriend: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const myUserId = ctx.session.user.id
      const otherUserId = input

      if (!myUserId || !otherUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing data in the request."
        })
      }

      await ctx.db.delete(friendShip).where(
        or(
          and(
            eq(friendShip.userOne, myUserId),
            eq(friendShip.userTwo, otherUserId)
          ),
          and(
            eq(friendShip.userOne, otherUserId),
            eq(friendShip.userTwo, myUserId)
          ),
        )
      )

      emitServerSocketEvent<UserEvents.REMOVED_USER_AS_FRIEND>({
        event: UserEvents.REMOVED_USER_AS_FRIEND,
        recipients: otherUserId,
        payload: {
          sentAt: new Date(),
          userId: myUserId,
          removedUserId: otherUserId
        }
      })
    }),

  revokeFriendRequest: protectedProcedure
    .input(z.object({
      friendRequestId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const myUserId = ctx.session.user.id

      if (!myUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing data in the request."
        })
      }

      const { friendRequestId } = input

      const activeFriendRequest = await ctx.db.query.friendRequest.findFirst({
        where: and(
          eq(friendRequest.fromUserId, myUserId),
          eq(friendRequest.accepted, false),
          eq(friendRequest.id, friendRequestId)
        )
      })

      if (!activeFriendRequest) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have no pending friend request from this user."
        })
      }

      await ctx.db.delete(friendRequest).where(eq(friendRequest.id, activeFriendRequest.id))
    }),

  testSocketServer: protectedProcedure
    .mutation(async () => {
      emitServerSocketEvent({
        event: UserNotifications.ACCEPTED_FRIEND_REQUEST,
        payload: {
          friendRequest: {
            accepted: true,
            fromUserId: "",
            id: "",
            ignored: false,
            toUserId: ""
          },
          sentAt: new Date(),
          userId: ""
        }
      })
    })
});

