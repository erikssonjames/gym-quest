ALTER TABLE "experienceEvent" ALTER COLUMN "amount" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "questClaim" ALTER COLUMN "experienceAwarded" SET DATA TYPE bigint;--> statement-breakpoint

UPDATE "questClaim"
SET "experienceAwarded" = CASE "questId"
	WHEN 'daily-session' THEN 300
	WHEN 'daily-sets' THEN 400
	WHEN 'weekly-sessions' THEN 1200
	WHEN 'weekly-volume' THEN 1000
	WHEN 'journey-five' THEN 3000
	ELSE "experienceAwarded"
END;--> statement-breakpoint

UPDATE "experienceEvent" AS event
SET "amount" = claim."experienceAwarded"
FROM "questClaim" AS claim
WHERE event."source" = 'quest'
	AND event."userId" = claim."userId"
	AND event."sourceId" = claim."questId" || ':' || claim."periodKey";--> statement-breakpoint

UPDATE "experienceEvent" AS event
SET "amount" = CASE
	WHEN achievement."group" = 'early_user' THEN 750
	ELSE 750 * (GREATEST(achievement."groupWeighting", 0) + 1)
END
FROM "badge" AS achievement
WHERE event."source" = 'badge'
	AND event."sourceId" = achievement."id";--> statement-breakpoint

WITH "performedFragment" AS (
	SELECT
		session."id" AS "sessionId",
		session."userId",
		session."endedAt" AS "sessionEndedAt",
		GREATEST(fragment."reps", 0)::bigint AS "reps",
		GREATEST(fragment."weight", 0)::bigint AS "weight",
		GREATEST(
			EXTRACT(EPOCH FROM fragment."endedAt" - fragment."startedAt"),
			0
		) AS "activeSeconds"
	FROM "workoutSession" AS session
	INNER JOIN "workoutSessionLog" AS log
		ON log."workoutSessionId" = session."id"
	INNER JOIN "workoutSessionLogFragment" AS fragment
		ON fragment."workoutSessionLogId" = log."id"
	WHERE session."endedAt" IS NOT NULL
		AND fragment."startedAt" IS NOT NULL
		AND fragment."endedAt" IS NOT NULL
),
"sessionExperience" AS (
	SELECT
		"sessionId",
		"userId",
		"sessionEndedAt",
		LEAST(200::bigint, COUNT(*) * 50)
			+ COUNT(*) * 15
			+ SUM(LEAST("reps", 30::bigint) * 2)
			+ SUM(FLOOR(LEAST("weight" * "reps", 1500::bigint) / 25.0))
			+ SUM(FLOOR(LEAST("activeSeconds", 180) / 4.0)) AS "uncappedExperience"
	FROM "performedFragment"
	GROUP BY "sessionId", "userId", "sessionEndedAt"
)
INSERT INTO "experienceEvent" (
	"userId",
	"source",
	"sourceId",
	"amount",
	"createdAt"
)
SELECT
	"userId",
	'workout',
	"sessionId"::text,
	LEAST(2000, "uncappedExperience")::bigint,
	"sessionEndedAt" AT TIME ZONE 'UTC'
FROM "sessionExperience"
ON CONFLICT ("userId", "source", "sourceId") DO UPDATE
SET
	"amount" = EXCLUDED."amount",
	"createdAt" = EXCLUDED."createdAt";
