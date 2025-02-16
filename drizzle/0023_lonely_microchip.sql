CREATE TABLE "workoutReviewNotification" (
	"notificationId" uuid NOT NULL,
	"workoutReviewId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fromUserId" uuid NOT NULL,
	"toUserId" uuid NOT NULL,
	"accepted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "friendShip" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"userOne" uuid NOT NULL,
	"userTwo" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "friendRequestNotification" DROP CONSTRAINT "friendRequestNotification_fromUserId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "friendRequestNotification" ADD COLUMN "friendRequestId" uuid;--> statement-breakpoint
ALTER TABLE "workoutReview" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutReviewNotification" ADD CONSTRAINT "workoutReviewNotification_notificationId_notification_id_fk" FOREIGN KEY ("notificationId") REFERENCES "public"."notification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workoutReviewNotification" ADD CONSTRAINT "workoutReviewNotification_workoutReviewId_workoutReview_id_fk" FOREIGN KEY ("workoutReviewId") REFERENCES "public"."workoutReview"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendRequest" ADD CONSTRAINT "friendRequest_fromUserId_user_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendRequest" ADD CONSTRAINT "friendRequest_toUserId_user_id_fk" FOREIGN KEY ("toUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendShip" ADD CONSTRAINT "friendShip_userOne_user_id_fk" FOREIGN KEY ("userOne") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendShip" ADD CONSTRAINT "friendShip_userTwo_user_id_fk" FOREIGN KEY ("userTwo") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendRequestNotification" ADD CONSTRAINT "friendRequestNotification_friendRequestId_friendRequest_id_fk" FOREIGN KEY ("friendRequestId") REFERENCES "public"."friendRequest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendRequestNotification" DROP COLUMN "fromUserId";--> statement-breakpoint
ALTER TABLE "friendRequestNotification" DROP COLUMN "accepted";