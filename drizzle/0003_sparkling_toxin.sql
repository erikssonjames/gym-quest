ALTER TABLE "exerciseMuscle" RENAME TO "exerciseToMuscle";--> statement-breakpoint
ALTER TABLE "exerciseToMuscle" DROP CONSTRAINT "exerciseMuscle_exercise_id_exercise_id_fk";
--> statement-breakpoint
ALTER TABLE "exerciseToMuscle" DROP CONSTRAINT "exerciseMuscle_muscle_id_muscle_id_fk";
--> statement-breakpoint
ALTER TABLE "exerciseToMuscle" DROP CONSTRAINT "exerciseMuscle_exercise_id_muscle_id_pk";--> statement-breakpoint
ALTER TABLE "exerciseToMuscle" ADD CONSTRAINT "exerciseToMuscle_exercise_id_muscle_id_pk" PRIMARY KEY("exercise_id","muscle_id");--> statement-breakpoint
ALTER TABLE "exerciseToMuscle" ADD CONSTRAINT "exerciseToMuscle_exercise_id_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exerciseToMuscle" ADD CONSTRAINT "exerciseToMuscle_muscle_id_muscle_id_fk" FOREIGN KEY ("muscle_id") REFERENCES "public"."muscle"("id") ON DELETE no action ON UPDATE no action;