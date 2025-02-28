import { EmojiDefinition } from "./types";

export enum SleepyFacesEmojis {
  SLEEPY_FACE = "sleepy_face",
  SLEEPING_FACE = "sleeping_face",
  RELIEVED_FACE = "relieved_face",
  PENSIVE_FACE = "pensive_face",
  DROOLING_FACE = "drooling_face",
}

export const sleepyFacesEmojis: Record<SleepyFacesEmojis, EmojiDefinition> = {
  [SleepyFacesEmojis.SLEEPY_FACE]: {
    name: "Sleepy face",
    unicode: "U+1F62A",
    emoji: "😪",
  },
  [SleepyFacesEmojis.SLEEPING_FACE]: {
    name: "Sleeping face",
    unicode: "U+1F634",
    emoji: "😴",
  },
  [SleepyFacesEmojis.RELIEVED_FACE]: {
    name: "Relieved face",
    unicode: "U+1F60C",
    emoji: "😌",
  },
  [SleepyFacesEmojis.PENSIVE_FACE]: {
    name: "Pensive face",
    unicode: "U+1F614",
    emoji: "😔",
  },
  [SleepyFacesEmojis.DROOLING_FACE]: {
    name: "Drooling face",
    unicode: "U+1F924",
    emoji: "🤤",
  },
};