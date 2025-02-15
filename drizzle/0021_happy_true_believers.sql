ALTER TABLE "verificationQueue" RENAME COLUMN "hashKey" TO "token";--> statement-breakpoint
ALTER TABLE "verificationQueue" DROP CONSTRAINT "verificationQueue_email_unique";--> statement-breakpoint
ALTER TABLE "verificationQueue" DROP CONSTRAINT "verificationQueue_hashKey_unique";--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'verificationQueue'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "verificationQueue" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "verificationQueue" ALTER COLUMN "email" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "verificationQueue" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "verificationQueue" ADD CONSTRAINT "verificationQueue_token_unique" UNIQUE("token");