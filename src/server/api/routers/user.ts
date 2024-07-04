import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure
} from "@/server/api/trpc";
import { type NewUser, type NewAccount, users, accounts, userSettings, type NewUserSettings, verificationQueue } from "@/server/db/schema/user";
import { and, eq, lt, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { hashPassword, isPasswordValid } from "@/lib/hash";
import { BORDER_RADIUS_ARRAY, COLOR_THEMES_ARRAY } from "@/variables/settings";
import jwt from 'jsonwebtoken'
import { env } from "@/env";
import { type TRPCContext } from "@/trpc/server";
import { DateTime } from "luxon";
import sendVerifyEmail from "@/lib/emailUtils";

type UserDetails = {email: string, password: string }

const createUserAccount = async ({
        email,
        password,
        ctx
    }: 
    UserDetails & { ctx: TRPCContext }
): Promise<TRPCError | UserDetails & { userId: string }> => {
    const userExists = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
    })

    if (userExists) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: 'Email is already used'
        })
    }

    const transactionResponse: string | TRPCError = await ctx.db.transaction(async (transaction) => {
        const newUser: NewUser = {
            email,
            password,
        }

        const createdUser = await transaction
            .insert(users)
            .values(newUser)
            .returning({ id: users.id })
        const createdUserId = createdUser[0]?.id
        
        if (!createdUserId) {
            return new TRPCError({
                code: "BAD_REQUEST",
                message: 'Something went wrong creating your user account.'
            })
        }

        const newAccount: NewAccount = {
            type: "credentials",
            provider: 'credentials',
            providerAccountId: '0',
            userId: createdUserId
        }
    
        const createdAccount = await transaction.insert(accounts).values(newAccount)
        if (createdAccount.length === 0) {
            return new TRPCError({
                code: "BAD_REQUEST",
                message: 'Something went wrong creating your user account.'
            })
        }
        
        return createdUserId
    })

    if (transactionResponse instanceof TRPCError) {
        return transactionResponse
    }

    return {
        userId: transactionResponse,
        email,
        password
    }
}

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

            const hashedPasssword = await hashPassword(password)

            const token = jwt.sign({
                email,
                password
            }, env.AUTH_EMAIL_SECRET + email, { expiresIn: 60 * 5 })

            await ctx.db.insert(verificationQueue).values({
                email,
                password: hashedPasssword,
                hashKey: token
            })

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
        .input(z.object({
            token: z.string(),
            email: z.string().email()
        }))
        .mutation(async ({ ctx, input }) => {
            const { token, email } = input

            try {
                const decoded = jwt.verify(token, env.AUTH_EMAIL_SECRET + email)
                if (decoded && typeof decoded !== 'string') {
                    const { email, password } = decoded as { email: string, password: string }

                    if (!email || !password) {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: 'Incorrect token.'
                        })
                    }

                    const result: UserDetails | TRPCError = 
                        await ctx.db.transaction<UserDetails | TRPCError>(async (transaction) => {
                        
                        const storedDetails: UserDetails | undefined = await transaction.query.verificationQueue.findFirst({
                            where: and(
                                eq(verificationQueue.email, email),
                                eq(verificationQueue.hashKey, token)
                            ),
                            columns: {
                                email: true,
                                password: true
                            }
                        })

                        if (!storedDetails) {
                            return new TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Could not verify email.'
                            })
                        }

                        // 1 hour ago
                        const currentTime = DateTime.now()
                        const hourAgo = currentTime.minus({ hours: 1 }).toJSDate()

                        await transaction.delete(verificationQueue).where(or(
                            eq(verificationQueue.email, email),
                            lt(verificationQueue.timeRequested, hourAgo)
                        ))

                        return storedDetails
                    })

                    if (result instanceof TRPCError) throw result

                    const { email: storedEmail, password: storedPassword } = result

                    const validPassword = await isPasswordValid(
                        password,
                        storedPassword
                    )

                    if (!validPassword) {
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Something went wrong. (2)'
                        })
                    }

                    await createUserAccount({
                        ctx,
                        email: storedEmail,
                        password: storedPassword
                    })

                    return {
                        password,
                        email
                    }
                } else {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Invalid request.'
                    })
                }
            } catch (e) {
                if (e instanceof TRPCError) {
                    throw e
                } else {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Oops, something went wrong there!'
                    })
                }
            }
        })
});

