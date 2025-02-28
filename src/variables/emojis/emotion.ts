import { type EmojiDefinition } from "./types";

export enum EmotionEmojis {
  KISS = "kiss",
  LOVE_LETTER = "love_letter",
  HEART_WITH_ARROW = "heart_with_arrow",
  HEART_WITH_RIBBON = "heart_with_ribbon",
  SPARKING_HEART = "sparking_heart",
  GROWING_HEART = "growing_heart",
  BEATING_HEART = "beating_heart",
  REVOLVING_HEART = "revolving_heart",
  TWO_HEARTS = "two_hearts",
  HEART_DECORATION = "heart_decoration",
  HEART_EXCLAMATION = "heart_exclamation",
  BROKEN_HEART = "broken_heart",
  HEART_ON_FIRE_2 = "heart_on_fire_2", // we've used 'HEART_ON_FIRE' in multi-unicode
  MENDING_HEART_2 = "mending_heart_2", // also used above
  RED_HEART = "red_heart",
  ORANGE_HEART = "orange_heart",
  YELLOW_HEART = "yellow_heart",
  GREEN_HEART = "green_heart",
  BLUE_HEART = "blue_heart",
  PURPLE_HEART = "purple_heart",
  BROWN_HEART = "brown_heart",
  BLACK_HEART = "black_heart",
  WHITE_HEART = "white_heart",
  HUNDRED = "hundred",
  ANGER = "anger",
  COLLISION = "collision",
  DIZZY = "dizzy",
  SWEAT_DROPLETS = "sweat_droplets",
  DASHING_AWAY = "dashing_away",
  HOLE = "hole",
  BOMB = "bomb",
  MESSAGE_BALLOON = "message_baloon",
  EYE_IN_SPEECH_BUBBLE_2 = "eye_in_speech_bubble_2", // used above
  LEFT_SPEECH_BUBBLE = "left_speech_bubble",
  ANGER_BUBBLE = "anger_bubble",
  THOUGHT_BALLOON = "thought_baloon",
  ZZZ = "zzz",
}

