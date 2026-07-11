ALTER TABLE "user" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "uploadedImagePublicId" varchar(255);
--> statement-breakpoint
ALTER TABLE "exercise" ADD COLUMN "archivedAt" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "workout" ADD COLUMN "archivedAt" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "badgeProgressEvent" ADD COLUMN "id" uuid DEFAULT gen_random_uuid() NOT NULL;
--> statement-breakpoint
ALTER TABLE "badgeProgressEvent" ADD CONSTRAINT "badgeProgressEvent_id_pk" PRIMARY KEY("id");
--> statement-breakpoint
UPDATE "exercise" SET "isPublic" = false WHERE "isPublic" IS NULL;
--> statement-breakpoint
ALTER TABLE "exercise" ALTER COLUMN "isPublic" SET DEFAULT false;
--> statement-breakpoint
ALTER TABLE "exercise" ALTER COLUMN "isPublic" SET NOT NULL;
--> statement-breakpoint
UPDATE "notification" SET "hidden" = false WHERE "hidden" IS NULL;
--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "hidden" SET NOT NULL;
--> statement-breakpoint
UPDATE "friendRequest" SET "accepted" = false WHERE "accepted" IS NULL;
--> statement-breakpoint
UPDATE "friendRequest" SET "ignored" = false WHERE "ignored" IS NULL;
--> statement-breakpoint
ALTER TABLE "friendRequest" ALTER COLUMN "accepted" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "friendRequest" ALTER COLUMN "ignored" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "friendRequest" ADD CONSTRAINT "friend_request_not_self" CHECK ("fromUserId" <> "toUserId") NOT VALID;
--> statement-breakpoint
ALTER TABLE "workoutSessionLog" DROP CONSTRAINT IF EXISTS "workoutSessionLog_exerciseId_exercise_id_fk";
--> statement-breakpoint
ALTER TABLE "workoutSessionLog" ADD CONSTRAINT "workoutSessionLog_exerciseId_exercise_id_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercise"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "userPrivateInformation" ("userId", "role")
SELECT u."id", 'user'::"userRole"
FROM "user" u
ON CONFLICT ("userId") DO NOTHING;
--> statement-breakpoint
INSERT INTO "userProfile" ("userId")
SELECT u."id"
FROM "user" u
ON CONFLICT ("userId") DO NOTHING;
--> statement-breakpoint
INSERT INTO "userSettings" ("userId", "colorTheme", "borderRadius")
SELECT u."id", 'violet', 'medium_radius'
FROM "user" u
ON CONFLICT ("userId") DO NOTHING;
--> statement-breakpoint
INSERT INTO "badgeProgress" ("userId", "badgeId", "completed")
SELECT u."id", b."id", false
FROM "user" u
CROSS JOIN "badge" b
ON CONFLICT ("userId", "badgeId") DO NOTHING;
--> statement-breakpoint
WITH ranked_active_sessions AS (
  SELECT
    "id",
    row_number() OVER (
      PARTITION BY "userId"
      ORDER BY "startedAt" DESC NULLS LAST, "id" DESC
    ) AS active_rank
  FROM "workoutSession"
  WHERE "endedAt" IS NULL
)
UPDATE "workoutSession" ws
SET "endedAt" = COALESCE(ws."startedAt", now())
FROM ranked_active_sessions ranked
WHERE ws."id" = ranked."id" AND ranked.active_rank > 1;
--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_lower_unique" ON "user" USING btree (lower("email"));
--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_lower_unique" ON "user" USING btree (lower("username"));
--> statement-breakpoint
CREATE INDEX "friend_request_from_idx" ON "friendRequest" USING btree ("fromUserId");
--> statement-breakpoint
CREATE INDEX "friend_request_to_idx" ON "friendRequest" USING btree ("toUserId");
--> statement-breakpoint
CREATE INDEX "friend_request_status_idx" ON "friendRequest" USING btree ("accepted", "ignored");
--> statement-breakpoint
WITH duplicate_pending_requests AS (
  SELECT
    "id",
    row_number() OVER (
      PARTITION BY LEAST("fromUserId", "toUserId"), GREATEST("fromUserId", "toUserId")
      ORDER BY "id"
    ) AS pending_rank
  FROM "friendRequest"
  WHERE "accepted" = false AND "ignored" = false
)
UPDATE "friendRequest" request
SET "ignored" = true
FROM duplicate_pending_requests duplicate
WHERE request."id" = duplicate."id" AND duplicate.pending_rank > 1;
--> statement-breakpoint
CREATE UNIQUE INDEX "friend_request_one_pending_pair"
ON "friendRequest" USING btree (
  LEAST("fromUserId", "toUserId"),
  GREATEST("fromUserId", "toUserId")
)
WHERE "accepted" = false AND "ignored" = false;
--> statement-breakpoint
CREATE INDEX "exercise_owner_active_idx" ON "exercise" USING btree ("userId", "archivedAt");
--> statement-breakpoint
CREATE INDEX "exercise_public_active_idx" ON "exercise" USING btree ("isPublic", "archivedAt");
--> statement-breakpoint
CREATE INDEX "workout_owner_active_idx" ON "workout" USING btree ("userId", "archivedAt");
--> statement-breakpoint
CREATE INDEX "workout_public_active_idx" ON "workout" USING btree ("isPublic", "archivedAt");
--> statement-breakpoint
CREATE INDEX "workout_session_user_started_idx" ON "workoutSession" USING btree ("userId", "startedAt");
--> statement-breakpoint
CREATE UNIQUE INDEX "workout_session_one_active_per_user" ON "workoutSession" USING btree ("userId") WHERE "endedAt" is null;
--> statement-breakpoint
CREATE INDEX "workout_session_log_session_order_idx" ON "workoutSessionLog" USING btree ("workoutSessionId", "order");
--> statement-breakpoint
CREATE INDEX "workout_session_fragment_log_order_idx" ON "workoutSessionLogFragment" USING btree ("workoutSessionLogId", "order");
--> statement-breakpoint
CREATE INDEX "notification_user_created_idx" ON "notification" USING btree ("userId", "createdAt");
--> statement-breakpoint
CREATE INDEX "notification_user_hidden_idx" ON "notification" USING btree ("userId", "hidden");
--> statement-breakpoint
CREATE INDEX "feed_post_created_idx" ON "feedPost" USING btree ("createdAt");
--> statement-breakpoint
CREATE INDEX "feed_post_user_created_idx" ON "feedPost" USING btree ("userId", "createdAt");
--> statement-breakpoint
