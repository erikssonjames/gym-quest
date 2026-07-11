CREATE TABLE "aiUsageEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"periodId" uuid NOT NULL,
	"requestId" text NOT NULL,
	"model" text NOT NULL,
	"inputTokens" integer NOT NULL,
	"outputTokens" integer NOT NULL,
	"totalTokens" integer NOT NULL,
	"estimatedCostMicros" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "aiUsageEvent_requestId_unique" UNIQUE("requestId")
);
--> statement-breakpoint
CREATE TABLE "aiUsagePeriod" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"periodStart" timestamp with time zone NOT NULL,
	"periodEnd" timestamp with time zone NOT NULL,
	"reservedTokens" integer DEFAULT 0 NOT NULL,
	"inputTokens" integer DEFAULT 0 NOT NULL,
	"outputTokens" integer DEFAULT 0 NOT NULL,
	"totalTokens" integer DEFAULT 0 NOT NULL,
	"requestCount" integer DEFAULT 0 NOT NULL,
	"estimatedCostMicros" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "aiUsagePeriod_userId_periodStart_unique" UNIQUE("userId","periodStart")
);
--> statement-breakpoint
CREATE TABLE "billingCustomer" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"stripeCustomerId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "billingCustomer_stripeCustomerId_unique" UNIQUE("stripeCustomerId")
);
--> statement-breakpoint
CREATE TABLE "billingEntitlement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"planId" uuid NOT NULL,
	"featureKey" text NOT NULL,
	"limitValue" integer,
	"limitUnit" text,
	CONSTRAINT "billingEntitlement_planId_featureKey_unique" UNIQUE("planId","featureKey")
);
--> statement-breakpoint
CREATE TABLE "billingPlan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"stripeProductId" text,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "billingPlan_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "billingPrice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"planId" uuid NOT NULL,
	"stripePriceId" text NOT NULL,
	"currency" text NOT NULL,
	"amount" integer NOT NULL,
	"interval" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "billingPrice_stripePriceId_unique" UNIQUE("stripePriceId")
);
--> statement-breakpoint
CREATE TABLE "billingSubscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"planId" uuid NOT NULL,
	"stripeSubscriptionId" text NOT NULL,
	"status" text NOT NULL,
	"currentPeriodStart" timestamp with time zone NOT NULL,
	"currentPeriodEnd" timestamp with time zone NOT NULL,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"trialEnd" timestamp with time zone,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "billingSubscription_stripeSubscriptionId_unique" UNIQUE("stripeSubscriptionId")
);
--> statement-breakpoint
CREATE TABLE "billingSubscriptionEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripeEventId" text NOT NULL,
	"eventType" text NOT NULL,
	"payloadHash" text NOT NULL,
	"status" text NOT NULL,
	"errorMessage" text,
	"processedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "billingSubscriptionEvent_stripeEventId_unique" UNIQUE("stripeEventId")
);
--> statement-breakpoint
CREATE TABLE "ownerRevenueLedger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripeEventId" text,
	"stripeInvoiceId" text,
	"stripePaymentIntentId" text,
	"entryType" text NOT NULL,
	"grossAmount" integer DEFAULT 0 NOT NULL,
	"discountAmount" integer DEFAULT 0 NOT NULL,
	"taxAmount" integer DEFAULT 0 NOT NULL,
	"feeAmount" integer DEFAULT 0 NOT NULL,
	"refundAmount" integer DEFAULT 0 NOT NULL,
	"netAmount" integer DEFAULT 0 NOT NULL,
	"currency" text NOT NULL,
	"status" text NOT NULL,
	"occurredAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ownerRevenueLedger_stripeEventId_unique" UNIQUE("stripeEventId")
);
--> statement-breakpoint
ALTER TABLE "aiUsageEvent" ADD CONSTRAINT "aiUsageEvent_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiUsageEvent" ADD CONSTRAINT "aiUsageEvent_periodId_aiUsagePeriod_id_fk" FOREIGN KEY ("periodId") REFERENCES "public"."aiUsagePeriod"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiUsagePeriod" ADD CONSTRAINT "aiUsagePeriod_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billingCustomer" ADD CONSTRAINT "billingCustomer_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billingEntitlement" ADD CONSTRAINT "billingEntitlement_planId_billingPlan_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."billingPlan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billingPrice" ADD CONSTRAINT "billingPrice_planId_billingPlan_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."billingPlan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billingSubscription" ADD CONSTRAINT "billingSubscription_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billingSubscription" ADD CONSTRAINT "billingSubscription_planId_billingPlan_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."billingPlan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_event_user_idx" ON "aiUsageEvent" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "ai_usage_period_user_idx" ON "aiUsagePeriod" USING btree ("userId","periodEnd");--> statement-breakpoint
CREATE INDEX "billing_subscription_user_idx" ON "billingSubscription" USING btree ("userId","status");--> statement-breakpoint
CREATE UNIQUE INDEX "owner_revenue_invoice_type_idx" ON "ownerRevenueLedger" USING btree ("stripeInvoiceId","entryType");--> statement-breakpoint
CREATE INDEX "owner_revenue_occurred_idx" ON "ownerRevenueLedger" USING btree ("occurredAt");
