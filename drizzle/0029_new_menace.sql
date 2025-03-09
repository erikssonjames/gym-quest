CREATE TYPE "public"."userRole" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "badge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"group" text
);
--> statement-breakpoint
CREATE TABLE "badgeToUser" (
	"userId" uuid NOT NULL,
	"badgeId" uuid NOT NULL,
	CONSTRAINT "badgeToUser_userId_badgeId_pk" PRIMARY KEY("userId","badgeId")
);
--> statement-breakpoint
CREATE TABLE "userPrivateInformation" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"password" varchar,
	"role" "userRole" DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "badgeToUser" ADD CONSTRAINT "badgeToUser_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badgeToUser" ADD CONSTRAINT "badgeToUser_badgeId_badge_id_fk" FOREIGN KEY ("badgeId") REFERENCES "public"."badge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userPrivateInformation" ADD CONSTRAINT "userPrivateInformation_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;