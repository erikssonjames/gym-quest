import NextAuth, { type NextAuthConfig } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./server/db";
import authConfig from "./auth.config";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema/user";
import { randomUUID } from "crypto";
import { encode, decode } from 'next-auth/jwt'
import { type Adapter } from "next-auth/adapters";
import { createCookie, getCookieValue } from "@/app/lib/actions";
import { eq } from "drizzle-orm";

const fromDate = (time: number, date: number = Date.now()) => {
  return new Date(date + time * 1000)
}

export const { auth, handlers, signIn, signOut } = NextAuth(req => {
  const drizzleAdapter: Adapter | undefined = DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  })

  const sessionConfig: {
    strategy?: "jwt" | "database" | undefined;
    maxAge?: number | undefined;
    updateAge?: number | undefined;
    generateSessionToken?: (() => string) | undefined;
  } = {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60
  }

  const nextAuthConfig: NextAuthConfig = {
    session: { ...sessionConfig },
    adapter: drizzleAdapter,
    callbacks: {
      // session: ({ session, user }) => ({
      //   ...session,
      //   user: {

      //     ...session.user,
      //     id: user.id
      //   }
      // }),
      session: async ({ user, session }) => {
        const result = await db.query.accounts.findFirst({
          where: eq(accounts.userId, user.id),
          columns: {
            provider: true
          }
        })

        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            provider: result?.provider
          }
        }
      },
      async signIn({ user }) {
        if (
          req?.nextUrl.pathname.includes('callback') && 
          req?.nextUrl.pathname.includes('credentials') &&
          req?.method === 'POST'
        ) {
            if (user?.id && drizzleAdapter) {
              const sessionToken = randomUUID()
              const sessionMaxAge = 60 * 60 * 24 * 30; // 30 Days
              const sessionExpiry = fromDate(sessionMaxAge)

              await drizzleAdapter?.createSession?.({
                expires: sessionExpiry,
                sessionToken: sessionToken,
                userId: user.id ?? ''
              })

              await createCookie({
                expireDate: sessionExpiry,
                key: 'next-auth.session-token',
                value: sessionToken
              })
            }
        }

        return true
      }
    },
    jwt: {
      encode: async (params) => {
        if (
          req?.nextUrl.pathname.includes('callback') && 
          req?.nextUrl.pathname.includes('credentials') &&
          req?.method === 'POST'
        ) {
          const cookie = await getCookieValue('next-auth.session-token')

          if (cookie) return cookie.value; else return '';
        }

        return encode(params)
      },
      decode: async (params) => {
        if (
          req?.nextUrl.pathname.includes('callback') && 
          req?.nextUrl.pathname.includes('credentials') &&
          req?.method === 'POST'
        ) {
          return null
        }

        return decode(params)
      }
    },
    ...authConfig
  }

  return nextAuthConfig
})