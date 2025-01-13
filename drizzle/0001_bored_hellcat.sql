CREATE TABLE IF NOT EXISTS "waitlist" (
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"timeSubmitted" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "post";