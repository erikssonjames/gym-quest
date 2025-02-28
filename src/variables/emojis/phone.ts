import { EmojiDefinition } from "./types";

export enum PhoneEmojis {
  MOBILE_PHONE = "mobile_phone",
  MOBILE_PHONE_WITH_ARROW = "mobile_phone_with_arrow",
  TELEPHONE = "telephone",
  TELEPHONE_RECEIVER = "telephone_receiver",
  PAGER = "pager",
  FAX_MACHINE = "fax_machine",
}

export const phoneEmojis: Record<PhoneEmojis, EmojiDefinition> = {
  [PhoneEmojis.MOBILE_PHONE]: { name: "Mobile phone", unicode: "U+1F4F1", emoji: "📱" },
  [PhoneEmojis.MOBILE_PHONE_WITH_ARROW]: { name: "Mobile phone with arrow", unicode: "U+1F4F2", emoji: "📲" },
  [PhoneEmojis.TELEPHONE]: { name: "Telephone", unicode: "U+260E", emoji: "☎" },
  [PhoneEmojis.TELEPHONE_RECEIVER]: { name: "Telephone receiver", unicode: "U+1F4DE", emoji: "📞" },
  [PhoneEmojis.PAGER]: { name: "Pager", unicode: "U+1F4DF", emoji: "📟" },
  [PhoneEmojis.FAX_MACHINE]: { name: "Fax machine", unicode: "U+1F4E0", emoji: "📠" },
}
