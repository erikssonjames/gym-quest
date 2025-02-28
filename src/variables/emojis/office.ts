import { type EmojiDefinition } from "./types";

export enum OfficeEmojis {
  BRIEFCASE = "briefcase",
  FILE_FOLDER = "file_folder",
  OPEN_FOLDER = "open_folder",
  CARD_INDEX_DIVIDERS = "card_index_dividers",
  CALENDER = "calender",
  TEAR_OFF_CALENDER = "tear_off_calender",
  CARD_INDEX = "card_index",
  INCREASING_CHART = "increasing_chart",
  DECREASING_CHART = "decreasing_chart",
  BAR_CHART = "bar_chart",
  CLIPBOARD = "clipboard",
  PUSHPIN = "pushpin",
  ROUND_PUSHPIN = "round_pushpin",
  PAPERCLIP = "paperclip",
  LINKED_PAPERCLIPS = "linked_paperclips",
  STRAIGHT_RULER = "straight_ruler",
  TRIANGULAR_RULER = "triangular_ruler",
  SCISSORS = "scissors",
  CARD_FILE_BOX = "card_file_box",
  FILE_CABINET = "file_cabinet",
  WASTE_BASKET = "waste_basket",
}

export const officeEmojis: Record<OfficeEmojis, EmojiDefinition> = {
  [OfficeEmojis.BRIEFCASE]: {
    name: "Briefcase",
    unicode: "U+1F4BC",
    emoji: "💼",
  },
  [OfficeEmojis.FILE_FOLDER]: {
    name: "File folder",
    unicode: "U+1F4C1",
    emoji: "📁",
  },
  [OfficeEmojis.OPEN_FOLDER]: {
    name: "Open the folder",
    unicode: "U+1F4C2",
    emoji: "📂",
  },
  [OfficeEmojis.CARD_INDEX_DIVIDERS]: {
    name: "Card index dividers",
    unicode: "U+1F5C2",
    emoji: "🗂",
  },
  [OfficeEmojis.CALENDER]: {
    name: "Calender",
    unicode: "U+1F4C5",
    emoji: "📅",
  },
  [OfficeEmojis.TEAR_OFF_CALENDER]: {
    name: "Tear off calender",
    unicode: "U+1F4C6",
    emoji: "📆",
  },
  [OfficeEmojis.CARD_INDEX]: {
    name: "Card index",
    unicode: "U+1F4C7",
    emoji: "📇",
  },
  [OfficeEmojis.INCREASING_CHART]: {
    name: "Increasing chart",
    unicode: "U+1F4C8",
    emoji: "📈",
  },
  [OfficeEmojis.DECREASING_CHART]: {
    name: "Decreasing chart",
    unicode: "U+1F4C9",
    emoji: "📉",
  },
  [OfficeEmojis.BAR_CHART]: {
    name: "Bar chart",
    unicode: "U+1F4CA",
    emoji: "📊",
  },
  [OfficeEmojis.CLIPBOARD]: {
    name: "Clipboard",
    unicode: "U+1F4CB",
    emoji: "📋",
  },
  [OfficeEmojis.PUSHPIN]: {
    name: "Pushpin",
    unicode: "U+1F4CC",
    emoji: "📌",
  },
  [OfficeEmojis.ROUND_PUSHPIN]: {
    name: "Round pushpin",
    unicode: "U+1F4CD",
    emoji: "📍",
  },
  [OfficeEmojis.PAPERCLIP]: {
    name: "Paperclip",
    unicode: "U+1F4CE",
    emoji: "📎",
  },
  [OfficeEmojis.LINKED_PAPERCLIPS]: {
    name: "Linked paperclips",
    unicode: "U+1F587",
    emoji: "🖇",
  },
  [OfficeEmojis.STRAIGHT_RULER]: {
    name: "Straight ruler",
    unicode: "U+1F4CF",
    emoji: "📏",
  },
  [OfficeEmojis.TRIANGULAR_RULER]: {
    name: "Triangular ruler",
    unicode: "U+1F4D0",
    emoji: "📐",
  },
  [OfficeEmojis.SCISSORS]: {
    name: "Scissors",
    unicode: "U+2702",
    emoji: "✂",
  },
  [OfficeEmojis.CARD_FILE_BOX]: {
    name: "Card file box",
    unicode: "U+1F5C3",
    emoji: "🗃",
  },
  [OfficeEmojis.FILE_CABINET]: {
    name: "File cabinet",
    unicode: "U+1F5C4",
    emoji: "🗄",
  },
  [OfficeEmojis.WASTE_BASKET]: {
    name: "Waste basket",
    unicode: "U+1F5D1",
    emoji: "🗑",
  },
}
