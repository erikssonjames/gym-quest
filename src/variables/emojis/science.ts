import { type EmojiDefinition } from "./types";

export enum ScienceEmojis {
  ALEMBIC = "alembic",
  TEST_TUBE = "test_tube",
  PETRI_DISH = "petri_dish",
  DNA = "dna",
  MICROSCOPE = "microscope",
  TELESCOPE = "telescope",
  SATELITE_ANTENNA = "satelite_antenna",
}

export const scienceEmojis: Record<ScienceEmojis, EmojiDefinition> = {
  [ScienceEmojis.ALEMBIC]: {
    name: "Alembic",
    unicode: "U+2697",
    emoji: "⚗",
  },
  [ScienceEmojis.TEST_TUBE]: {
    name: "Test tube",
    unicode: "U+1F9EA",
    emoji: "🧪",
  },
  [ScienceEmojis.PETRI_DISH]: {
    name: "Petri dish",
    unicode: "U+1F9EB",
    emoji: "🧫",
  },
  [ScienceEmojis.DNA]: {
    name: "DNA",
    unicode: "U+1F9EC",
    emoji: "🧬",
  },
  [ScienceEmojis.MICROSCOPE]: {
    name: "Microscope",
    unicode: "U+1F52C",
    emoji: "🔬",
  },
  [ScienceEmojis.TELESCOPE]: {
    name: "Telescope",
    unicode: "U+1F52D",
    emoji: "🔭",
  },
  [ScienceEmojis.SATELITE_ANTENNA]: {
    name: "Satelite antenna",
    unicode: "U+1F4E1",
    emoji: "📡",
  },
}
