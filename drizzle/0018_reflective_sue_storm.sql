ALTER TABLE "workoutSessionLog" DROP CONSTRAINT "workoutSessionLog_workoutSetCollectionId_workoutSetCollection_id_fk";
--> statement-breakpoint
ALTER TABLE "exercise" ADD COLUMN "isPublic" boolean;--> statement-breakpoint
ALTER TABLE "workoutSessionLog" ADD CONSTRAINT "workoutSessionLog_workoutSetCollectionId_workoutSetCollection_id_fk" FOREIGN KEY ("workoutSetCollectionId") REFERENCES "public"."workoutSetCollection"("id") ON DELETE set null ON UPDATE no action;