import { type EmojiDefinition } from "./types";

export enum AwardMedalsEmojis {
  MILITARY_MEDAL = "military_medal",
  TROPHY = "trophy",
  SPORTS_MEDAL = "sports_medal",
  GOLD_MEDAL = "gold_medal",
  SILVER_MEDAL = "silver_medal",
  BRONZE_MEDAL = "bronze_medal",
}

export const awardMedalsEmojis: Record<AwardMedalsEmojis, EmojiDefinition> = {
  [AwardMedalsEmojis.MILITARY_MEDAL]: { name: "Military medal", unicode: "U+1F396", emoji: "🎖" },
  [AwardMedalsEmojis.TROPHY]: { name: "Trophy", unicode: "U+1F3C6", emoji: "🏆" },
  [AwardMedalsEmojis.SPORTS_MEDAL]: { name: "Sports medal", unicode: "U+1F3C5", emoji: "🏅" },
  [AwardMedalsEmojis.GOLD_MEDAL]: { name: "Gold medal - first position", unicode: "U+1F947", emoji: "🥇" },
  [AwardMedalsEmojis.SILVER_MEDAL]: { name: "Silver medal - second position", unicode: "U+1F948", emoji: "🥈" },
  [AwardMedalsEmojis.BRONZE_MEDAL]: { name: "Bronze medal - third position", unicode: "U+1F949", emoji: "🥉" },
}
