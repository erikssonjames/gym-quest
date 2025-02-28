import { type EmojiDefinition } from "./types";

export enum BookAndPaperEmojis {
  NOTEBOOK_WITH_DECORATIVE_COVER = "notebook_with_decorative_cover",
  CLOSED_NOTEBOOK = "closed_notebook",
  OPENED_NOTEBOOK = "opened_notebook",
  GREEN_BOOK = "green_book",
  BLUE_BOOK = "blue_book",
  ORANGE_BOOK = "orange_book",
  ORANGE_BOOKS = "orange_books",
  NOTEBOOK = "notebook",
  LEDGER = "ledger",
  PAGE_WITH_CURL = "page_with_curl",
  SCROLL = "scroll",
  PAGE_FACING_UP = "page_facing_up",
  NEWSPAPER = "newspaper",
  ROLLED_UP_NEWSPAPER = "rolled_up_newspaper",
  BOOKMARK_TABS = "bookmark_tabs",
  BOOKMARK = "bookmark",
  LABEL = "label",
  MONEY_BAG = "money_bag",
  COIN = "coin",
  YEN_BANKNOTE = "yen_banknote",
  DOLLAR_BANKNOTE = "dollar_banknote",
  EURO_BANKNOTE = "euro_banknote",
  POUND_BANKNOTE = "pound_banknote",
  MONEY_WITH_WINGS = "money_with_wings",
  CREDIT_CARD = "credit_card",
  RECEIPT = "receipt",
  CHART_INCREASE_WOTH_YEN = "chart_increase_woth_yen",
}

export const bookAndPaperEmojis: Record<BookAndPaperEmojis, EmojiDefinition> = {
  [BookAndPaperEmojis.NOTEBOOK_WITH_DECORATIVE_COVER]: { name: "Notebook with decorative cover", unicode: "U+1F4D4", emoji: "📔" },
  [BookAndPaperEmojis.CLOSED_NOTEBOOK]: { name: "Closed notebook", unicode: "U+1F4D5", emoji: "📕" },
  [BookAndPaperEmojis.OPENED_NOTEBOOK]: { name: "Opened notebook", unicode: "U+1F4D6", emoji: "📖" },
  [BookAndPaperEmojis.GREEN_BOOK]: { name: "Green book", unicode: "U+1F4D7", emoji: "📗" },
  [BookAndPaperEmojis.BLUE_BOOK]: { name: "Blue book", unicode: "U+1F4D8", emoji: "📘" },
  [BookAndPaperEmojis.ORANGE_BOOK]: { name: "Orange book", unicode: "U+1F4D9", emoji: "📙" },
  [BookAndPaperEmojis.ORANGE_BOOKS]: { name: "Orange books", unicode: "U+1F4DA", emoji: "📚" },
  [BookAndPaperEmojis.NOTEBOOK]: { name: "Notebook", unicode: "U+1F4D3", emoji: "📓" },
  [BookAndPaperEmojis.LEDGER]: { name: "Ledger", unicode: "U+1F4D2", emoji: "📒" },
  [BookAndPaperEmojis.PAGE_WITH_CURL]: { name: "Page with curl", unicode: "U+1F4C3", emoji: "📃" },
  [BookAndPaperEmojis.SCROLL]: { name: "Scroll", unicode: "U+1F4DC", emoji: "📜" },
  [BookAndPaperEmojis.PAGE_FACING_UP]: { name: "Page facing up", unicode: "U+1F4C4", emoji: "📄" },
  [BookAndPaperEmojis.NEWSPAPER]: { name: "Newspaper", unicode: "U+1F4F0", emoji: "📰" },
  [BookAndPaperEmojis.ROLLED_UP_NEWSPAPER]: { name: "Rolled-up newspaper", unicode: "U+1F5DE", emoji: "🗞" },
  [BookAndPaperEmojis.BOOKMARK_TABS]: { name: "Bookmark tabs", unicode: "U+1F4D1", emoji: "📑" },
  [BookAndPaperEmojis.BOOKMARK]: { name: "Bookmark", unicode: "U+1F516", emoji: "🔖" },
  [BookAndPaperEmojis.LABEL]: { name: "Label", unicode: "U+1F3F7", emoji: "🏷" },
  [BookAndPaperEmojis.MONEY_BAG]: { name: "Money bag", unicode: "U+1F4B0", emoji: "💰" },
  [BookAndPaperEmojis.COIN]: { name: "Coin", unicode: "U+1FA99", emoji: "🪙" },
  [BookAndPaperEmojis.YEN_BANKNOTE]: { name: "Yen banknote", unicode: "U+1F4B4", emoji: "💴" },
  [BookAndPaperEmojis.DOLLAR_BANKNOTE]: { name: "Dollar banknote", unicode: "U+1F4B5", emoji: "💵" },
  [BookAndPaperEmojis.EURO_BANKNOTE]: { name: "Euro banknote", unicode: "U+1F4B6", emoji: "💶" },
  [BookAndPaperEmojis.POUND_BANKNOTE]: { name: "Pound banknote", unicode: "U+1F4B7", emoji: "💷" },
  [BookAndPaperEmojis.MONEY_WITH_WINGS]: { name: "Money with wings", unicode: "U+1F4B8", emoji: "💸" },
  [BookAndPaperEmojis.CREDIT_CARD]: { name: "Credit card", unicode: "U+1F4B3", emoji: "💳" },
  [BookAndPaperEmojis.RECEIPT]: { name: "Receipt", unicode: "U+1F9FE", emoji: "🧾" },
  [BookAndPaperEmojis.CHART_INCREASE_WOTH_YEN]: { name: "Chart increase woth Yen", unicode: "U+1F4B9", emoji: "💹" },
}
