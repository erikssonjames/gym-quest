import Discord from 'next-auth/providers/discord'
import Credentials from 'next-auth/providers/credentials'
import { type NextAuthConfig, type DefaultSession } from 'next-auth'
import type { Provider } from 'next-auth/providers'
import { db } from './server/db'
import { isPasswordValid } from '@/lib/hash'
import { eq, or } from 'drizzle-orm'
import { type UserRole, users } from './server/db/schema/user'
import { signInSchema } from './lib/zod'
import { env } from './env'
import { type PROVIDER, PROVIDERS_ARRAY } from './variables/auth'

export const providers: Provider[] = [
  Discord, 
  Credentials({
    name: "Credentials",
    credentials: {
      email: {},
      username: {},
      password: {}
    },
    async authorize(credentials) {
      let username: string | undefined = '', 
        email: string | undefined = '', 
        password: string | undefined = ''
      try {
        const parsedCredentials = await signInSchema.parseAsync(credentials)
        username = parsedCredentials.username
        email = parsedCredentials.email
        password = parsedCredentials.password
      } catch(e) {
        return null
      }

      const user = await db.query.users.findFirst({
        where: or(
          eq(users.username, username ?? ''),
          eq(users.email, email ?? ''),
        ),
        with: {
          userPrivateInformation: {
            columns: {
              password: true,
            }
          }
        }
      })

      if (!user) return null

      const storedPassword = user.userPrivateInformation?.password

      // User doesn't have credentials set up
      if (!storedPassword) return null

      const validPassword = await isPasswordValid(
        password,
        storedPassword
      )

      if (!validPassword) return null

      return {
        name: user.name,
        email: user.email,
        image: user.image,
        id: user.id
      }
    },
  })
]

export default { 
  providers: providers,
  pages: {
    signIn: '/signin',
    error: '/signin'
  },
  secret: env.AUTH_SECRET,
} satisfies NextAuthConfig

declare module 'next-auth' {
  interface Session {
    user: {
      username?: string,
      provider: PROVIDER,
      role: UserRole
    } & DefaultSession['user']
  } 
}

export const providerMap: { id: PROVIDER, name: string }[] = providers.map((provider) => {
  if (typeof provider === 'function') {
    const providerData = provider()
    if (!PROVIDERS_ARRAY.includes(providerData.id as PROVIDER)) throw new Error('Missing provider in types')
    return { id: providerData.id, name: providerData.name } as { id: PROVIDER, name: string }
  } else {
    if (!PROVIDERS_ARRAY.includes(provider.id as PROVIDER)) throw new Error('Missing provider in types')
    return { id: provider.id, name: provider.name } as { id: PROVIDER, name: string }
  }
})
  