export const emotionEmojis: Record<EmotionEmojis, EmojiDefinition> = {
  [EmotionEmojis.KISS]: {
    name: "Kiss",
    unicode: "U+1F48B",
    emoji: "💋",
  },
  [EmotionEmojis.LOVE_LETTER]: {
    name: "Love letter",
    unicode: "U+1F48C",
    emoji: "💌",
  },
  [EmotionEmojis.HEART_WITH_ARROW]: {
    name: "Heart with arrow",
    unicode: "U+1F498",
    emoji: "💘",
  },
  [EmotionEmojis.HEART_WITH_RIBBON]: {
    name: "Heart with ribbon",
    unicode: "U+1F49D",
    emoji: "💝",
  },
  [EmotionEmojis.SPARKING_HEART]: {
    name: "Sparking heart",
    unicode: "U+1F496",
    emoji: "💖",
  },
  [EmotionEmojis.GROWING_HEART]: {
    name: "Growing heart",
    unicode: "U+1F497",
    emoji: "💗",
  },
  [EmotionEmojis.BEATING_HEART]: {
    name: "Beating heart",
    unicode: "U+1F493",
    emoji: "💓",
  },
  [EmotionEmojis.REVOLVING_HEART]: {
    name: "Revolving heart",
    unicode: "U+1F49E",
    emoji: "💞",
  },
  [EmotionEmojis.TWO_HEARTS]: {
    name: "Two hearts",
    unicode: "U+1F495",
    emoji: "💕",
  },
  [EmotionEmojis.HEART_DECORATION]: {
    name: "Heart decoration",
    unicode: "U+1F49F",
    emoji: "💟",
  },
  [EmotionEmojis.HEART_EXCLAMATION]: {
    name: "Heart exclamation",
    unicode: "U+2763",
    emoji: "❣",
  },
  [EmotionEmojis.BROKEN_HEART]: {
    name: "Broken heart",
    unicode: "U+1F494",
    emoji: "💔",
  },
  [EmotionEmojis.HEART_ON_FIRE_2]: {
    name: "Heart on fire",
    unicode: "U+2764",
    emoji: "❤️‍🔥",
  },
  [EmotionEmojis.MENDING_HEART_2]: {
    name: "Mending heart",
    unicode: "U+2764",
    emoji: "❤️‍🩹",
  },
  [EmotionEmojis.RED_HEART]: {
    name: "Red heart",
    unicode: "U+2764",
    emoji: "❤",
  },
  [EmotionEmojis.ORANGE_HEART]: {
    name: "Orange heart",
    unicode: "U+1F9E1",
    emoji: "🧡",
  },
  [EmotionEmojis.YELLOW_HEART]: {
    name: "Yellow heart",
    unicode: "U+1F49B",
    emoji: "💛",
  },
  [EmotionEmojis.GREEN_HEART]: {
    name: "Green heart",
    unicode: "U+1F49A",
    emoji: "💚",
  },
  [EmotionEmojis.BLUE_HEART]: {
    name: "Blue heart",
    unicode: "U+1F499",
    emoji: "💙",
  },
  [EmotionEmojis.PURPLE_HEART]: {
    name: "Purple heart",
    unicode: "U+1F49C",
    emoji: "💜",
  },
  [EmotionEmojis.BROWN_HEART]: {
    name: "Brown heart",
    unicode: "U+1F90E",
    emoji: "🤎",
  },
  [EmotionEmojis.BLACK_HEART]: {
    name: "Black heart",
    unicode: "U+1F5A4",
    emoji: "🖤",
  },
  [EmotionEmojis.WHITE_HEART]: {
    name: "White heart",
    unicode: "U+1F90D",
    emoji: "🤍",
  },
  [EmotionEmojis.HUNDRED]: {
    name: "Hundred(correct)",
    unicode: "U+1F4AF",
    emoji: "💯",
  },
  [EmotionEmojis.ANGER]: {
    name: "Anger",
    unicode: "U+1F4A2",
    emoji: "💢",
  },
  [EmotionEmojis.COLLISION]: {
    name: "Collision",
    unicode: "U+1F4A5",
    emoji: "💥",
  },
  [EmotionEmojis.DIZZY]: {
    name: "Dizzy",
    unicode: "U+1F4AB",
    emoji: "💫",
  },
  [EmotionEmojis.SWEAT_DROPLETS]: {
    name: "Sweat droplets",
    unicode: "U+1F4A6",
    emoji: "💦",
  },
  [EmotionEmojis.DASHING_AWAY]: {
    name: "Dashing away",
    unicode: "U+1F4A8",
    emoji: "💨",
  },
  [EmotionEmojis.HOLE]: {
    name: "Hole",
    unicode: "U+1F573",
    emoji: "🕳",
  },
  [EmotionEmojis.BOMB]: {
    name: "Bomb",
    unicode: "U+1F4A3",
    emoji: "💣",
  },
  [EmotionEmojis.MESSAGE_BALLOON]: {
    name: "Message baloon",
    unicode: "U+1F4AC",
    emoji: "💬",
  },
  [EmotionEmojis.EYE_IN_SPEECH_BUBBLE_2]: {
    name: "Eye in speech bubble",
    unicode: "U+1F441",
    emoji: "👁️‍🗨️", // duplicating from multi-unicode note
  },
  [EmotionEmojis.LEFT_SPEECH_BUBBLE]: {
    name: "Left speech bubble",
    unicode: "U+1F5E8",
    emoji: "🗨",
  },
  [EmotionEmojis.ANGER_BUBBLE]: {
    name: "Anger bubble",
    unicode: "U+1F5EF",
    emoji: "🗯",
  },
  [EmotionEmojis.THOUGHT_BALLOON]: {
    name: "Thought baloon",
    unicode: "U+1F4AD",
    emoji: "💭",
  },
  [EmotionEmojis.ZZZ]: {
    name: "zzz",
    unicode: "U+1F4A4",
    emoji: "💤",
  },
};