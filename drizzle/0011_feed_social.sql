CREATE TYPE "public"."feedPostKind" AS ENUM('status', 'workout', 'quest');--> statement-breakpoint
CREATE TYPE "public"."feedReportReason" AS ENUM('spam', 'harassment', 'hate-or-abuse', 'unsafe-or-misleading', 'other');--> statement-breakpoint
CREATE TYPE "public"."feedReportStatus" AS ENUM('pending', 'kept', 'removed');--> statement-breakpoint
CREATE TABLE "feedPostComment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feed_comment_content_length" CHECK (char_length("feedPostComment"."content") BETWEEN 1 AND 500)
);
--> statement-breakpoint
CREATE TABLE "feedPostHidden" (
	"postId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedPostHidden_postId_userId_pk" PRIMARY KEY("postId","userId")
);
--> statement-breakpoint
CREATE TABLE "feedPostReaction" (
	"postId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"emoji" text NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedPostReaction_postId_userId_pk" PRIMARY KEY("postId","userId")
);
--> statement-breakpoint
CREATE TABLE "feedPostReport" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid NOT NULL,
	"reporterId" uuid NOT NULL,
	"reason" "feedReportReason" NOT NULL,
	"details" text,
	"status" "feedReportStatus" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"resolvedAt" timestamp with time zone,
	"resolvedBy" uuid,
	CONSTRAINT "feedPostReport_postId_reporterId_unique" UNIQUE("postId","reporterId")
);
--> statement-breakpoint
CREATE TABLE "feedQuestShare" (
	"postId" uuid PRIMARY KEY NOT NULL,
	"questClaimId" uuid,
	"snapshot" jsonb NOT NULL,
	CONSTRAINT "feedQuestShare_questClaimId_unique" UNIQUE("questClaimId")
);
--> statement-breakpoint
CREATE TABLE "feedWorkoutShare" (
	"postId" uuid PRIMARY KEY NOT NULL,
	"workoutSessionId" uuid,
	"snapshot" jsonb NOT NULL,
	CONSTRAINT "feedWorkoutShare_workoutSessionId_unique" UNIQUE("workoutSessionId")
);
--> statement-breakpoint
CREATE TABLE "userBlock" (
	"blockerId" uuid NOT NULL,
	"blockedId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "userBlock_blockerId_blockedId_pk" PRIMARY KEY("blockerId","blockedId"),
	CONSTRAINT "user_block_not_self" CHECK ("userBlock"."blockerId" <> "userBlock"."blockedId")
);
--> statement-breakpoint
ALTER TABLE "feedPost" RENAME COLUMN "content" TO "description";--> statement-breakpoint
ALTER TABLE "feedPost" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "feedPost" ADD COLUMN "kind" "feedPostKind" DEFAULT 'status' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedPost" ADD COLUMN "imageUrl" text;--> statement-breakpoint
ALTER TABLE "feedPost" ADD COLUMN "imagePublicId" text;--> statement-breakpoint
ALTER TABLE "feedPost" ADD COLUMN "imageWidth" integer;--> statement-breakpoint
ALTER TABLE "feedPost" ADD COLUMN "imageHeight" integer;--> statement-breakpoint
ALTER TABLE "feedPost" ADD COLUMN "pinnedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "feedPost" ADD COLUMN "pinnedBy" uuid;--> statement-breakpoint
ALTER TABLE "feedPost" ADD COLUMN "removedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "feedPost" ADD COLUMN "removedBy" uuid;--> statement-breakpoint
ALTER TABLE "feedPostComment" ADD CONSTRAINT "feedPostComment_postId_feedPost_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."feedPost"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedPostComment" ADD CONSTRAINT "feedPostComment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedPostHidden" ADD CONSTRAINT "feedPostHidden_postId_feedPost_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."feedPost"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedPostHidden" ADD CONSTRAINT "feedPostHidden_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedPostReaction" ADD CONSTRAINT "feedPostReaction_postId_feedPost_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."feedPost"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedPostReaction" ADD CONSTRAINT "feedPostReaction_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedPostReport" ADD CONSTRAINT "feedPostReport_postId_feedPost_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."feedPost"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedPostReport" ADD CONSTRAINT "feedPostReport_reporterId_user_id_fk" FOREIGN KEY ("reporterId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedPostReport" ADD CONSTRAINT "feedPostReport_resolvedBy_user_id_fk" FOREIGN KEY ("resolvedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedQuestShare" ADD CONSTRAINT "feedQuestShare_postId_feedPost_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."feedPost"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedQuestShare" ADD CONSTRAINT "feedQuestShare_questClaimId_questClaim_id_fk" FOREIGN KEY ("questClaimId") REFERENCES "public"."questClaim"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedWorkoutShare" ADD CONSTRAINT "feedWorkoutShare_postId_feedPost_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."feedPost"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedWorkoutShare" ADD CONSTRAINT "feedWorkoutShare_workoutSessionId_workoutSession_id_fk" FOREIGN KEY ("workoutSessionId") REFERENCES "public"."workoutSession"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userBlock" ADD CONSTRAINT "userBlock_blockerId_user_id_fk" FOREIGN KEY ("blockerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userBlock" ADD CONSTRAINT "userBlock_blockedId_user_id_fk" FOREIGN KEY ("blockedId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feed_comment_post_created_idx" ON "feedPostComment" USING btree ("postId","createdAt");--> statement-breakpoint
CREATE INDEX "feed_comment_user_created_idx" ON "feedPostComment" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "feed_reaction_post_emoji_idx" ON "feedPostReaction" USING btree ("postId","emoji");--> statement-breakpoint
CREATE INDEX "feed_report_status_created_idx" ON "feedPostReport" USING btree ("status","createdAt");--> statement-breakpoint
CREATE INDEX "feed_report_post_status_idx" ON "feedPostReport" USING btree ("postId","status");--> statement-breakpoint
CREATE INDEX "user_block_blocked_idx" ON "userBlock" USING btree ("blockedId","blockerId");--> statement-breakpoint
ALTER TABLE "feedPost" ADD CONSTRAINT "feedPost_pinnedBy_user_id_fk" FOREIGN KEY ("pinnedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedPost" ADD CONSTRAINT "feedPost_removedBy_user_id_fk" FOREIGN KEY ("removedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feed_post_pinned_idx" ON "feedPost" USING btree ("pinnedAt");--> statement-breakpoint
CREATE INDEX "feed_post_active_kind_idx" ON "feedPost" USING btree ("removedAt","kind","createdAt");--> statement-breakpoint
ALTER TABLE "feedPost" ADD CONSTRAINT "feed_status_has_content" CHECK ("feedPost"."kind" <> 'status' OR "feedPost"."description" IS NOT NULL OR "feedPost"."imageUrl" IS NOT NULL);
