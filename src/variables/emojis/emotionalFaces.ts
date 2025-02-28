import { type EmojiDefinition } from "./types";

export enum EmotionalFaceEmojis {
  SMILING_FACE_WITH_HEARTS = "smiling_face_with_hearts",
  SMILING_FACE_WITH_HEART_EYES = "smiling_face_with_heart_eyes",
  STAR_STRUCK = "star_struck",
  FACE_BLOWING_KISS = "face_blowing_kiss",
  KISSING_FACE = "kissing_face",
  SMILING_FACE_2 = "smiling_face_2", // avoid collision with "Smiling face" in SmileyFaceEmojis
  KISSING_FACE_WITH_CLOSED_EYES = "kissing_face_with_closed_eyes",
  KISSING_FACE_WITH_SMILING_EYES = "kissing_face_with_smiling_eyes",
  SMILING_FACE_WITH_TEARS_2 = "smiling_face_with_tears_2", // avoid collision with first "smiling_face_with_tears"
}

export const emotionalFaceEmojis: Record<EmotionalFaceEmojis, EmojiDefinition> = {
  [EmotionalFaceEmojis.SMILING_FACE_WITH_HEARTS]: {
    name: "Smiling face with hearts",
    unicode: "U+1F970",
    emoji: "🥰",
  },
  [EmotionalFaceEmojis.SMILING_FACE_WITH_HEART_EYES]: {
    name: "Smiling face with heart eyes",
    unicode: "U+1F60D",
    emoji: "😍",
  },
  [EmotionalFaceEmojis.STAR_STRUCK]: {
    name: "Star-struck",
    unicode: "U+1F929", // corrected from the prompt, which had a likely typo
    emoji: "🤩",
  },
  [EmotionalFaceEmojis.FACE_BLOWING_KISS]: {
    name: "Face blowing kiss",
    unicode: "U+1F618",
    emoji: "😘",
  },
  [EmotionalFaceEmojis.KISSING_FACE]: {
    name: "Kissing face",
    unicode: "U+1F617",
    emoji: "😗",
  },
  [EmotionalFaceEmojis.SMILING_FACE_2]: {
    name: "Smiling face",
    unicode: "U+263A",
    emoji: "☺",
  },
  [EmotionalFaceEmojis.KISSING_FACE_WITH_CLOSED_EYES]: {
    name: "Kissing face with closed eyes",
    unicode: "U+1F61A",
    emoji: "😚",
  },
  [EmotionalFaceEmojis.KISSING_FACE_WITH_SMILING_EYES]: {
    name: "Kissing face with smiling eyes",
    unicode: "U+1F619",
    emoji: "😙",
  },
  [EmotionalFaceEmojis.SMILING_FACE_WITH_TEARS_2]: {
    name: "Smiling face with tears",
    unicode: "U+1F972",
    emoji: "🥲",
  },
};