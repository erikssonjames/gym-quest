CREATE TYPE "public"."feedbackType" AS ENUM('bug', 'feature', 'improvement', 'other');--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text NOT NULL,
	"userId" uuid,
	"timestamp" timestamp DEFAULT now(),
	"url" text NOT NULL,
	"type" "feedbackType" DEFAULT 'other' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;