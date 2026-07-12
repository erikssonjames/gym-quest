CREATE TABLE "experienceEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"source" text NOT NULL,
	"sourceId" text NOT NULL,
	"amount" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experienceEvent_userId_source_sourceId_unique" UNIQUE("userId","source","sourceId")
);
--> statement-breakpoint
CREATE TABLE "questClaim" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"questId" text NOT NULL,
	"periodKey" text NOT NULL,
	"experienceAwarded" integer NOT NULL,
	"claimedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questClaim_userId_questId_periodKey_unique" UNIQUE("userId","questId","periodKey")
);
--> statement-breakpoint
ALTER TABLE "experienceEvent" ADD CONSTRAINT "experienceEvent_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questClaim" ADD CONSTRAINT "questClaim_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "experience_event_user_created_idx" ON "experienceEvent" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "quest_claim_user_claimed_idx" ON "questClaim" USING btree ("userId","claimedAt");