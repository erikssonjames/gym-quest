import { type EmojiDefinition } from "./types";

export enum ArtsAndCraftsEmojis {
  PERFORMING_ARTS = "performing_arts",
  FRAMED_PICTURE = "framed_picture",
  ARTIST_PALETTE = "artist_palette",
  THREAD = "thread",
  SEWING_NEEDLE_WITH_THREAD = "sewing_needle_with_thread",
  YARN = "yarn",
  KNOT = "knot",
}

export const artsAndCraftsEmojis: Record<ArtsAndCraftsEmojis, EmojiDefinition> = {
  [ArtsAndCraftsEmojis.PERFORMING_ARTS]: { name: "Performing arts", unicode: "U+1F3AD", emoji: "🎭" },
  [ArtsAndCraftsEmojis.FRAMED_PICTURE]: { name: "Framed picture", unicode: "U+1F5BC", emoji: "🖼" },
  [ArtsAndCraftsEmojis.ARTIST_PALETTE]: { name: "Artist palette", unicode: "U+1F3A8", emoji: "🎨" },
  [ArtsAndCraftsEmojis.THREAD]: { name: "Thread", unicode: "U+1F9F5", emoji: "🧵" },
  [ArtsAndCraftsEmojis.SEWING_NEEDLE_WITH_THREAD]: { name: "Sewing needle with thread", unicode: "U+1FAA1", emoji: "🪡" },
  [ArtsAndCraftsEmojis.YARN]: { name: "Yarn", unicode: "U+1F9F6", emoji: "🧶" },
  [ArtsAndCraftsEmojis.KNOT]: { name: "Knot", unicode: "U+1FAA2", emoji: "🪢" },
}
