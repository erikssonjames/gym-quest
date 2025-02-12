ALTER TABLE "workoutRep" RENAME COLUMN "repetitions" TO "amount";--> statement-breakpoint
ALTER TABLE "workoutSet" RENAME COLUMN "sets" TO "amount";--> statement-breakpoint
ALTER TABLE "exercise_muscle" DROP CONSTRAINT "exercise_muscle_muscle_id_muscle_id_fk";
--> statement-breakpoint
ALTER TABLE "exercise_muscle" ADD CONSTRAINT "exercise_muscle_muscle_id_muscle_id_fk" FOREIGN KEY ("muscle_id") REFERENCES "public"."muscle"("id") ON DELETE no action ON UPDATE no action;