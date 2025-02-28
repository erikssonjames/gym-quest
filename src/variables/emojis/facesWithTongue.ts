import { type EmojiDefinition } from "./types";

export enum FacesWithTongueEmojis {
  YUMMY_FACE = "yummy_face",
  FACE_WITH_TONGUE = "face_with_tongue",
  WINKING_FACE_WITH_TONGUE = "winking_face_with_tongue",
  ZANY_FACE = "zany_face",
  SQUINTING_FACE_WITH_TONGUE = "squinting_face_with_tongue",
  MONEY_FACE_WITH_MONEY_TONGUE = "money_face_with_money_tongue",
}

export const facesWithTongueEmojis: Record<FacesWithTongueEmojis, EmojiDefinition> =
{
  [FacesWithTongueEmojis.YUMMY_FACE]: {
    name: "Yummy face",
    unicode: "U+1F60B",
    emoji: "😋",
  },
  [FacesWithTongueEmojis.FACE_WITH_TONGUE]: {
    name: "Face with tongue",
    unicode: "U+1F61B",
    emoji: "😛",
  },
  [FacesWithTongueEmojis.WINKING_FACE_WITH_TONGUE]: {
    name: "WInking face with tongue",
    unicode: "U+1F61C",
    emoji: "😜",
  },
  [FacesWithTongueEmojis.ZANY_FACE]: {
    name: "Zany face",
    unicode: "U+1F92A",
    emoji: "🤪",
  },
  [FacesWithTongueEmojis.SQUINTING_FACE_WITH_TONGUE]: {
    name: "Squinting face with tongue",
    unicode: "U+1F61D",
    emoji: "😝",
  },
  [FacesWithTongueEmojis.MONEY_FACE_WITH_MONEY_TONGUE]: {
    name: "Money face with money tongue",
    unicode: "U+1F911",
    emoji: "🤑",
  },
};