CREATE TABLE "workoutToUser" (
	"userId" uuid NOT NULL,
	"workoutId" uuid NOT NULL,
	CONSTRAINT "workoutToUser_userId_workoutId_pk" PRIMARY KEY("userId","workoutId")
);
--> statement-breakpoint
ALTER TABLE "workoutToUser" ADD CONSTRAINT "workoutToUser_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutToUser" ADD CONSTRAINT "workoutToUser_workoutId_workout_id_fk" FOREIGN KEY ("workoutId") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;