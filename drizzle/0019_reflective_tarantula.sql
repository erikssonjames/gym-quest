CREATE TABLE "exercisePublicRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execiseId" uuid NOT NULL,
	"requestMadeAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "exercisePublicRequest" ADD CONSTRAINT "exercisePublicRequest_execiseId_exercise_id_fk" FOREIGN KEY ("execiseId") REFERENCES "public"."exercise"("id") ON DELETE cascade ON UPDATE no action;