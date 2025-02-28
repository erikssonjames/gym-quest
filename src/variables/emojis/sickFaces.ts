import { EmojiDefinition } from "./types";

export enum SickFacesEmojis {
  FACE_WITH_MASK = "face_with_mask",
  FACE_WITH_THERMOMETER = "face_with_thermometer",
  FACE_WITH_BANDAGE = "face_with_bandage",
  NAUSEOUS_FACE = "nauseous_face",
  VOMITING_FACE = "vomiting_face",
  SNEEZING_FACE = "sneezing_face",
  HOT_FACE = "hot_face",
  COLD_FACE = "cold_face",
  WOOZY_FACE = "woozy_face",
  FACE_WITH_CROSSED_OUT_EYES = "face_with_crossed_out_eyes",
  FACE_WITH_EXPLODING_HEAD = "face_with_exploding_head",
}

export const sickFacesEmojis: Record<SickFacesEmojis, EmojiDefinition> = {
  [SickFacesEmojis.FACE_WITH_MASK]: {
    name: "Face with mask",
    unicode: "U+1F637",
    emoji: "😷",
  },
  [SickFacesEmojis.FACE_WITH_THERMOMETER]: {
    name: "Face with thermometer",
    unicode: "U+1F912",
    emoji: "🤒",
  },
  [SickFacesEmojis.FACE_WITH_BANDAGE]: {
    name: "Face with bandage",
    unicode: "U+1F915",
    emoji: "🤕",
  },
  [SickFacesEmojis.NAUSEOUS_FACE]: {
    name: "Nauseous face",
    unicode: "U+1F922",
    emoji: "🤢",
  },
  [SickFacesEmojis.VOMITING_FACE]: {
    name: "Vomiting face",
    unicode: "U+1F92E",
    emoji: "🤮",
  },
  [SickFacesEmojis.SNEEZING_FACE]: {
    name: "Sneezing face",
    unicode: "U+1F927",
    emoji: "🤧",
  },
  [SickFacesEmojis.HOT_FACE]: {
    name: "Hot face",
    unicode: "U+1F975",
    emoji: "🥵",
  },
  [SickFacesEmojis.COLD_FACE]: {
    name: "Cold face",
    unicode: "U+1F976",
    emoji: "🥶",
  },
  [SickFacesEmojis.WOOZY_FACE]: {
    name: "Woozy face",
    unicode: "U+1F974",
    emoji: "🥴",
  },
  [SickFacesEmojis.FACE_WITH_CROSSED_OUT_EYES]: {
    name: "Face with crossed-out eyes",
    unicode: "U+1F635",
    emoji: "😵",
  },
  [SickFacesEmojis.FACE_WITH_EXPLODING_HEAD]: {
    name: "Face with exploding head",
    unicode: "U+1F92F",
    emoji: "🤯",
  },
};