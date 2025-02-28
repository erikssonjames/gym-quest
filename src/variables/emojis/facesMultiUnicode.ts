import { type EmojiDefinition } from "./types";

export enum MultiUnicodeFacesEmojis {
  FACE_IN_CLOUDS = "face_in_clouds",
  FACE_EXHALING = "face_exhaling",
  FACE_WITH_SPIRAL_EYES = "face_with_spiral_eyes",
  HEART_ON_FIRE = "heart_on_fire",
  MENDING_HEART = "mending_heart",
  EYE_IN_SPEECH_BUBBLE = "eye_in_speech_bubble",
  MAN_WITH_BEARD = "man_with_beard",
  WOMAN_WITH_BEARD = "woman_with_beard",
  MAN_WITH_RED_HAIR = "man_with_red_hair",
  MAN_WITH_CURLY_HAIR = "man_with_curly_hair",
  MAN_WITH_WHITE_HAIR = "man_with_white_hair",
  MAN_WITH_BALD_HEAD = "man_with_bald_head",
  WOMAN_WITH_RED_HAIR = "woman_with_red_hair",
  PERSON_WITH_RED_HAIR = "person_with_red_hair",
  WOMAN_WITH_CURLY_HAIR = "woman_with_curly_hair",
  PERSON_WITH_CURLY_HAIR = "person_with_curly_hair",
  WOMAN_WITH_WHITE_HAIR = "woman_with_white_hair",
  PERSON_WITH_WHITE_HAIR = "person_with_white_hair",
  WOMAN_WITH_BALD_HEAD = "woman_with_bald_head",
  PERSON_WITH_BALD_HEAD = "person_with_bald_head",
  WOMAN_WITH_BLOND_HAIR = "woman_with_blond_hair",
  MAN_WITH_BLOND_HAIR = "man_with_blond_hair",
}

export const multiUnicodeFacesEmojis: Record<
  MultiUnicodeFacesEmojis,
  EmojiDefinition
> = {
  [MultiUnicodeFacesEmojis.FACE_IN_CLOUDS]: {
    name: "Face in clouds",
    unicode: "U+1F636 U+200D U+1F32B U+FE0F",
    emoji: "😶‍🌫️",
  },
  [MultiUnicodeFacesEmojis.FACE_EXHALING]: {
    name: "Face exhaling",
    unicode: "U+1F62E U+200D U+1F4A8",
    emoji: "😮‍💨",
  },
  [MultiUnicodeFacesEmojis.FACE_WITH_SPIRAL_EYES]: {
    name: "Face with spiral eyes",
    unicode: "U+1F635 U+200D U+1F4AB",
    emoji: "😵‍💫",
  },
  [MultiUnicodeFacesEmojis.HEART_ON_FIRE]: {
    name: "Heart on fire",
    unicode: "U+2764 U+FE0F U+200D U+1F525",
    emoji: "❤️‍🔥",
  },
  [MultiUnicodeFacesEmojis.MENDING_HEART]: {
    name: "Mending heart",
    unicode: "U+2764 U+FE0F U+200D U+1FA79",
    emoji: "❤️‍🩹",
  },
  [MultiUnicodeFacesEmojis.EYE_IN_SPEECH_BUBBLE]: {
    name: "Eye in speech bubble",
    unicode: "U+1F441 U+FE0F U+200D U+1F5E8 U+FE0F",
    emoji: "👁️‍🗨️",
  },
  [MultiUnicodeFacesEmojis.MAN_WITH_BEARD]: {
    name: "Man with beard",
    unicode: "U+1F9D4 U+200D U+2642 U+FE0F",
    emoji: "🧔‍♂️",
  },
  [MultiUnicodeFacesEmojis.WOMAN_WITH_BEARD]: {
    name: "Woman with beard",
    unicode: "U+1F9D4 U+200D U+2640 U+FE0F",
    emoji: "🧔‍♀️",
  },
  [MultiUnicodeFacesEmojis.MAN_WITH_RED_HAIR]: {
    name: "Man with red hair",
    unicode: "U+1F468 U+200D U+1F9B0",
    emoji: "👨‍🦰",
  },
  [MultiUnicodeFacesEmojis.MAN_WITH_CURLY_HAIR]: {
    name: "Man with curly hair",
    unicode: "U+1F468 U+200D U+1F9B1",
    emoji: "👨‍🦱",
  },
  [MultiUnicodeFacesEmojis.MAN_WITH_WHITE_HAIR]: {
    name: "Man with white hair",
    unicode: "U+1F468 U+200D U+1F9B3",
    emoji: "👨‍🦳",
  },
  [MultiUnicodeFacesEmojis.MAN_WITH_BALD_HEAD]: {
    name: "Man with bald head",
    unicode: "U+1F468 U+200D U+1F9B2",
    emoji: "👨‍🦲",
  },
  [MultiUnicodeFacesEmojis.WOMAN_WITH_RED_HAIR]: {
    name: "Woman with red hair",
    unicode: "U+1F469 U+200D U+1F9B0",
    emoji: "👩‍🦰",
  },
  [MultiUnicodeFacesEmojis.PERSON_WITH_RED_HAIR]: {
    name: "Person with red hair",
    unicode: "U+1F9D1 U+200D U+1F9B0",
    emoji: "🧑‍🦰",
  },
  [MultiUnicodeFacesEmojis.WOMAN_WITH_CURLY_HAIR]: {
    name: "Woman with curly hair",
    unicode: "U+1F469 U+200D U+1F9B1",
    emoji: "👩‍🦱",
  },
  [MultiUnicodeFacesEmojis.PERSON_WITH_CURLY_HAIR]: {
    name: "Person with curly hair",
    unicode: "U+1F9D1 U+200D U+1F9B1",
    emoji: "🧑‍🦱",
  },
  [MultiUnicodeFacesEmojis.WOMAN_WITH_WHITE_HAIR]: {
    name: "Woman with white hair",
    unicode: "U+1F469 U+200D U+1F9B3",
    emoji: "👩‍🦳",
  },
  [MultiUnicodeFacesEmojis.PERSON_WITH_WHITE_HAIR]: {
    name: "Person with white hair",
    unicode: "U+1F9D1 U+200D U+1F9B3",
    emoji: "🧑‍🦳",
  },
  [MultiUnicodeFacesEmojis.WOMAN_WITH_BALD_HEAD]: {
    name: "Woman with bald head",
    unicode: "U+1F469 U+200D U+1F9B2",
    emoji: "👩‍🦲",
  },
  [MultiUnicodeFacesEmojis.PERSON_WITH_BALD_HEAD]: {
    name: "Person with bald head",
    unicode: "U+1F9D1 U+200D U+1F9B2",
    emoji: "🧑‍🦲",
  },
  [MultiUnicodeFacesEmojis.WOMAN_WITH_BLOND_HAIR]: {
    name: "Woman with blond hair",
    unicode: "U+1F471 U+200D U+2640 U+FE0F",
    emoji: "👱‍♀️",
  },
  [MultiUnicodeFacesEmojis.MAN_WITH_BLOND_HAIR]: {
    name: "Man with blond hair",
    unicode: "U+1F471 U+200D U+2642 U+FE0F",
    emoji: "👱‍♂️",
  },
};