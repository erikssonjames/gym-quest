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
  friendRequest, 
} from "@/server/db/schema/user";
import { userBlock } from "@/server/db/schema/feed";
import { and, eq, inArray, isNotNull, ne, notInArray, or, sql } from "drizzle-orm";
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
import { v2 as cloudinary, type UploadApiResponse, type UploadApiOptions } from "cloudinary"
import { createSocketToken } from "@/server/socket/auth";
import { provisionUserRecords } from "@/server/services/user-provisioning";
import { getCtxUserId } from "@/server/utils/user";
import sharp from "sharp";
import { getBlockedUserIds } from "@/server/services/feed-access";

type UserDetails = { email: string, password: string }

const publicUserColumns = {
  id: true,
  createdAt: true,
  name: true,
  username: true,
  image: true,
  uploadedImage: true,
} as const

const createUserAccount = async ({
  email,
  password,
  ctx
}: UserDetails & { ctx: TRPCContext }
): Promise<UserDetails & { userId: string }> => {
  email = email.trim().toLowerCase()
  const userExists = await ctx.db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (userExists) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Email is already used"
    });
  }

  const transactionResponse = await ctx.db.transaction(async (transaction) => {
    const newUser: NewUser = { email };

    const createdUser = await transaction
      .insert(users)
      .values(newUser)
      .returning({ id: users.id });

    const createdUserId = createdUser[0]?.id;
    if (!createdUserId) {
      throw new TRPCError({
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
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Something went wrong creating your user account."
      });
    }

    await provisionUserRecords(transaction, createdUserId, {
      password,
      awardEarlyUserBadge: true,
    })

    return createdUserId;
  });

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

function uploadBufferToCloudinary(
  buffer: Buffer, 
  options?: UploadApiOptions
): Promise<UploadApiResponse | undefined> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    }).end(buffer);
  });
}

