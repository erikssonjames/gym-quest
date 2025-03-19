CREATE TYPE "public"."badgeType" AS ENUM('weight', 'streaks', 'number');--> statement-breakpoint
CREATE TABLE "badgeProgress" (
	"userId" uuid NOT NULL,
	"badgeId" uuid NOT NULL,
	"completed" boolean NOT NULL,
	"currentValue" integer NOT NULL,
	CONSTRAINT "badgeProgress_userId_badgeId_pk" PRIMARY KEY("userId","badgeId")
);
--> statement-breakpoint
DROP TABLE "badgeToUser" CASCADE;--> statement-breakpoint
ALTER TABLE "badge" ADD COLUMN "valueToComplete" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "badge" ADD COLUMN "valueName" text NOT NULL;--> statement-breakpoint
ALTER TABLE "badge" ADD COLUMN "valueDescription" text NOT NULL;--> statement-breakpoint
ALTER TABLE "badge" ADD COLUMN "type" "badgeType" NOT NULL;--> statement-breakpoint
ALTER TABLE "badge" ADD COLUMN "percentageOfUsersHasBadge" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "badgeProgress" ADD CONSTRAINT "badgeProgress_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badgeProgress" ADD CONSTRAINT "badgeProgress_badgeId_badge_id_fk" FOREIGN KEY ("badgeId") REFERENCES "public"."badge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge" DROP COLUMN "group";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "password";