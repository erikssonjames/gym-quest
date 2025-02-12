CREATE TABLE "workoutSetCollection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exerciseId" uuid NOT NULL,
	"workoutSetId" uuid NOT NULL,
	"weight" integer[] NOT NULL,
	"reps" integer[] NOT NULL,
	"restTime" integer[] NOT NULL,
	"duration" integer[] NOT NULL
);
--> statement-breakpoint
DROP TABLE "workoutRep" CASCADE;--> statement-breakpoint
ALTER TABLE "workoutSetCollection" ADD CONSTRAINT "workoutSetCollection_exerciseId_exercise_id_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSetCollection" ADD CONSTRAINT "workoutSetCollection_workoutSetId_workoutSet_id_fk" FOREIGN KEY ("workoutSetId") REFERENCES "public"."workoutSet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSet" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "workoutSet" DROP COLUMN "description";