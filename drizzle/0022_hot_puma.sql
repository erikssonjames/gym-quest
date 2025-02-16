CREATE TABLE "friendRequestNotification" (
	"notificationId" uuid NOT NULL,
	"fromUserId" uuid NOT NULL,
	"accepted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"readAt" timestamp,
	"hidden" boolean DEFAULT false,
	"userId" uuid
);
--> statement-breakpoint
ALTER TABLE "friendRequestNotification" ADD CONSTRAINT "friendRequestNotification_notificationId_notification_id_fk" FOREIGN KEY ("notificationId") REFERENCES "public"."notification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendRequestNotification" ADD CONSTRAINT "friendRequestNotification_fromUserId_user_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;