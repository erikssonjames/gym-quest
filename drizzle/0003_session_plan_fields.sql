ALTER TABLE "workoutSession" ALTER COLUMN "startedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "workoutSession" ALTER COLUMN "startedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutSessionLogFragment" ADD COLUMN "restTime" integer DEFAULT 0 NOT NULL;
