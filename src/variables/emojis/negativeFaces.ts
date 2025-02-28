import { EmojiDefinition } from "./types";

export enum NegativeFacesEmojis {
  FACE_WITH_STEAM = "face_with_steam",
  POUTING_FACE = "pouting_face",
  ANGRY_FACE = "angry_face",
  FACE_WITH_SYMBOLS_ON_MOUTH = "face_with_symbols_on_mouth",
  SMILING_FACE_WITH_HORNS = "smiling_face_with_horns",
  ANGRY_FACE_WITH_HORNS = "angry_face_with_horns",
  SKULL = "skull",
  SKULL_AND_CROSS_BONE = "skull_and_cross_bone",
}

export const negativeFacesEmojis: Record<NegativeFacesEmojis, EmojiDefinition> = {
  [NegativeFacesEmojis.FACE_WITH_STEAM]: {
    name: "Face with steam",
    unicode: "U+1F624",
    emoji: "😤",
  },
  [NegativeFacesEmojis.POUTING_FACE]: {
    name: "Pouting face",
    unicode: "U+1F621",
    emoji: "😡",
  },
  [NegativeFacesEmojis.ANGRY_FACE]: {
    name: "Angry face",
    unicode: "U+1F620",
    emoji: "😠",
  },
  [NegativeFacesEmojis.FACE_WITH_SYMBOLS_ON_MOUTH]: {
    name: "Face with symbols on mouth",
    unicode: "U+1F92C",
    emoji: "🤬",
  },
  [NegativeFacesEmojis.SMILING_FACE_WITH_HORNS]: {
    name: "Smiling face with horns",
    unicode: "U+1F608",
    emoji: "😈",
  },
  [NegativeFacesEmojis.ANGRY_FACE_WITH_HORNS]: {
    name: "Angry face with horns",
    unicode: "U+1F47F",
    emoji: "👿",
  },
  [NegativeFacesEmojis.SKULL]: {
    name: "Skull",
    unicode: "U+1F480",
    emoji: "💀",
  },
  [NegativeFacesEmojis.SKULL_AND_CROSS_BONE]: {
    name: "Skull and cross-bone",
    unicode: "U+2620",
    emoji: "☠",
  },
};