import { EmojiDefinition } from "./types";

export enum SmileyFaceEmojis {
  SLIGHTLY_SMILING_FACE = "slightly_smiling_face",
  SMILING_FACE = "smiling_face",
  SMILING_FACE_WITH_BIG_EYES = "smiling_face_with_big_eyes",
  SMILING_FACE_WITH_SMILING_EYES = "smiling_face_with_smiling_eyes",
  BEAMING_FACE_WITH_SMILING_EYES = "beaming_face_with_smiling_eyes",
  SMILING_FACE_WITH_TEARS = "smiling_face_with_tears",
  GRINNING_FACE = "grinning_face",
  ROLLING_ON_THE_FLOOR_LAUGHING = "rolling_on_the_floor_laughing",
  LAUGING_WITH_TEARS = "lauging_with_tears", // spelling per original data
  UPSIDE_DOWN_FACE = "upside_down_face",
  WINKING_FACE = "winking_face",
  SMILING_FACE_WITH_SMILING_EYES_2 = "smiling_face_with_smiling_eyes_2",
  SMILING_FACE_WITH_HALO = "smiling_face_with_halo",
  SMILING_FACE_WITH_SUNGLASSES = "smiling_face_with_sunglasses",
  NERDY_FACE = "nerdy_face",
  FACE_WITH_MONOCLE = "face_with_monocle",
  PARTYING_FACE = "partying_face",
}

export const smileyFaceEmojis: Record<SmileyFaceEmojis, EmojiDefinition> = {
  [SmileyFaceEmojis.SLIGHTLY_SMILING_FACE]: {
    name: "Slightly smiling face",
    unicode: "U+1F642",
    emoji: "🙂",
  },
  [SmileyFaceEmojis.SMILING_FACE]: {
    name: "Smiling face",
    unicode: "U+1F600",
    emoji: "😀",
  },
  [SmileyFaceEmojis.SMILING_FACE_WITH_BIG_EYES]: {
    name: "Smiling face with big eyes",
    unicode: "U+1F603",
    emoji: "😃",
  },
  [SmileyFaceEmojis.SMILING_FACE_WITH_SMILING_EYES]: {
    name: "Smiling face with smiling eyes",
    unicode: "U+1F604",
    emoji: "😄",
  },
  [SmileyFaceEmojis.BEAMING_FACE_WITH_SMILING_EYES]: {
    name: "Beaming face with smiling eyes",
    unicode: "U+1F601",
    emoji: "😁",
  },
  [SmileyFaceEmojis.SMILING_FACE_WITH_TEARS]: {
    name: "Smiling face with tears",
    unicode: "U+1F605",
    emoji: "😅",
  },
  [SmileyFaceEmojis.GRINNING_FACE]: {
    name: "Grinning face",
    unicode: "U+1F606",
    emoji: "😆",
  },
  [SmileyFaceEmojis.ROLLING_ON_THE_FLOOR_LAUGHING]: {
    name: "Rolling on the floor laughing",
    unicode: "U+1F923",
    emoji: "🤣",
  },
  [SmileyFaceEmojis.LAUGING_WITH_TEARS]: {
    name: "Lauging with tears",
    unicode: "U+1F602",
    emoji: "😂",
  },
  [SmileyFaceEmojis.UPSIDE_DOWN_FACE]: {
    name: "Upside down face",
    unicode: "U+1F643",
    emoji: "🙃",
  },
  [SmileyFaceEmojis.WINKING_FACE]: {
    name: "Winking face",
    unicode: "U+1F609",
    emoji: "😉",
  },
  [SmileyFaceEmojis.SMILING_FACE_WITH_SMILING_EYES_2]: {
    name: "Smiling face with smiling eyes",
    unicode: "U+1F60A",
    emoji: "😊",
  },
  [SmileyFaceEmojis.SMILING_FACE_WITH_HALO]: {
    name: "Smiling face with halo",
    unicode: "U+1F607",
    emoji: "😇",
  },
  [SmileyFaceEmojis.SMILING_FACE_WITH_SUNGLASSES]: {
    name: "Smiling face with sunglasses",
    unicode: "U+1F60E",
    emoji: "😎",
  },
  [SmileyFaceEmojis.NERDY_FACE]: {
    name: "Nerdy face",
    unicode: "U+1F913",
    emoji: "🤓",
  },
  [SmileyFaceEmojis.FACE_WITH_MONOCLE]: {
    name: "Face with monocle",
    unicode: "U+1F9D0",
    emoji: "🧐",
  },
  [SmileyFaceEmojis.PARTYING_FACE]: {
    name: "Partying face",
    unicode: "U+1F973",
    emoji: "🥳",
  },
};