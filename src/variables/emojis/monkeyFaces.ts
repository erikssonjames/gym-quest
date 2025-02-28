import { type EmojiDefinition } from "./types";

export enum MonkeyFacesEmojis {
  SEE_NO_EVIL_MONKEY = "see_no_evil_monkey",
  HEAR_NO_EVIL_MONKEY = "hear_no_evil_monkey",
  SPEAK_NO_EVIL_MONKEY = "speak_no_evil_monkey",
}

export const monkeyFacesEmojis: Record<MonkeyFacesEmojis, EmojiDefinition> = {
  [MonkeyFacesEmojis.SEE_NO_EVIL_MONKEY]: {
    name: "See no evil monkey",
    unicode: "U+1F648",
    emoji: "🙈",
  },
  [MonkeyFacesEmojis.HEAR_NO_EVIL_MONKEY]: {
    name: "Hear no evil monkey",
    unicode: "U+1F649",
    emoji: "🙉",
  },
  [MonkeyFacesEmojis.SPEAK_NO_EVIL_MONKEY]: {
    name: "Speak no evil monkey",
    unicode: "U+1F64A",
    emoji: "🙊",
  },
};