export const userRouter = createTRPCRouter({
  getSocketToken: protectedProcedure.query(({ ctx }) => ({
    token: createSocketToken(getCtxUserId(ctx)),
  })),

  createUser: protectedProcedure
    .input(z.object({
      username: z.string().trim().min(3).max(20).regex(
        /^[a-zA-Z0-9_]+$/,
        "Use only letters, numbers, and underscores.",
      )
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
      await ctx.db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ username })
          .where(eq(users.id, userId))

        await provisionUserRecords(tx, userId)
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
          userSettings: true,
          userProfile: {
            with: {
              badge: true
            }
          }
        }
      })

      if (!user) throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User not found.'
      })

      return user
    }),

  getUserById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const userId = getCtxUserId(ctx)
      if (input !== userId) {
        const blocked = await ctx.db.query.userBlock.findFirst({
          where: or(
            and(eq(userBlock.blockerId, userId), eq(userBlock.blockedId, input)),
            and(eq(userBlock.blockerId, input), eq(userBlock.blockedId, userId)),
          ),
          columns: { blockerId: true },
        })
        if (blocked) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." })
      }
      return await ctx.db.query.users.findFirst({
        where: eq(users.id, input),
        columns: publicUserColumns,
      })
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

      const blockedIds = await getBlockedUserIds(ctx.db, myUserId)

      return await ctx.db.query.users.findMany({
        where: and(
          ne(users.id, myUserId),
          isNotNull(users.username),
          blockedIds.length ? notInArray(users.id, blockedIds) : undefined,
        ),
        columns: publicUserColumns,
      })
    }),

  uploadProfilePicture: protectedProcedure
    .input(
      z.object({
        image: z.object({
          name: z.string(),
          type: z.string().regex(/^image\/(jpeg|png|webp)$/),
          base64: z.string().max(12_000_000),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      if (!userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Incorrect session.'
        })
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId)
      })

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong fetching your data. Try again later!"
        })
      }

      const { base64 } = input.image

      // 1) Strip off the data URL prefix if needed
      const rawBase64 = base64.replace(/^data:image\/(jpeg|png|webp);base64,/, "")

      // 2) Convert base64 -> Buffer
      const fileBuffer = Buffer.from(rawBase64, "base64")
      if (fileBuffer.byteLength > 8 * 1024 * 1024) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "Profile images must be smaller than 8 MB.",
        })
      }

      let normalizedImage: Buffer
      try {
        normalizedImage = await sharp(fileBuffer)
          .rotate()
          .resize(512, 512, { fit: "cover" })
          .webp({ quality: 85 })
          .toBuffer()
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The uploaded file is not a valid image.",
        })
      }

      // 3) Upload to Cloudinary via our helper
      // Pass any upload options you want, for example:
      const result = await uploadBufferToCloudinary(normalizedImage, {
        resource_type: "image",
        folder: userId,
        public_id: "avatar",
        format: "webp",
        overwrite: true,
      })

      if (!result?.secure_url || !result.public_id) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Upload failed" })
      }

      // 4) Save that URL in your database
      await ctx.db.update(users)
        .set({
          uploadedImage: result.secure_url,
          uploadedImagePublicId: result.public_id,
        })
        .where(eq(users.id, userId))

      return result.secure_url
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
        await createUserAccount({
          ctx,
          email: decodedEmail,
          password: decodedHashedPassword,
        });
  
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

      const email = input.email.trim().toLowerCase()
      const { password } = input
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

      try {
        const { error } = await sendVerifyEmail({ email, code })
        if (!error) return

        console.error("Email provider rejected verification email", error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: env.NODE_ENV === "development"
            ? `Email provider rejected the message: ${error.message}`
            : 'Could not send the email. Please try again.'
        })
      } catch (error) {
        await ctx.db.delete(verificationQueue).where(eq(verificationQueue.token, token))

        if (error instanceof TRPCError) throw error
        console.error("Could not send verification email", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not send the email. Please try again.",
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
        where: sql`lower(${users.username}) = lower(${input.trim()})`,
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
          userOneUser: { columns: publicUserColumns },
          userTwoUser: { columns: publicUserColumns }
        },
      })

      return friendShips.map(friendShip => {
        const friend = friendShip.userOneUser.id === userId
          ? friendShip.userTwoUser
          : friendShip.userOneUser
        
        return {
          ...friend,
          friendSince: friendShip.createdAt,
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
          fromUser: { columns: publicUserColumns },
          toUser: { columns: publicUserColumns }
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

      if (!myUserId || !toUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing data in the request."
        })
      }

      if (myUserId === toUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot send a friend request to yourself."
        })
      }

      const blocked = await ctx.db.query.userBlock.findFirst({
        where: or(
          and(eq(userBlock.blockerId, myUserId), eq(userBlock.blockedId, toUserId)),
          and(eq(userBlock.blockerId, toUserId), eq(userBlock.blockedId, myUserId)),
        ),
      })
      if (blocked) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Friend requests are unavailable for this user." })
      }

      const existingPendingRequest = await ctx.db.query.friendRequest.findFirst({
        where: and(
          or(
            and(
              eq(friendRequest.fromUserId, myUserId),
              eq(friendRequest.toUserId, toUserId)
            ),
            and(
              eq(friendRequest.fromUserId, toUserId),
              eq(friendRequest.toUserId, myUserId)
            )
          ),
          eq(friendRequest.accepted, false),
          eq(friendRequest.ignored, false)
        )
      })

      if (existingPendingRequest) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have a pending friend request with this user."
        })
      }

      const createdFriendRequest = (await ctx.db.insert(friendRequest).values({
        fromUserId: myUserId,
        toUserId: toUserId
      }).returning()).at(0)

      try {
        if (createdFriendRequest) {
          await createNewFriendRequestNotification(ctx, createdFriendRequest)
        }
      } catch (e) {
        console.log(e)
      }
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

      const blocked = await ctx.db.query.userBlock.findFirst({
        where: or(
          and(eq(userBlock.blockerId, myUserId), eq(userBlock.blockedId, activeFriendRequest.fromUserId)),
          and(eq(userBlock.blockerId, activeFriendRequest.fromUserId), eq(userBlock.blockedId, myUserId)),
        ),
      })
      if (blocked) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This friend request can no longer be accepted." })
      }

      const updatedFriendRequest = await ctx.db.transaction(async (tx) => {
        await tx.insert(friendShip).values({
          userOne: activeFriendRequest.toUserId,
          userTwo: activeFriendRequest.fromUserId
        }).onConflictDoNothing()

        return (await tx.update(friendRequest).set({
          accepted: true
        }).where(and(
          eq(friendRequest.id, activeFriendRequest.id),
          eq(friendRequest.toUserId, myUserId),
          eq(friendRequest.accepted, false),
          eq(friendRequest.ignored, false),
        )).returning()).at(0)
      })

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

  getBlockedUsers: protectedProcedure.query(async ({ ctx }) => {
    const userId = getCtxUserId(ctx)
    const rows = await ctx.db.query.userBlock.findMany({
      where: eq(userBlock.blockerId, userId),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      with: { blocked: { columns: publicUserColumns } },
    })
    return rows.map((row) => ({ ...row.blocked, blockedAt: row.createdAt }))
  }),

  blockUser: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input: blockedId }) => {
      const blockerId = getCtxUserId(ctx)
      if (blockerId === blockedId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot block yourself." })
      }
      const target = await ctx.db.query.users.findFirst({
        where: eq(users.id, blockedId),
        columns: { id: true },
      })
      if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." })

      await ctx.db.transaction(async (tx) => {
        await tx.insert(userBlock).values({ blockerId, blockedId }).onConflictDoNothing()
        await tx.delete(friendShip).where(or(
          and(eq(friendShip.userOne, blockerId), eq(friendShip.userTwo, blockedId)),
          and(eq(friendShip.userOne, blockedId), eq(friendShip.userTwo, blockerId)),
        ))
        await tx.delete(friendRequest).where(or(
          and(eq(friendRequest.fromUserId, blockerId), eq(friendRequest.toUserId, blockedId)),
          and(eq(friendRequest.fromUserId, blockedId), eq(friendRequest.toUserId, blockerId)),
        ))
      })
      return { blocked: true }
    }),

  unblockUser: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input: blockedId }) => {
      const blockerId = getCtxUserId(ctx)
      await ctx.db.delete(userBlock).where(and(
        eq(userBlock.blockerId, blockerId),
        eq(userBlock.blockedId, blockedId),
      ))
      return { blocked: false }
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

