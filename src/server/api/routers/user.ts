import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure
} from "@/server/api/trpc";
import { type NewUser, type NewAccount, users, accounts, userSettings, type NewUserSettings, verificationQueue, waitlists } from "@/server/db/schema/user";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { hashPassword, isPasswordValid } from "@/lib/hash";
import { BORDER_RADIUS_ARRAY, COLOR_THEMES_ARRAY } from "@/variables/settings";
import jwt from 'jsonwebtoken'
import { env } from "@/env";
import { type TRPCContext } from "@/trpc/server";
import { DateTime } from "luxon";
import sendVerifyEmail from "@/lib/emailUtils";
import { signIn } from "@/auth";

type UserDetails = {email: string, password: string }

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
        console.log("createUserAccount.ERROR - User creation failed");
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

export const userRouter = createTRPCRouter({
  signup: publicProcedure
    .input(z.object({ 
      email: z.string().email(),
      password: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      const { password, email } = input

      const userExists = await ctx.db.query.users.findFirst({
        where: eq(users.email, email)
      })

      if (userExists) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email is already used.'
        })
      }

      const existsInVerificationQueue = await ctx.db.query.verificationQueue.findFirst({
        where: eq(verificationQueue.email, email),
        columns: {
          timeRequested: true
        }
      })

      const currentTime = DateTime.now()
      const fiveMinutesAgo = currentTime.minus({ minutes: 5 }).toJSDate()

      if (existsInVerificationQueue && existsInVerificationQueue.timeRequested > fiveMinutesAgo) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have a pending verification in your email.'
        })
      }

      if (existsInVerificationQueue) {
        await ctx.db.delete(verificationQueue).where(
          eq(verificationQueue.email, email)
        )
      }

      const token = jwt.sign({
        email,
        password
      }, env.AUTH_EMAIL_SECRET + email, { expiresIn: 60 * 5 })

      const { error } = await sendVerifyEmail({
        email,
        token
      })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not send the email. Please try again.'
        })
      }

      const hashedPasssword = await hashPassword(password)

      await ctx.db.insert(verificationQueue).values({
        email,
        password: hashedPasssword,
        hashKey: token
      })

      return
    }),

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
        token: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { token, email } = input;
  
      try {
        // 🔹 Verify JWT Token
        const decoded = jwt.verify(token, env.AUTH_EMAIL_SECRET + email);
  
        if (!decoded || typeof decoded !== "object") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Invalid or expired token.",
          });
        }
  
        const { email: decodedEmail, password: decodedPassword } = decoded as {
          email: string;
          password: string;
        };
  
        if (!decodedEmail || !decodedPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token payload is missing required fields.",
          });
        }
  
        // 🔹 Verify Email in Database
        const transactionResult = await ctx.db.transaction<
          UserDetails | TRPCError
        >(async (transaction) => {
          const storedDetails = await transaction.query.verificationQueue.findFirst({
            where: and(
              eq(verificationQueue.email, decodedEmail),
              eq(verificationQueue.hashKey, token)
            ),
            columns: { email: true, password: true },
          });
  
          if (!storedDetails) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Email verification failed. Invalid or expired token.",
            });
          }
  
          await transaction.delete(verificationQueue).where(eq(verificationQueue.email, decodedEmail));
          return storedDetails;
        });
  
        if (transactionResult instanceof TRPCError) {
          throw transactionResult;
        }
  
        const { email: storedEmail, password: storedPassword } = transactionResult;
  
        // 🔹 Validate Password
        const isPasswordCorrect = await isPasswordValid(decodedPassword, storedPassword);
        if (!isPasswordCorrect) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials. Please try again.",
          });
        }
  
        // 🔹 Create User Account
        const createdUser = await createUserAccount({
          ctx,
          email: storedEmail,
          password: storedPassword,
        });
  
        if (createdUser instanceof TRPCError) {
          throw createdUser;
        }

        await signIn("credentials", {
          redirect: false, // Prevent automatic redirection
          email: storedEmail,
          password: storedPassword,
        });
  
        return {
          message: "Email verified successfully!",
          email: storedEmail,
        };
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
    })
});

