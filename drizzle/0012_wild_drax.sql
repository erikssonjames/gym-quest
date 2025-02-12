ALTER TABLE "workoutTable" RENAME TO "workoutSession";--> statement-breakpoint
ALTER TABLE "workoutSession" DROP CONSTRAINT "workoutTable_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "workoutSession" DROP CONSTRAINT "workoutTable_workoutId_workout_id_fk";
--> statement-breakpoint
ALTER TABLE "workoutSessionLog" DROP CONSTRAINT "workoutSessionLog_sessionId_workoutTable_id_fk";
--> statement-breakpoint
ALTER TABLE "workoutSession" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutSession" ALTER COLUMN "workoutId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutSession" ADD CONSTRAINT "workoutSession_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSession" ADD CONSTRAINT "workoutSession_workoutId_workout_id_fk" FOREIGN KEY ("workoutId") REFERENCES "public"."workout"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSessionLog" ADD CONSTRAINT "workoutSessionLog_sessionId_workoutSession_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."workoutSession"("id") ON DELETE cascade ON UPDATE no action;