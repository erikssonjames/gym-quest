import { type EmojiDefinition } from "./types";

export enum ActivityEmojis {
  JACK_O_LANTERN = "jack_o_lantern",
  CHRISTMAS_TREE = "christmas_tree",
  FIREWORKS = "fireworks",
  SPARKLER = "sparkler",
  FIRECRACKER = "firecracker",
  SPARKLES = "sparkles",
  BALLOON = "baloon",
  PARTY_POPPER = "party_popper",
  CONFETTI_BALL = "confetti_ball",
  TANABATA_TREE = "tanabata_tree",
  PINE_DECORATION = "pine_decoration",
  JAPANESE_DOLLS = "japanese_dolls",
  CARP_STREAMER = "carp_streamer",
  MOON_VIEWING_CEREMONY = "moon_viewing_ceremony",
  RED_ENVELOPE = "red_envelope",
  RIBBON = "ribbon",
  WRAPPED_GIFT = "wrapped_gift",
  REMINDER_RIBBON = "reminder_ribbon",
  ADMISSION_TICKET = "admission_ticket",
  TICKET = "ticket",
}

export const activityEmojis: Record<ActivityEmojis, EmojiDefinition> = {
  [ActivityEmojis.JACK_O_LANTERN]: { name: "Jack-o-lantern", unicode: "U+1F383", emoji: "🎃" },
  [ActivityEmojis.CHRISTMAS_TREE]: { name: "Christmas tree", unicode: "U+1F384", emoji: "🎄" },
  [ActivityEmojis.FIREWORKS]: { name: "Fireworks", unicode: "U+1F386", emoji: "🎆" },
  [ActivityEmojis.SPARKLER]: { name: "Sparkler", unicode: "U+1F387", emoji: "🎇" },
  [ActivityEmojis.FIRECRACKER]: { name: "Firecracker", unicode: "U+1F9E8", emoji: "🧨" },
  [ActivityEmojis.SPARKLES]: { name: "Sparkles", unicode: "U+2728", emoji: "✨" },
  [ActivityEmojis.BALLOON]: { name: "Baloon", unicode: "U+1F388", emoji: "🎈" },
  [ActivityEmojis.PARTY_POPPER]: { name: "Party popper", unicode: "U+1F389", emoji: "🎉" },
  [ActivityEmojis.CONFETTI_BALL]: { name: "Confetti ball", unicode: "U+1F38A", emoji: "🎊" },
  [ActivityEmojis.TANABATA_TREE]: { name: "Tanabata tree", unicode: "U+1F38B", emoji: "🎋" },
  [ActivityEmojis.PINE_DECORATION]: { name: "Pine decoration", unicode: "U+1F38D", emoji: "🎍" },
  [ActivityEmojis.JAPANESE_DOLLS]: { name: "Japanese dolls", unicode: "U+1F38E", emoji: "🎎" },
  [ActivityEmojis.CARP_STREAMER]: { name: "Carp streamer", unicode: "U+1F38F", emoji: "🎏" },
  [ActivityEmojis.MOON_VIEWING_CEREMONY]: { name: "Moon viewing ceremony", unicode: "U+1F391", emoji: "🎑" },
  [ActivityEmojis.RED_ENVELOPE]: { name: "Red envelope", unicode: "U+1F9E7", emoji: "🧧" },
  [ActivityEmojis.RIBBON]: { name: "Ribbon", unicode: "U+1F380", emoji: "🎀" },
  [ActivityEmojis.WRAPPED_GIFT]: { name: "Wrapped gift", unicode: "U+1F381", emoji: "🎁" },
  [ActivityEmojis.REMINDER_RIBBON]: { name: "Reminder ribbon", unicode: "U+1F397", emoji: "🎗" },
  [ActivityEmojis.ADMISSION_TICKET]: { name: "Admission ticket", unicode: "U+1F39F", emoji: "🎟" },
  [ActivityEmojis.TICKET]: { name: "Ticket", unicode: "U+1F3AB", emoji: "🎫" },
}
