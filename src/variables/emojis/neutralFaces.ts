import { EmojiDefinition } from "./types";

export enum NeutralFacesEmojis {
  NEUTRAL_FACE = "neutral_face",
  ZIPPED_MOUTH = "zipped_mouth",
  FACE_WITH_RAISED_EYEBROW = "face_with_raised_eyebrow",
  EXPRESSIONLESS_FACE = "expressionless_face",
  FACE_WITH_NO_MOUTH = "face_with_no_mouth",
  SMIRKING_FACE = "smirking_face",
  UNAMUSED_FACE = "unamused_face",
  FACE_WITH_ROLLING_EYES = "face_with_rolling_eyes",
  GRIMACING_FACE = "grimacing_face",
  LYING_FACE = "lying_face",
}

export const neutralFacesEmojis: Record<NeutralFacesEmojis, EmojiDefinition> = {
  [NeutralFacesEmojis.NEUTRAL_FACE]: {
    name: "Neutral face",
    unicode: "U+1F610",
    emoji: "😐",
  },
  [NeutralFacesEmojis.ZIPPED_MOUTH]: {
    name: "Zipped mouth",
    unicode: "U+1F910",
    emoji: "🤐",
  },
  [NeutralFacesEmojis.FACE_WITH_RAISED_EYEBROW]: {
    name: "Face with raised eyebrow",
    unicode: "U+1F928",
    emoji: "🤨",
  },
  [NeutralFacesEmojis.EXPRESSIONLESS_FACE]: {
    name: "Expressionless face",
    unicode: "U+1F611",
    emoji: "😑",
  },
  [NeutralFacesEmojis.FACE_WITH_NO_MOUTH]: {
    name: "Face with no mouth",
    unicode: "U+1F636",
    emoji: "😶",
  },
  [NeutralFacesEmojis.SMIRKING_FACE]: {
    name: "Smirking face",
    unicode: "U+1F60F",
    emoji: "😏",
  },
  [NeutralFacesEmojis.UNAMUSED_FACE]: {
    name: "Unamused face",
    unicode: "U+1F612",
    emoji: "😒",
  },
  [NeutralFacesEmojis.FACE_WITH_ROLLING_EYES]: {
    name: "Face with rolling eyes",
    unicode: "U+1F644",
    emoji: "🙄",
  },
  [NeutralFacesEmojis.GRIMACING_FACE]: {
    name: "Grimacing face",
    unicode: "U+1F62C",
    emoji: "😬",
  },
  [NeutralFacesEmojis.LYING_FACE]: {
    name: "Lying face",
    unicode: "U+1F925",
    emoji: "🤥",
  },
};