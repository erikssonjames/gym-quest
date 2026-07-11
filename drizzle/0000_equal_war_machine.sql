CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."feedbackType" AS ENUM('bug', 'feature', 'improvement', 'other');--> statement-breakpoint
CREATE TYPE "public"."userRole" AS ENUM('superAdmin', 'admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."rating" AS ENUM('1', '2', '3', '4', '5');--> statement-breakpoint
CREATE TABLE "badge" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"valueToComplete" integer NOT NULL,
	"valueName" text NOT NULL,
	"valueDescription" text NOT NULL,
	"group" text NOT NULL,
	"groupWeighting" integer NOT NULL,
	"percentageOfUsersHasBadge" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badgeProgress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"badgeId" text NOT NULL,
	"completed" boolean NOT NULL,
	CONSTRAINT "badgeProgress_userId_badgeId_unique" UNIQUE("userId","badgeId")
);
--> statement-breakpoint
CREATE TABLE "badgeProgressEvent" (
	"badgeProgressId" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"value" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "muscle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"latinName" text,
	"muscleGroupId" uuid NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "muscleGroup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"isPublic" boolean,
	"userId" uuid
);
--> statement-breakpoint
CREATE TABLE "exercisePublicRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execiseId" uuid NOT NULL,
	"requestMadeAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exerciseToMuscle" (
	"exercise_id" uuid NOT NULL,
	"muscle_id" uuid NOT NULL,
	CONSTRAINT "exerciseToMuscle_exercise_id_muscle_id_pk" PRIMARY KEY("exercise_id","muscle_id")
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text NOT NULL,
	"userId" uuid,
	"timestamp" timestamp DEFAULT now(),
	"url" text NOT NULL,
	"type" "feedbackType" DEFAULT 'other' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendRequestNotification" (
	"notificationId" uuid NOT NULL,
	"friendRequestId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"readAt" timestamp,
	"hidden" boolean DEFAULT false,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workoutReviewNotification" (
	"notificationId" uuid NOT NULL,
	"workoutReviewId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"userId" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "friendRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fromUserId" uuid NOT NULL,
	"toUserId" uuid NOT NULL,
	"accepted" boolean DEFAULT false,
	"ignored" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "friendShip" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"userOne" uuid NOT NULL,
	"userTwo" uuid NOT NULL,
	CONSTRAINT "friendShip_userOne_userTwo_pk" PRIMARY KEY("userOne","userTwo")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userPrivateInformation" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"password" varchar,
	"role" "userRole" DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userProfile" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"selectedBadge" text
);
--> statement-breakpoint
CREATE TABLE "userSettings" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"colorTheme" varchar(20) NOT NULL,
	"borderRadius" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"username" varchar(20),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT now(),
	"image" varchar(255),
	"uploadedImage" varchar(255),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verificationQueue" (
	"timeRequested" timestamp with time zone DEFAULT now() NOT NULL,
	"token" varchar NOT NULL,
	"email" varchar NOT NULL,
	CONSTRAINT "verificationQueue_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token"),
	CONSTRAINT "verificationToken_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"timeSubmitted" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"isPublic" boolean NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workoutReview" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" date NOT NULL,
	"editedAt" date,
	"userId" uuid NOT NULL,
	"workoutId" uuid NOT NULL,
	"rating" "rating" DEFAULT '3' NOT NULL,
	"comment" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workoutSession" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"workoutId" uuid NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"endedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "workoutSessionLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order" integer NOT NULL,
	"workoutSessionId" uuid NOT NULL,
	"exerciseId" uuid NOT NULL,
	"startedAt" timestamp,
	"endedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "workoutSessionLogFragment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order" integer NOT NULL,
	"workoutSessionLogId" uuid NOT NULL,
	"reps" integer NOT NULL,
	"weight" integer NOT NULL,
	"duration" integer NOT NULL,
	"startedAt" timestamp,
	"endedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "workoutSet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workoutId" uuid NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workoutSetCollection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exerciseId" uuid NOT NULL,
	"workoutSetId" uuid NOT NULL,
	"weight" integer[] NOT NULL,
	"reps" integer[] NOT NULL,
	"restTime" integer[] NOT NULL,
	"duration" integer[] NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workoutToUser" (
	"userId" uuid NOT NULL,
	"workoutId" uuid NOT NULL,
	CONSTRAINT "workoutToUser_userId_workoutId_pk" PRIMARY KEY("userId","workoutId")
);
--> statement-breakpoint
ALTER TABLE "badgeProgress" ADD CONSTRAINT "badgeProgress_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badgeProgress" ADD CONSTRAINT "badgeProgress_badgeId_badge_id_fk" FOREIGN KEY ("badgeId") REFERENCES "public"."badge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badgeProgressEvent" ADD CONSTRAINT "badgeProgressEvent_badgeProgressId_badgeProgress_id_fk" FOREIGN KEY ("badgeProgressId") REFERENCES "public"."badgeProgress"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "muscle" ADD CONSTRAINT "muscle_muscleGroupId_muscleGroup_id_fk" FOREIGN KEY ("muscleGroupId") REFERENCES "public"."muscleGroup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise" ADD CONSTRAINT "exercise_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercisePublicRequest" ADD CONSTRAINT "exercisePublicRequest_execiseId_exercise_id_fk" FOREIGN KEY ("execiseId") REFERENCES "public"."exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exerciseToMuscle" ADD CONSTRAINT "exerciseToMuscle_exercise_id_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exerciseToMuscle" ADD CONSTRAINT "exerciseToMuscle_muscle_id_muscle_id_fk" FOREIGN KEY ("muscle_id") REFERENCES "public"."muscle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendRequestNotification" ADD CONSTRAINT "friendRequestNotification_notificationId_notification_id_fk" FOREIGN KEY ("notificationId") REFERENCES "public"."notification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendRequestNotification" ADD CONSTRAINT "friendRequestNotification_friendRequestId_friendRequest_id_fk" FOREIGN KEY ("friendRequestId") REFERENCES "public"."friendRequest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutReviewNotification" ADD CONSTRAINT "workoutReviewNotification_notificationId_notification_id_fk" FOREIGN KEY ("notificationId") REFERENCES "public"."notification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutReviewNotification" ADD CONSTRAINT "workoutReviewNotification_workoutReviewId_workoutReview_id_fk" FOREIGN KEY ("workoutReviewId") REFERENCES "public"."workoutReview"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendRequest" ADD CONSTRAINT "friendRequest_fromUserId_user_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendRequest" ADD CONSTRAINT "friendRequest_toUserId_user_id_fk" FOREIGN KEY ("toUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendShip" ADD CONSTRAINT "friendShip_userOne_user_id_fk" FOREIGN KEY ("userOne") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendShip" ADD CONSTRAINT "friendShip_userTwo_user_id_fk" FOREIGN KEY ("userTwo") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userPrivateInformation" ADD CONSTRAINT "userPrivateInformation_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_selectedBadge_badge_id_fk" FOREIGN KEY ("selectedBadge") REFERENCES "public"."badge"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userSettings" ADD CONSTRAINT "userSettings_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout" ADD CONSTRAINT "workout_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutReview" ADD CONSTRAINT "workoutReview_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutReview" ADD CONSTRAINT "workoutReview_workoutId_workout_id_fk" FOREIGN KEY ("workoutId") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSession" ADD CONSTRAINT "workoutSession_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSession" ADD CONSTRAINT "workoutSession_workoutId_workout_id_fk" FOREIGN KEY ("workoutId") REFERENCES "public"."workout"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSessionLog" ADD CONSTRAINT "workoutSessionLog_workoutSessionId_workoutSession_id_fk" FOREIGN KEY ("workoutSessionId") REFERENCES "public"."workoutSession"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSessionLog" ADD CONSTRAINT "workoutSessionLog_exerciseId_exercise_id_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercise"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSessionLogFragment" ADD CONSTRAINT "workoutSessionLogFragment_workoutSessionLogId_workoutSessionLog_id_fk" FOREIGN KEY ("workoutSessionLogId") REFERENCES "public"."workoutSessionLog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSet" ADD CONSTRAINT "workoutSet_workoutId_workout_id_fk" FOREIGN KEY ("workoutId") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSetCollection" ADD CONSTRAINT "workoutSetCollection_exerciseId_exercise_id_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSetCollection" ADD CONSTRAINT "workoutSetCollection_workoutSetId_workoutSet_id_fk" FOREIGN KEY ("workoutSetId") REFERENCES "public"."workoutSet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutToUser" ADD CONSTRAINT "workoutToUser_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutToUser" ADD CONSTRAINT "workoutToUser_workoutId_workout_id_fk" FOREIGN KEY ("workoutId") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");
