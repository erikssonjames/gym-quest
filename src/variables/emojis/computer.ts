import { type EmojiDefinition } from "./types";

export enum ComputerEmojis {
  FULL_BATTERY = "full_battery",
  LOW_BATTERY = "low_battery",
  ELECTRIC_PLUG = "electric_plug",
  LAPTOP = "laptop",
  DESKTOP_COMPUTER = "desktop_computer",
  PRINTER = "printer",
  KEYBOARD = "keyboard",
  MOUSE = "mouse",
  TRACKBALL = "trackball",
  COMPUTER_DISK = "computer_disk",
  FLOPPY_DISK = "floppy_disk",
  OPTICAL_DISK = "optical_disk",
  DVD = "dvd",
  ABACUS = "abacus",
}

export const computerEmojis: Record<ComputerEmojis, EmojiDefinition> = {
  [ComputerEmojis.FULL_BATTERY]: { name: "Full battery", unicode: "U+1F50B", emoji: "🔋" },
  [ComputerEmojis.LOW_BATTERY]: { name: "Low battery", unicode: "U+1FAAB", emoji: "🪫" },
  [ComputerEmojis.ELECTRIC_PLUG]: { name: "Electric plug", unicode: "U+1F50C", emoji: "🔌" },
  [ComputerEmojis.LAPTOP]: { name: "Laptop", unicode: "U+1F4BB", emoji: "💻" },
  [ComputerEmojis.DESKTOP_COMPUTER]: { name: "Desktop computer", unicode: "U+1F5A5", emoji: "🖥" },
  [ComputerEmojis.PRINTER]: { name: "Printer", unicode: "U+1F5A8", emoji: "🖨" },
  [ComputerEmojis.KEYBOARD]: { name: "Keyboard", unicode: "U+2328", emoji: "⌨" },
  [ComputerEmojis.MOUSE]: { name: "Mouse", unicode: "U+1F5B1", emoji: "🖱" },
  [ComputerEmojis.TRACKBALL]: { name: "Trackball", unicode: "U+1F5B2", emoji: "🖲" },
  [ComputerEmojis.COMPUTER_DISK]: { name: "Computer disk", unicode: "U+1F4BD", emoji: "💽" },
  [ComputerEmojis.FLOPPY_DISK]: { name: "Floppy disk", unicode: "U+1F4BE", emoji: "💾" },
  [ComputerEmojis.OPTICAL_DISK]: { name: "Optical disk", unicode: "U+1F4BF", emoji: "💿" },
  [ComputerEmojis.DVD]: { name: "DVD", unicode: "U+1F4C0", emoji: "📀" },
  [ComputerEmojis.ABACUS]: { name: "Abacus", unicode: "U+1F9EE", emoji: "🧮" },
}
