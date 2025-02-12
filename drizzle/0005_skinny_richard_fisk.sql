ALTER TABLE "exerciseToMuscle" DROP CONSTRAINT "exerciseToMuscle_muscle_id_muscle_id_fk";
--> statement-breakpoint
ALTER TABLE "exerciseToMuscle" ADD CONSTRAINT "exerciseToMuscle_muscle_id_muscle_id_fk" FOREIGN KEY ("muscle_id") REFERENCES "public"."muscle"("id") ON DELETE cascade ON UPDATE no action;