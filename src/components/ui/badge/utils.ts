import { type BadgeGroupName } from "@/variables/badges";

export function getBadgeGroupName (name: BadgeGroupName) {
  switch (name) {
  case "weight_lifting":
    return "Weight Lifted"
  case "consistent_lifter":
    return "Consistent Workouts"
  case "frequent_lifter":
    return "Frequent Workouts"
  case "early_user":
    return "Early Users"
  }
}