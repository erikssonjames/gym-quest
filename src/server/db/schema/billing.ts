import { boolean, integer, index, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core"
import { users } from "./user"

export const billingPlan = pgTable("billingPlan", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  stripeProductId: text("stripeProductId"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
})

export const billingPrice = pgTable("billingPrice", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("planId").references(() => billingPlan.id, { onDelete: "cascade" }).notNull(),
  stripePriceId: text("stripePriceId").notNull().unique(),
  currency: text("currency").notNull(),
  amount: integer("amount").notNull(),
  interval: text("interval").notNull(),
  active: boolean("active").notNull().default(true),
})

export const billingEntitlement = pgTable("billingEntitlement", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("planId").references(() => billingPlan.id, { onDelete: "cascade" }).notNull(),
  featureKey: text("featureKey").notNull(),
  limitValue: integer("limitValue"),
  limitUnit: text("limitUnit"),
}, (table) => [unique().on(table.planId, table.featureKey)])

export const billingCustomer = pgTable("billingCustomer", {
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).primaryKey(),
  stripeCustomerId: text("stripeCustomerId").notNull().unique(),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
})

export const billingSubscription = pgTable("billingSubscription", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  planId: uuid("planId").references(() => billingPlan.id).notNull(),
  stripeSubscriptionId: text("stripeSubscriptionId").notNull().unique(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart", { mode: "date", withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd", { mode: "date", withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  trialEnd: timestamp("trialEnd", { mode: "date", withTimezone: true }),
  updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("billing_subscription_user_idx").on(table.userId, table.status)])

export const billingSubscriptionEvent = pgTable("billingSubscriptionEvent", {
  id: uuid("id").defaultRandom().primaryKey(),
  stripeEventId: text("stripeEventId").notNull().unique(),
  eventType: text("eventType").notNull(),
  payloadHash: text("payloadHash").notNull(),
  status: text("status").notNull(),
  errorMessage: text("errorMessage"),
  processedAt: timestamp("processedAt", { mode: "date", withTimezone: true }),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
})

export const aiUsagePeriod = pgTable("aiUsagePeriod", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  periodStart: timestamp("periodStart", { mode: "date", withTimezone: true }).notNull(),
  periodEnd: timestamp("periodEnd", { mode: "date", withTimezone: true }).notNull(),
  reservedTokens: integer("reservedTokens").notNull().default(0),
  inputTokens: integer("inputTokens").notNull().default(0),
  outputTokens: integer("outputTokens").notNull().default(0),
  totalTokens: integer("totalTokens").notNull().default(0),
  requestCount: integer("requestCount").notNull().default(0),
  estimatedCostMicros: integer("estimatedCostMicros").notNull().default(0),
}, (table) => [unique().on(table.userId, table.periodStart), index("ai_usage_period_user_idx").on(table.userId, table.periodEnd)])

export const aiUsageEvent = pgTable("aiUsageEvent", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  periodId: uuid("periodId").references(() => aiUsagePeriod.id, { onDelete: "cascade" }).notNull(),
  requestId: text("requestId").notNull().unique(),
  model: text("model").notNull(),
  inputTokens: integer("inputTokens").notNull(),
  outputTokens: integer("outputTokens").notNull(),
  totalTokens: integer("totalTokens").notNull(),
  estimatedCostMicros: integer("estimatedCostMicros").notNull().default(0),
  status: text("status").notNull(),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("ai_usage_event_user_idx").on(table.userId, table.createdAt)])

export const ownerRevenueLedger = pgTable("ownerRevenueLedger", {
  id: uuid("id").defaultRandom().primaryKey(),
  stripeEventId: text("stripeEventId").unique(),
  stripeInvoiceId: text("stripeInvoiceId"),
  stripePaymentIntentId: text("stripePaymentIntentId"),
  entryType: text("entryType").notNull(),
  grossAmount: integer("grossAmount").notNull().default(0),
  discountAmount: integer("discountAmount").notNull().default(0),
  taxAmount: integer("taxAmount").notNull().default(0),
  feeAmount: integer("feeAmount").notNull().default(0),
  refundAmount: integer("refundAmount").notNull().default(0),
  netAmount: integer("netAmount").notNull().default(0),
  currency: text("currency").notNull(),
  status: text("status").notNull(),
  occurredAt: timestamp("occurredAt", { mode: "date", withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("owner_revenue_invoice_type_idx").on(table.stripeInvoiceId, table.entryType), index("owner_revenue_occurred_idx").on(table.occurredAt)])
