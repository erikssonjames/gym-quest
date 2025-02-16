import type { FriendRequest } from "@/server/db/schema/user";
import type { WorkoutReview } from "@/server/db/schema/workout";
import type { UserNotifications, WorkoutNotifications } from "../enums/notifications";

export interface NotificationSocketEventPayloads {
  [UserNotifications.OUTGOING_FRIEND_REQUEST]: {
    friendRequest: FriendRequest;
    userId: string;
    sentAt: Date;
  };
  [UserNotifications.ACCEPTED_FRIEND_REQUEST]: {
    friendRequest: FriendRequest;
    userId: string;
    sentAt: Date;
  };
  [UserNotifications.DENIED_FRIEND_REQUEST]: {
    friendRequest: FriendRequest;
    userId: string;
    sentAt: Date;
  };
  [WorkoutNotifications.NEW_WORKOUT_REVIEW]: {
    review: WorkoutReview;
    userId: string;
    sentAt: Date;
  };
}
