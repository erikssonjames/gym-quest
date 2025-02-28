import { type EmojiDefinition } from "./types";

export enum FlagsEmojis {
  CHEQUERED_FLAG = "chequered_flag",
  TRIANGULAR_FLAG = "triangular_flag",
  CROSSED_FLAG = "crossed_flag",
  BLACK_FLAG = "black_flag",
  WHITE_FLAG = "white_flag",
  RAINBOW_FLAG = "rainbow_flag",
  TRANSGENDER_FLAG = "transgender_flag",
  PIRATE_FLAG = "pirate_flag",
}

export const flagsEmojis: Record<FlagsEmojis, EmojiDefinition> = {
  [FlagsEmojis.CHEQUERED_FLAG]: {
    name: "Chequered flag",
    unicode: "U+1F3C1",
    emoji: "🏁",
  },
  [FlagsEmojis.TRIANGULAR_FLAG]: {
    name: "Triangular flag",
    unicode: "U+1F6A9",
    emoji: "🚩",
  },
  [FlagsEmojis.CROSSED_FLAG]: {
    name: "Crossed flag",
    unicode: "U+1F38C",
    emoji: "🎌",
  },
  [FlagsEmojis.BLACK_FLAG]: {
    name: "Black flag",
    unicode: "U+1F3F4",
    emoji: "🏴",
  },
  [FlagsEmojis.WHITE_FLAG]: {
    name: "White flag",
    unicode: "U+1F3F3",
    emoji: "🏳",
  },
  [FlagsEmojis.RAINBOW_FLAG]: {
    name: "Rainbow flag",
    unicode: "U+1F3F3 U+FE0F U+200D U+1F308",
    emoji: "🏳️‍🌈",
  },
  [FlagsEmojis.TRANSGENDER_FLAG]: {
    name: "Transgender Flag",
    unicode: "U+1F3F3 U+FE0F U+200D U+26A7 U+FE0F",
    emoji: "🏳️‍⚧️",
  },
  [FlagsEmojis.PIRATE_FLAG]: {
    name: "Pirate flag",
    unicode: "U+1F3F4 U+200D U+2620 U+FE0F",
    emoji: "🏴‍☠️",
  },
}
