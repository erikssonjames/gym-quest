CREATE TABLE "workoutSessionLogFragment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workoutSessionLogId" uuid NOT NULL,
	"reps" integer NOT NULL,
	"weight" integer,
	"duration" integer,
	"startedAt" timestamp NOT NULL,
	"endedAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workoutSessionLog" RENAME COLUMN "sessionId" TO "workoutSessionId";--> statement-breakpoint
ALTER TABLE "workoutSessionLog" DROP CONSTRAINT "workoutSessionLog_sessionId_workoutSession_id_fk";
--> statement-breakpoint
ALTER TABLE "workoutSessionLogFragment" ADD CONSTRAINT "workoutSessionLogFragment_workoutSessionLogId_workoutSessionLog_id_fk" FOREIGN KEY ("workoutSessionLogId") REFERENCES "public"."workoutSessionLog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSessionLog" ADD CONSTRAINT "workoutSessionLog_workoutSessionId_workoutSession_id_fk" FOREIGN KEY ("workoutSessionId") REFERENCES "public"."workoutSession"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSessionLog" DROP COLUMN "order";--> statement-breakpoint
ALTER TABLE "workoutSessionLog" DROP COLUMN "reps";--> statement-breakpoint
ALTER TABLE "workoutSessionLog" DROP COLUMN "weight";--> statement-breakpoint
ALTER TABLE "workoutSessionLog" DROP COLUMN "restTime";--> statement-breakpoint
ALTER TABLE "workoutSessionLog" DROP COLUMN "duration";