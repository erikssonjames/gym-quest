import { 
  STANDARD_BORDER_RADIUS, 
  STANDARD_COLOR_THEME, 
  type BORDER_RADIUS, 
  type COLOR_THEMES
} from "@/variables/settings";
import {
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  varchar,
  pgTable,
  uuid
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

type ExtraAdapterAccountType = AdapterAccountType | 'credentials'

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  username: varchar("username", { length: 20 }).unique(),
  password: varchar("password"),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  image: varchar("image", { length: 255 }),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<ExtraAdapterAccountType>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  })
);

export const sessions = pgTable(
  "session",
  {
    sessionToken: text("sessionToken").primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  })
);


export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull().unique(),
    token: text("token").notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const userSettings = pgTable("userSettings", {
  userId: uuid('userId')
    .primaryKey()
    .references(() => users.id, { onDelete:  'cascade' }),
  colorTheme: varchar('colorTheme', { length: 20 })
    .$type<COLOR_THEMES>()
    .$default(() => STANDARD_COLOR_THEME)
    .notNull(),
  borderRadius: varchar('borderRadius', { length: 20 })
    .$type<BORDER_RADIUS>()
    .$default(() => STANDARD_BORDER_RADIUS)
    .notNull()
})

export const verificationQueue = pgTable("verificationQueue", {
  timeRequested: timestamp("timeRequested", {
    mode: "date",
    withTimezone: true
  }).defaultNow().notNull(),
  token: varchar("token").unique().notNull(),
  email: varchar("email").notNull()
});

export const waitlists = pgTable("waitlist", {
  email: varchar("email", { length: 255 })
    .unique()
    .primaryKey()
    .notNull(),
  timeSubmitted: timestamp('timeSubmitted', {
    mode: 'date',
    withTimezone: true
  }).defaultNow().notNull()
})

export type NewUserSettings = typeof userSettings.$inferInsert

export type NewUser = typeof users.$inferInsert
export type NewAccount = typeof accounts.$inferInsert
