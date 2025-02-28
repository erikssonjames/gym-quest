import { type EmojiDefinition } from "./types";

export enum KeycapEmojis {
  HASH_KEYCAP = "hash_keycap",
  ASTERISK_KEYCAP = "asterisk_keycap",
  ZERO_KEYCAP = "zero_keycap",
  ONE_KEYCAP = "one_keycap",
  TWO_KEYCAP = "two_keycap",
  THREE_KEYCAP = "three_keycap",
  FOUR_KEYCAP = "four_keycap",
  FIVE_KEYCAP = "five_keycap",
  SIX_KEYCAP = "six_keycap",
  SEVEN_KEYCAP = "seven_keycap",
  EIGHT_KEYCAP = "eight_keycap",
  NINE_KEYCAP = "nine_keycap",
  TEN_KEYCAP = "ten_keycap",
}

export const keycapEmojis: Record<KeycapEmojis, EmojiDefinition> = {
  [KeycapEmojis.HASH_KEYCAP]: { name: "# Keycap", unicode: "U+20E3", emoji: "#️⃣" },
  [KeycapEmojis.ASTERISK_KEYCAP]: { name: "* Keycap", unicode: "U+20E3", emoji: "*️⃣" },
  [KeycapEmojis.ZERO_KEYCAP]: { name: "0 Keycap", unicode: "U+20E3", emoji: "0️⃣" },
  [KeycapEmojis.ONE_KEYCAP]: { name: "1 Keycap", unicode: "U+20E3", emoji: "1️⃣" },
  [KeycapEmojis.TWO_KEYCAP]: { name: "2 Keycap", unicode: "U+20E3", emoji: "2️⃣" },
  [KeycapEmojis.THREE_KEYCAP]: { name: "3 Keycap", unicode: "U+20E3", emoji: "3️⃣" },
  [KeycapEmojis.FOUR_KEYCAP]: { name: "4 Keycap", unicode: "U+20E3", emoji: "4️⃣" },
  [KeycapEmojis.FIVE_KEYCAP]: { name: "5 Keycap", unicode: "U+20E3", emoji: "5️⃣" },
  [KeycapEmojis.SIX_KEYCAP]: { name: "6 Keycap", unicode: "U+20E3", emoji: "6️⃣" },
  [KeycapEmojis.SEVEN_KEYCAP]: { name: "7 Keycap", unicode: "U+20E3", emoji: "7️⃣" },
  [KeycapEmojis.EIGHT_KEYCAP]: { name: "8 Keycap", unicode: "U+20E3", emoji: "8️⃣" },
  [KeycapEmojis.NINE_KEYCAP]: { name: "9 Keycap", unicode: "U+20E3", emoji: "9️⃣" },
  [KeycapEmojis.TEN_KEYCAP]: { name: "10 Keycap", unicode: "U+1F51F", emoji: "🔟" },
}
