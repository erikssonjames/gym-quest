ALTER TABLE "friendRequestNotification" ALTER COLUMN "friendRequestId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "friendRequest" ADD COLUMN "ignored" boolean DEFAULT false;