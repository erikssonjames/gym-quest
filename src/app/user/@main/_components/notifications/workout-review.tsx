import { cn } from "@/lib/utils";
import type { NotificationsOutput } from "@/server/api/types/output";
import UserHeader from "./user-header";

interface WorkoutReviewProps {
  notification: NotificationsOutput[number]
}

export default function WorkoutReview({ notification }: WorkoutReviewProps) {
  const reviewNotification = notification.workoutReview
  if (!reviewNotification || notification.hidden) return null

  const review = reviewNotification.workoutReview
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md py-2",
        notification.readAt === null && "bg-secondary/20",
      )}
    >
      <UserHeader
        userId={review.userId}
        notificationId={notification.id}
        isRead={notification.readAt !== null}
        createdAt={notification.createdAt}
        text={`reviewed ${review.workout.name} (${review.rating}/5).`}
      />
      {review.comment && (
        <p className="ms-14 me-4 text-sm text-muted-foreground">
          {review.comment}
        </p>
      )}
    </div>
  )
}
