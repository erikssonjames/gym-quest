ALTER TABLE "badgeProgress" DROP CONSTRAINT IF EXISTS "badgeProgress_badgeId_badge_id_fk";--> statement-breakpoint
ALTER TABLE "userProfile" DROP CONSTRAINT IF EXISTS "userProfile_selectedBadge_badge_id_fk";--> statement-breakpoint
ALTER TABLE "badgeProgress" DROP CONSTRAINT IF EXISTS "badgeProgress_userId_badgeId_unique";--> statement-breakpoint
ALTER TABLE "badge" DROP CONSTRAINT IF EXISTS "badge_pkey";--> statement-breakpoint
ALTER TABLE "badge" ALTER COLUMN "id" TYPE text USING "id"::text;--> statement-breakpoint
ALTER TABLE "badgeProgress" ALTER COLUMN "badgeId" TYPE text USING "badgeId"::text;--> statement-breakpoint
ALTER TABLE "userProfile" ALTER COLUMN "selectedBadge" TYPE text USING "selectedBadge"::text;--> statement-breakpoint
ALTER TABLE "badge" ADD CONSTRAINT "badge_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "badgeProgress" ADD CONSTRAINT "badgeProgress_badgeId_badge_id_fk" FOREIGN KEY ("badgeId") REFERENCES "public"."badge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_selectedBadge_badge_id_fk" FOREIGN KEY ("selectedBadge") REFERENCES "public"."badge"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badgeProgress" ADD CONSTRAINT "badgeProgress_userId_badgeId_unique" UNIQUE("userId","badgeId");
