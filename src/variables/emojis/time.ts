import { type EmojiDefinition } from "./types";

export enum TimeEmojis {
  HOURGLASS_DONE = "hourglass_done",
  HOURGLASS_STARTING = "hourglass_starting",
  WATCH = "watch",
  ALARM = "alarm",
  STOPWATCH = "stopwatch",
  TIMER_CLOCK = "timer_clock",
  MANTELPIECE_CLOCK = "mantelpiece_clock",
  TWELVE_OCLOCK = "twelve_oclock",
  TWELVE_THIRTY = "twelve_thirty",
  ONE_OCLOCK = "one_oclock",
  ONE_THIRTY = "one_thirty",
  TWO_OCLOCK = "two_oclock",
  TWO_THIRTY = "two_thirty",
  THREE_OCLOCK = "three_oclock",
  THREE_THIRTY = "three_thirty",
  FOUR_OCLOCK = "four_oclock",
  FOUR_THIRTY = "four_thirty",
  FIVE_OCLOCK = "five_oclock",
  FIVE_THIRTY = "five_thirty",
  SIX_OCLOCK = "six_oclock",
  SIX_THIRTY = "six_thirty",
  SEVEN_OCLOCK = "seven_oclock",
  SEVEN_THIRTY = "seven_thirty",
  EIGHT_OCLOCK = "eight_oclock",
  EIGHT_THIRTY = "eight_thirty",
  NINE_OCLOCK = "nine_oclock",
  NINE_THIRTY = "nine_thirty",
  TEN_OCLOCK = "ten_oclock",
  TEN_THIRTY = "ten_thirty",
  ELEVEN_OCLOCK = "eleven_oclock",
  ELEVEN_THIRTY = "eleven_thirty",
}

export const timeEmojis: Record<TimeEmojis, EmojiDefinition> = {
  [TimeEmojis.HOURGLASS_DONE]: { name: "Hourglass done", unicode: "U+231B", emoji: "⌛" },
  [TimeEmojis.HOURGLASS_STARTING]: { name: "Hourglass starting", unicode: "U+23F3", emoji: "⏳" },
  [TimeEmojis.WATCH]: { name: "Watch", unicode: "U+231A", emoji: "⌚" },
  [TimeEmojis.ALARM]: { name: "Alarm", unicode: "U+23F0", emoji: "⏰" },
  [TimeEmojis.STOPWATCH]: { name: "Stopwatch", unicode: "U+23F1", emoji: "⏱" },
  [TimeEmojis.TIMER_CLOCK]: { name: "Timer clock", unicode: "U+23F2", emoji: "⏲" },
  [TimeEmojis.MANTELPIECE_CLOCK]: { name: "Mantelpiece clock", unicode: "U+1F570", emoji: "🕰" },
  [TimeEmojis.TWELVE_OCLOCK]: { name: "Twelve O'clock", unicode: "U+1F55B", emoji: "🕛" },
  [TimeEmojis.TWELVE_THIRTY]: { name: "Twelve-thirty", unicode: "U+1F567", emoji: "🕧" },
  [TimeEmojis.ONE_OCLOCK]: { name: "One O'clock", unicode: "U+1F550", emoji: "🕐" },
  [TimeEmojis.ONE_THIRTY]: { name: "One-thirty", unicode: "U+1F55C", emoji: "🕜" },
  [TimeEmojis.TWO_OCLOCK]: { name: "Two O'clock", unicode: "U+1F551", emoji: "🕑" },
  [TimeEmojis.TWO_THIRTY]: { name: "Two-thirty", unicode: "U+1F55D", emoji: "🕝" },
  [TimeEmojis.THREE_OCLOCK]: { name: "Three O'clock", unicode: "U+1F552", emoji: "🕒" },
  [TimeEmojis.THREE_THIRTY]: { name: "Three-thirty", unicode: "U+1F55E", emoji: "🕞" },
  [TimeEmojis.FOUR_OCLOCK]: { name: "Four O'clock", unicode: "U+1F553", emoji: "🕓" },
  [TimeEmojis.FOUR_THIRTY]: { name: "Four-thirty", unicode: "U+1F55F", emoji: "🕟" },
  [TimeEmojis.FIVE_OCLOCK]: { name: "Five O'clock", unicode: "U+1F554", emoji: "🕔" },
  [TimeEmojis.FIVE_THIRTY]: { name: "Five-thirty", unicode: "U+1F560", emoji: "🕠" },
  [TimeEmojis.SIX_OCLOCK]: { name: "Six O'clock", unicode: "U+1F555", emoji: "🕕" },
  [TimeEmojis.SIX_THIRTY]: { name: "Six-thirty", unicode: "U+1F561", emoji: "🕡" },
  [TimeEmojis.SEVEN_OCLOCK]: { name: "Seven O'clock", unicode: "U+1F556", emoji: "🕖" },
  [TimeEmojis.SEVEN_THIRTY]: { name: "Seven-thirty", unicode: "U+1F562", emoji: "🕢" },
  [TimeEmojis.EIGHT_OCLOCK]: { name: "Eight O'clock", unicode: "U+1F557", emoji: "🕗" },
  [TimeEmojis.EIGHT_THIRTY]: { name: "Eight-thirty", unicode: "U+1F563", emoji: "🕣" },
  [TimeEmojis.NINE_OCLOCK]: { name: "Nine O'clock", unicode: "U+1F558", emoji: "🕘" },
  [TimeEmojis.NINE_THIRTY]: { name: "Nine-thirty", unicode: "U+1F564", emoji: "🕤" },
  [TimeEmojis.TEN_OCLOCK]: { name: "Ten O'clock", unicode: "U+1F559", emoji: "🕙" },
  [TimeEmojis.TEN_THIRTY]: { name: "Ten-thirty", unicode: "U+1F565", emoji: "🕥" },
  [TimeEmojis.ELEVEN_OCLOCK]: { name: "Eleven O'clock", unicode: "U+1F55A", emoji: "🕚" },
  [TimeEmojis.ELEVEN_THIRTY]: { name: "Eleven-thirty", unicode: "U+1F566", emoji: "🕦" },
}
