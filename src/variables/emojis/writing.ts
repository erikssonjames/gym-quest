import { EmojiDefinition } from "./types";

export enum WritingEmojis {
  PENCIL = "pencil",
  BLACK_NIB = "black_nib",
  FOUNTAIN_PEN = "fountain_pen",
  PEN = "pen",
  PAINTBRUSH = "paintbrush",
  CRAYON = "crayon",
  MEMO = "memo",
}

export const writingEmojis: Record<WritingEmojis, EmojiDefinition> = {
  [WritingEmojis.PENCIL]: {
    name: "Pencil",
    unicode: "U+270F",
    emoji: "✏",
  },
  [WritingEmojis.BLACK_NIB]: {
    name: "Black nib",
    unicode: "U+2712",
    emoji: "✒",
  },
  [WritingEmojis.FOUNTAIN_PEN]: {
    name: "Fountain pen",
    unicode: "U+1F58B",
    emoji: "🖋",
  },
  [WritingEmojis.PEN]: {
    name: "Pen",
    unicode: "U+1F58A",
    emoji: "🖊",
  },
  [WritingEmojis.PAINTBRUSH]: {
    name: "Paintbrush",
    unicode: "U+1F58C",
    emoji: "🖌",
  },
  [WritingEmojis.CRAYON]: {
    name: "Crayon",
    unicode: "U+1F58D",
    emoji: "🖍",
  },
  [WritingEmojis.MEMO]: {
    name: "Memo",
    unicode: "U+1F4DD",
    emoji: "📝",
  },
}
