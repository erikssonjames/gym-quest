CREATE TABLE "workoutTable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"workoutId" uuid,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"endedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "workoutSessionLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionId" uuid NOT NULL,
	"exerciseId" uuid,
	"order" integer NOT NULL,
	"reps" integer[] NOT NULL,
	"weight" integer[] NOT NULL,
	"restTime" integer[] NOT NULL,
	"duration" integer[] NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"endedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "workoutTable" ADD CONSTRAINT "workoutTable_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutTable" ADD CONSTRAINT "workoutTable_workoutId_workout_id_fk" FOREIGN KEY ("workoutId") REFERENCES "public"."workout"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSessionLog" ADD CONSTRAINT "workoutSessionLog_sessionId_workoutTable_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."workoutTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSessionLog" ADD CONSTRAINT "workoutSessionLog_exerciseId_exercise_id_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercise"("id") ON DELETE set null ON UPDATE no action;