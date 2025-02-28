import { type EmojiDefinition } from "./types";

export enum MedicalEmojis {
  SYRINGE = "syringe",
  DROPLET_OF_BLOOD = "droplet_of_blood",
  PILL = "pill",
  ADHESIVE_BANDAGE = "adhesive_bandage",
  CRUTCH = "crutch",
  STETHOSCOPE = "stethoscope",
  X_RAY = "x_ray",
}

export const medicalEmojis: Record<MedicalEmojis, EmojiDefinition> = {
  [MedicalEmojis.SYRINGE]: {
    name: "Syringe",
    unicode: "U+1F489",
    emoji: "💉",
  },
  [MedicalEmojis.DROPLET_OF_BLOOD]: {
    name: "A droplet of blood",
    unicode: "U+1FA78",
    emoji: "🩸",
  },
  [MedicalEmojis.PILL]: {
    name: "Pill",
    unicode: "U+1F48A",
    emoji: "💊",
  },
  [MedicalEmojis.ADHESIVE_BANDAGE]: {
    name: "Adhesive bandage",
    unicode: "🩹",
    emoji: "🩹",
  },
  [MedicalEmojis.CRUTCH]: {
    name: "Crutch",
    unicode: "U+1FA7C",
    emoji: "🩼",
  },
  [MedicalEmojis.STETHOSCOPE]: {
    name: "Stethoscope",
    unicode: "U+1FA7A",
    emoji: "🩺",
  },
  [MedicalEmojis.X_RAY]: {
    name: "X-ray",
    unicode: "U+1FA7B",
    emoji: "🩻",
  },
}
