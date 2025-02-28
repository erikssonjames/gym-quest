import { type EmojiDefinition } from "./types";

export enum LockEmojis {
  LOCKED = "locked",
  UNLOCKED = "unlocked",
  LOCKED_WITH_PEN = "locked_with_pen",
  LOCKED_WITH_KEY = "locked_with_key",
  KEY = "key",
  OLD_KEY = "old_key",
}

export const lockEmojis: Record<LockEmojis, EmojiDefinition> = {
  [LockEmojis.LOCKED]: {
    name: "Locked",
    unicode: "U+1F512",
    emoji: "🔒",
  },
  [LockEmojis.UNLOCKED]: {
    name: "Unlocked",
    unicode: "U+1F513",
    emoji: "🔓",
  },
  [LockEmojis.LOCKED_WITH_PEN]: {
    name: "Locked with pen",
    unicode: "U+1F50F",
    emoji: "🔏",
  },
  [LockEmojis.LOCKED_WITH_KEY]: {
    name: "Locked with key",
    unicode: "U+1F510",
    emoji: "🔐",
  },
  [LockEmojis.KEY]: {
    name: "Key",
    unicode: "U+1F511",
    emoji: "🔑",
  },
  [LockEmojis.OLD_KEY]: {
    name: "Old key",
    unicode: "U+1F5DD",
    emoji: "🗝",
  },
}
