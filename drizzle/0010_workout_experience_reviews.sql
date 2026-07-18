CREATE TYPE "public"."workoutExperienceReviewStatus" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "workoutExperienceReview" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workoutSessionId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"status" "workoutExperienceReviewStatus" DEFAULT 'pending' NOT NULL,
	"proposedExperience" bigint NOT NULL,
	"reasons" text[] NOT NULL,
	"completedSetCount" integer NOT NULL,
	"totalVolume" bigint NOT NULL,
	"maxWeight" integer NOT NULL,
	"maxReps" integer NOT NULL,
	"maxSetVolume" bigint NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewedAt" timestamp with time zone,
	"reviewedBy" uuid,
	CONSTRAINT "workoutExperienceReview_workoutSessionId_unique" UNIQUE("workoutSessionId")
);
--> statement-breakpoint
ALTER TABLE "workoutExperienceReview" ADD CONSTRAINT "workoutExperienceReview_workoutSessionId_workoutSession_id_fk" FOREIGN KEY ("workoutSessionId") REFERENCES "public"."workoutSession"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutExperienceReview" ADD CONSTRAINT "workoutExperienceReview_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutExperienceReview" ADD CONSTRAINT "workoutExperienceReview_reviewedBy_user_id_fk" FOREIGN KEY ("reviewedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workout_experience_review_status_created_idx" ON "workoutExperienceReview" USING btree ("status","createdAt");--> statement-breakpoint
CREATE INDEX "workout_experience_review_user_created_idx" ON "workoutExperienceReview" USING btree ("userId","createdAt");