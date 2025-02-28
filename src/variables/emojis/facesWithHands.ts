import { type EmojiDefinition } from "./types";

export enum FacesWithHandsEmojis {
  HUGS = "hugs",
  FACE_WITH_HAND_OVER_MOUTH = "face_with_hand_over_mouth",
  SHUSHING_FACE = "shushing_face",
  THINKING_FACE = "thinking_face",
}

export const facesWithHandsEmojis: Record<FacesWithHandsEmojis, EmojiDefinition> = {
  [FacesWithHandsEmojis.HUGS]: {
    name: "Hugs",
    unicode: "U+1F917",
    emoji: "🤗",
  },
  [FacesWithHandsEmojis.FACE_WITH_HAND_OVER_MOUTH]: {
    name: "Face with hand in mouth",
    unicode: "U+1F92D",
    emoji: "🤭",
  },
  [FacesWithHandsEmojis.SHUSHING_FACE]: {
    name: "Shushing face",
    unicode: "U+1F92B",
    emoji: "🤫",
  },
  [FacesWithHandsEmojis.THINKING_FACE]: {
    name: "Thinking face",
    unicode: "U+1F914",
    emoji: "🤔",
  },
};