import type { TRPCContext } from "@/trpc/server";
import { friendRequestNotification, notification } from "../db/schema/notifications";
import { UserNotifications } from "@/socket/enums/notifications";
import type { FriendRequest } from "../db/schema/user";
import { emitSocketEvent } from "../global-socket-client";

export async function createNewFriendRequestNotification (ctx: TRPCContext, friendRequest: FriendRequest) {
  const { toUserId, id: friendRequestId, fromUserId } = friendRequest

  const notificationId = (await ctx.db.insert(notification).values({ userId: toUserId }).returning({ id: notification.id })).at(0)?.id

  if (notificationId) {
    await ctx.db.insert(friendRequestNotification).values({
      notificationId,
      friendRequestId
    })
  }

  emitSocketEvent<UserNotifications.OUTGOING_FRIEND_REQUEST>({
    payload: {
      friendRequest,
      sentAt: new Date(),
      userId: fromUserId
    },
    type: UserNotifications.OUTGOING_FRIEND_REQUEST,
    recipients: toUserId
  })
}

export async function createAddedFriendRequestNotification (ctx: TRPCContext, friendRequest: FriendRequest) {
  const { toUserId, id: friendRequestId, fromUserId } = friendRequest

  // The user is `fromUser` since they initiated the friend request
  // and since this is an accept event they are the ones that are to be notificated
  const userToBeNotificated = fromUserId

  const notificationId = (await ctx.db.insert(notification).values({ userId: userToBeNotificated }).returning({ id: notification.id })).at(0)?.id

  if (notificationId) {
    await ctx.db.insert(friendRequestNotification).values({
      notificationId,
      friendRequestId
    })
  }

  emitSocketEvent<UserNotifications.ACCEPTED_FRIEND_REQUEST>({
    payload: {
      friendRequest,
      sentAt: new Date(),
      userId: toUserId
    },
    type: UserNotifications.ACCEPTED_FRIEND_REQUEST,
    recipients: userToBeNotificated
  })
}