import { type EmojiDefinition } from "./types";

export enum OtherObjectsEmojis {
  CIGARETTE = "cigarette",
  CASKET = "casket",
  HEADSTONE = "headstone",
  FUNERAL_URN = "funeral_urn",
  MOAI = "moai",
  PLACARD = "placard",
  ID_CARD = "id_card",
}

export const otherObjectsEmojis: Record<OtherObjectsEmojis, EmojiDefinition> = {
  [OtherObjectsEmojis.CIGARETTE]: {
    name: "Cigarette",
    unicode: "U+1F6AC",
    emoji: "🚬",
  },
  [OtherObjectsEmojis.CASKET]: {
    name: "Casket",
    unicode: "U+26B0",
    emoji: "⚰",
  },
  [OtherObjectsEmojis.HEADSTONE]: {
    name: "Headstone",
    unicode: "U+1FAA6",
    emoji: "🪦",
  },
  [OtherObjectsEmojis.FUNERAL_URN]: {
    name: "Funeral urn",
    unicode: "U+26B1",
    emoji: "⚱",
  },
  [OtherObjectsEmojis.MOAI]: {
    name: "Moai",
    unicode: "U+1F5FF",
    emoji: "🗿",
  },
  [OtherObjectsEmojis.PLACARD]: {
    name: "Placard",
    unicode: "U+1FAA7",
    emoji: "🪧",
  },
  [OtherObjectsEmojis.ID_CARD]: {
    name: "ID Card",
    unicode: "U+1FAAA",
    emoji: "🪪",
  },
}
