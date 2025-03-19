ALTER TYPE "public"."userRole" ADD VALUE 'superAdmin' BEFORE 'admin';--> statement-breakpoint
CREATE TABLE "userProfile" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"selectedBadge" text
);
--> statement-breakpoint
ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_selectedBadge_badge_id_fk" FOREIGN KEY ("selectedBadge") REFERENCES "public"."badge"("id") ON DELETE set null ON UPDATE no action;