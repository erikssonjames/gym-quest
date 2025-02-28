import { type EmojiDefinition } from "./types";

export enum AlphanumericSymbolsEmojis {
  INPUT_LATIN_UPPERCASE = "input_latin_uppercase",
  INPUT_LATIN_LOWERCASE = "input_latin_lowercase",
  INPUT_NUMBERS = "input_numbers",
  INPUT_SYMBOLS = "input_symbols",
  INPUT_LATIN_LETTERS = "input_latin_letters",
  A_BLOOD_TYPE = "a_blood_type",
  AB_BLOOD_TYPE = "ab_blood_type",
  B_BLOOD_TYPE = "b_blood_type",
  O_BLOOD_TYPE = "o_blood_type",
  CL_BUTTON = "cl_button",
  COOL_BUTTON = "cool_button",
  FREE_BUTTON = "free_button",
  INFO_BUTTON = "info_button",
  ID_BUTTON = "id_button",
  M_CIRCLED = "m_circled",
  NEW_BUTTON = "new_button",
  NG_BUTTON = "ng_button",
  OK_BUTTON = "ok_button",
  P_BUTTON = "p_button",
  SOS_BUTTON = "sos_button",
  UP_BUTTON = "up_button",
  VS_BUTTON = "vs_button",
}

export const alphanumericSymbolsEmojis: Record<AlphanumericSymbolsEmojis, EmojiDefinition> =
{
  [AlphanumericSymbolsEmojis.INPUT_LATIN_UPPERCASE]: {
    name: "Input Latin uppercase",
    unicode: "U+1F520",
    emoji: "🔠",
  },
  [AlphanumericSymbolsEmojis.INPUT_LATIN_LOWERCASE]: {
    name: "Input Latin lowercase",
    unicode: "U+1F521",
    emoji: "🔡",
  },
  [AlphanumericSymbolsEmojis.INPUT_NUMBERS]: {
    name: "Input numbers",
    unicode: "U+1F522",
    emoji: "🔢",
  },
  [AlphanumericSymbolsEmojis.INPUT_SYMBOLS]: {
    name: "Input symbols",
    unicode: "U+1F523",
    emoji: "🔣",
  },
  [AlphanumericSymbolsEmojis.INPUT_LATIN_LETTERS]: {
    name: "Input Latin letters",
    unicode: "U+1F524",
    emoji: "🔤",
  },
  [AlphanumericSymbolsEmojis.A_BLOOD_TYPE]: {
    name: "A blood type",
    unicode: "U+1F170",
    emoji: "🅰",
  },
  [AlphanumericSymbolsEmojis.AB_BLOOD_TYPE]: {
    name: "AB blood type",
    unicode: "U+1F18E",
    emoji: "🆎",
  },
  [AlphanumericSymbolsEmojis.B_BLOOD_TYPE]: {
    name: "B blood type",
    unicode: "U+1F171",
    emoji: "🅱",
  },
  [AlphanumericSymbolsEmojis.O_BLOOD_TYPE]: {
    name: "O blood type",
    unicode: "U+1F17E",
    emoji: "🅾",
  },
  [AlphanumericSymbolsEmojis.CL_BUTTON]: {
    name: "CL button",
    unicode: "U+1F191",
    emoji: "🆑",
  },
  [AlphanumericSymbolsEmojis.COOL_BUTTON]: {
    name: "Cool button",
    unicode: "U+1F192",
    emoji: "🆒",
  },
  [AlphanumericSymbolsEmojis.FREE_BUTTON]: {
    name: "Free button",
    unicode: "U+1F193",
    emoji: "🆓",
  },
  [AlphanumericSymbolsEmojis.INFO_BUTTON]: {
    name: "Info button",
    unicode: "U+2139",
    emoji: "ℹ",
  },
  [AlphanumericSymbolsEmojis.ID_BUTTON]: {
    name: "ID button",
    unicode: "U+1F194",
    emoji: "🆔",
  },
  [AlphanumericSymbolsEmojis.M_CIRCLED]: {
    name: "Circled M",
    unicode: "U+24C2",
    emoji: "Ⓜ",
  },
  [AlphanumericSymbolsEmojis.NEW_BUTTON]: {
    name: "New button",
    unicode: "U+1F195",
    emoji: "🆕",
  },
  [AlphanumericSymbolsEmojis.NG_BUTTON]: {
    name: "NG button",
    unicode: "U+1F196",
    emoji: "🆖",
  },
  [AlphanumericSymbolsEmojis.OK_BUTTON]: {
    name: "OK button",
    unicode: "U+1F197",
    emoji: "🆗",
  },
  [AlphanumericSymbolsEmojis.P_BUTTON]: {
    name: "P button",
    unicode: "U+1F17F",
    emoji: "🅿",
  },
  [AlphanumericSymbolsEmojis.SOS_BUTTON]: {
    name: "SOS button",
    unicode: "U+1F198",
    emoji: "🆘",
  },
  [AlphanumericSymbolsEmojis.UP_BUTTON]: {
    name: "UP! button",
    unicode: "U+1F199",
    emoji: "🆙",
  },
  [AlphanumericSymbolsEmojis.VS_BUTTON]: {
    name: "VS Button",
    unicode: "U+1F19A",
    emoji: "🆚",
  },
}
