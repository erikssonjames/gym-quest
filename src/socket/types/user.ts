import type { User } from "@/server/db/schema/user";
import type { UserEvents } from "../enums/user";

export interface UserSocketEventPayloads {
  [UserEvents.REMOVED_USER_AS_FRIEND]: {
    removedUserId: User["id"];
    userId: string;
    sentAt: Date;
  };
}
