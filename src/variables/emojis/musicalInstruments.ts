import { type EmojiDefinition } from "./types";

export enum MusicalInstrumentEmojis {
  SAXOPHONE = "saxophone",
  ACCORDION = "accordion",
  GUITAR = "guitar",
  MUSICAL_KEYBOARD = "musical_keyboard",
  TRUMPET = "trumpet",
  VIOLIN = "violin",
  BANJO = "banjo",
  DRUM = "drum",
  LONG_DRUM = "long_drum",
}

export const musicalInstrumentsEmojis: Record<MusicalInstrumentEmojis, EmojiDefinition> = {
  [MusicalInstrumentEmojis.SAXOPHONE]: { name: "Saxophone", unicode: "U+1F3B7", emoji: "🎷" },
  [MusicalInstrumentEmojis.ACCORDION]: { name: "Accordion", unicode: "U+1FA97", emoji: "🪗" },
  [MusicalInstrumentEmojis.GUITAR]: { name: "Guitar", unicode: "U+1F3B8", emoji: "🎸" },
  [MusicalInstrumentEmojis.MUSICAL_KEYBOARD]: { name: "Musical keyboard", unicode: "U+1F3B9", emoji: "🎹" },
  [MusicalInstrumentEmojis.TRUMPET]: { name: "Trumpet", unicode: "U+1F3BA", emoji: "🎺" },
  [MusicalInstrumentEmojis.VIOLIN]: { name: "Violin", unicode: "U+1F3BB", emoji: "🎻" },
  [MusicalInstrumentEmojis.BANJO]: { name: "Banjo", unicode: "U+1FA95", emoji: "🪕" },
  [MusicalInstrumentEmojis.DRUM]: { name: "Drum", unicode: "U+1F941", emoji: "🥁" },
  [MusicalInstrumentEmojis.LONG_DRUM]: { name: "Long drum", unicode: "U+1FA98", emoji: "🪘" },
}
