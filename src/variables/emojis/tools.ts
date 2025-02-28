import { type EmojiDefinition } from "./types";

export enum ToolsEmojis {
  HAMMER = "hammer",
  AXE = "axe",
  PICK = "pick",
  HAMMER_AND_PICK = "hammer_and_pick",
  HAMMER_AND_WRENCH = "hammer_and_wrench",
  SWORD = "sword",
  CROSSED_SWORDS = "crossed_swords",
  WATER_GUN = "water_gun",
  BOOMERANG = "boomerang",
  BOW_AND_ARROW = "bow_and_arrow",
  SHIELD = "shield",
  CARPENTRY_SAW = "carpentry_saw",
  WRENCH = "wrench",
  SCREWDRIVER = "screwdriver",
  BOLT_AND_NUT = "bolt_and_nut",
  WHEEL = "wheel",
  CLAMP = "clamp",
  BALANCE_SCALE = "balance_scale",
  WHITE_CANE = "white_cane",
  LINK = "link",
  CHAINS = "chains",
  HOOK = "hook",
  TOOLBOX = "toolbox",
  MAGNET = "magnet",
  LADDER = "ladder",
}

export const toolsEmojis: Record<ToolsEmojis, EmojiDefinition> = {
  [ToolsEmojis.HAMMER]: {
    name: "Hammer",
    unicode: "U+1F528",
    emoji: "🔨",
  },
  [ToolsEmojis.AXE]: {
    name: "Axe",
    unicode: "U+1FA93",
    emoji: "🪓",
  },
  [ToolsEmojis.PICK]: {
    name: "Pick",
    unicode: "U+26CF",
    emoji: "⛏",
  },
  [ToolsEmojis.HAMMER_AND_PICK]: {
    name: "Hammer and pick",
    unicode: "U+2692",
    emoji: "⚒",
  },
  [ToolsEmojis.HAMMER_AND_WRENCH]: {
    name: "Hammer and wrench",
    unicode: "U+1F6E0",
    emoji: "🛠",
  },
  [ToolsEmojis.SWORD]: {
    name: "Sword",
    unicode: "U+1F5E1",
    emoji: "🗡",
  },
  [ToolsEmojis.CROSSED_SWORDS]: {
    name: "Crossed swords",
    unicode: "U+2694",
    emoji: "⚔",
  },
  [ToolsEmojis.WATER_GUN]: {
    name: "Water gun",
    unicode: "U+1F52B",
    emoji: "🔫",
  },
  [ToolsEmojis.BOOMERANG]: {
    name: "Boomerang",
    unicode: "U+1FA83",
    emoji: "🪃",
  },
  [ToolsEmojis.BOW_AND_ARROW]: {
    name: "Bow and arrow",
    unicode: "U+1F3F9",
    emoji: "🏹",
  },
  [ToolsEmojis.SHIELD]: {
    name: "Shield",
    unicode: "U+1F6E1",
    emoji: "🛡",
  },
  [ToolsEmojis.CARPENTRY_SAW]: {
    name: "Carpentry saw",
    unicode: "U+1FA9A",
    emoji: "🪚",
  },
  [ToolsEmojis.WRENCH]: {
    name: "Wrench",
    unicode: "U+1F527",
    emoji: "🔧",
  },
  [ToolsEmojis.SCREWDRIVER]: {
    name: "Screwdriver",
    unicode: "U+1FA9B",
    emoji: "🪛",
  },
  [ToolsEmojis.BOLT_AND_NUT]: {
    name: "Bolt and nut",
    unicode: "U+1F529",
    emoji: "🔩",
  },
  [ToolsEmojis.WHEEL]: {
    name: "Wheel",
    unicode: "U+2699",
    emoji: "⚙",
  },
  [ToolsEmojis.CLAMP]: {
    name: "Clamp",
    unicode: "U+1F5DC",
    emoji: "🗜",
  },
  [ToolsEmojis.BALANCE_SCALE]: {
    name: "Balance scale",
    unicode: "U+2696",
    emoji: "⚖",
  },
  [ToolsEmojis.WHITE_CANE]: {
    name: "White cane",
    unicode: "U+1F9AF",
    emoji: "🦯",
  },
  [ToolsEmojis.LINK]: {
    name: "Link",
    unicode: "U+1F517",
    emoji: "🔗",
  },
  [ToolsEmojis.CHAINS]: {
    name: "Chains",
    unicode: "U+26D3",
    emoji: "⛓",
  },
  [ToolsEmojis.HOOK]: {
    name: "Hook",
    unicode: "U+1FA9D",
    emoji: "🪝",
  },
  [ToolsEmojis.TOOLBOX]: {
    name: "Toolbox",
    unicode: "U+1F9F0",
    emoji: "🧰",
  },
  [ToolsEmojis.MAGNET]: {
    name: "Magnet",
    unicode: "U+1F9F2",
    emoji: "🧲",
  },
  [ToolsEmojis.LADDER]: {
    name: "Ladder",
    unicode: "U+1FA9C",
    emoji: "🪜",
  },
}
