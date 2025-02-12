ALTER TABLE "muscle_group" RENAME TO "muscleGroup";--> statement-breakpoint
ALTER TABLE "exercise_muscle" RENAME TO "exerciseMuscle";--> statement-breakpoint
ALTER TABLE "muscle" RENAME COLUMN "muscle_group_id" TO "muscleGroupId";--> statement-breakpoint
ALTER TABLE "muscle" DROP CONSTRAINT "muscle_muscle_group_id_muscle_group_id_fk";
--> statement-breakpoint
ALTER TABLE "exerciseMuscle" DROP CONSTRAINT "exercise_muscle_exercise_id_exercise_id_fk";
--> statement-breakpoint
ALTER TABLE "exerciseMuscle" DROP CONSTRAINT "exercise_muscle_muscle_id_muscle_id_fk";
--> statement-breakpoint
ALTER TABLE "exerciseMuscle" DROP CONSTRAINT "exercise_muscle_exercise_id_muscle_id_pk";--> statement-breakpoint
ALTER TABLE "exerciseMuscle" ADD CONSTRAINT "exerciseMuscle_exercise_id_muscle_id_pk" PRIMARY KEY("exercise_id","muscle_id");--> statement-breakpoint
ALTER TABLE "muscle" ADD CONSTRAINT "muscle_muscleGroupId_muscleGroup_id_fk" FOREIGN KEY ("muscleGroupId") REFERENCES "public"."muscleGroup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exerciseMuscle" ADD CONSTRAINT "exerciseMuscle_exercise_id_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exerciseMuscle" ADD CONSTRAINT "exerciseMuscle_muscle_id_muscle_id_fk" FOREIGN KEY ("muscle_id") REFERENCES "public"."muscle"("id") ON DELETE no action ON UPDATE no action;