CREATE TYPE "public"."rating" AS ENUM('1', '2', '3', '4', '5');--> statement-breakpoint
CREATE TABLE "muscle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"muscle_group_id" uuid NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "muscle_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_muscle" (
	"exercise_id" uuid NOT NULL,
	"muscle_id" uuid NOT NULL,
	CONSTRAINT "exercise_muscle_exercise_id_muscle_id_pk" PRIMARY KEY("exercise_id","muscle_id")
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
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
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
	"password" varchar,
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT now(),
	"image" varchar(255),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verificationQueue" (
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"password" varchar NOT NULL,
	"timeRequested" timestamp with time zone DEFAULT now() NOT NULL,
	"hashKey" varchar NOT NULL,
	CONSTRAINT "verificationQueue_email_unique" UNIQUE("email"),
	CONSTRAINT "verificationQueue_hashKey_unique" UNIQUE("hashKey")
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
CREATE TABLE "workoutRep" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repetitions" integer NOT NULL,
	"setId" uuid NOT NULL,
	"description" text NOT NULL,
	"exerciseId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workoutReview" (
	"createdAt" date NOT NULL,
	"editedAt" date,
	"userId" uuid NOT NULL,
	"workoutId" uuid NOT NULL,
	"rating" "rating" DEFAULT '3' NOT NULL,
	"comment" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workoutSet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sets" integer NOT NULL,
	"workoutId" uuid NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "muscle" ADD CONSTRAINT "muscle_muscle_group_id_muscle_group_id_fk" FOREIGN KEY ("muscle_group_id") REFERENCES "public"."muscle_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_muscle" ADD CONSTRAINT "exercise_muscle_exercise_id_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_muscle" ADD CONSTRAINT "exercise_muscle_muscle_id_muscle_id_fk" FOREIGN KEY ("muscle_id") REFERENCES "public"."muscle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userSettings" ADD CONSTRAINT "userSettings_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout" ADD CONSTRAINT "workout_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutRep" ADD CONSTRAINT "workoutRep_setId_workoutSet_id_fk" FOREIGN KEY ("setId") REFERENCES "public"."workoutSet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutRep" ADD CONSTRAINT "workoutRep_exerciseId_exercise_id_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutReview" ADD CONSTRAINT "workoutReview_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutReview" ADD CONSTRAINT "workoutReview_workoutId_workout_id_fk" FOREIGN KEY ("workoutId") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutSet" ADD CONSTRAINT "workoutSet_workoutId_workout_id_fk" FOREIGN KEY ("workoutId") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");