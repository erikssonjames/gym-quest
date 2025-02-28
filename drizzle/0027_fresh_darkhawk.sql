ALTER TABLE "workoutSessionLog" DROP CONSTRAINT "workoutSessionLog_workoutSetCollectionId_workoutSetCollection_id_fk";
--> statement-breakpoint
ALTER TABLE "workoutSessionLog" ALTER COLUMN "startedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "workoutSessionLog" ALTER COLUMN "startedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutSessionLogFragment" ALTER COLUMN "reps" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutSessionLogFragment" ALTER COLUMN "weight" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutSessionLogFragment" ALTER COLUMN "duration" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutSessionLogFragment" ALTER COLUMN "startedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutSessionLog" ADD COLUMN "order" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutSessionLogFragment" ADD COLUMN "order" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutSession" DROP COLUMN "useLastRecordedValue";--> statement-breakpoint
ALTER TABLE "workoutSessionLog" DROP COLUMN "workoutSetCollectionId";--> statement-breakpoint
ALTER TABLE "workoutSessionLogFragment" DROP COLUMN "skipped";