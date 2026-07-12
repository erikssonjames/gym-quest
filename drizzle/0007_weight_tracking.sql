CREATE TABLE "weightEntry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"recordedOn" date NOT NULL,
	"weightGrams" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weight_entry_reasonable_range" CHECK ("weightEntry"."weightGrams" BETWEEN 20000 AND 500000)
);
--> statement-breakpoint
ALTER TABLE "userSettings" ADD COLUMN "weightGoalGrams" integer;--> statement-breakpoint
ALTER TABLE "userSettings" ADD COLUMN "weightReminderEnabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "weightEntry" ADD CONSTRAINT "weightEntry_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "weight_entry_user_date_unique" ON "weightEntry" USING btree ("userId","recordedOn");--> statement-breakpoint
CREATE INDEX "weight_entry_user_date_idx" ON "weightEntry" USING btree ("userId","recordedOn");