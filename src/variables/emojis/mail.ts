import type { EmojiDefinition } from "./types";

export enum MailEmojis {
  ENVELOPE = "envelope",
  EMAIL = "email",
  ENVELOPE_WITH_ARROW = "envelope_with_arrow",
  OUTBOX_TRAY = "outbox_tray",
  INBOX_TRAY = "inbox_tray",
  PACKAGE = "package",
  CLOSED_MAILBOX_WITH_RAISED_FLAG = "closed_mailbox_with_raised_flag",
  CLOSED_MAILBOX_WITH_LOWERED_FLAG = "closed_mailbox_with_lowered_flag",
  OPEN_MAILBOX_WITH_RAISED_FLAG = "open_mailbox_with_raised_flag",
  OPEN_MAILBOX_WITH_LOWERED_FLAG = "open_mailbox_with_lowered_flag",
  POSTBOX = "postbox",
  BALLOT_BOX_WITH_BALLOT = "ballot_box_with_ballot",
}

export const mailEmojis: Record<MailEmojis, EmojiDefinition> = {
  [MailEmojis.ENVELOPE]: {
    name: "Envelope",
    unicode: "U+2709",
    emoji: "✉",
  },
  [MailEmojis.EMAIL]: {
    name: "e-mail",
    unicode: "U+1F4E7",
    emoji: "📧",
  },
  [MailEmojis.ENVELOPE_WITH_ARROW]: {
    name: "Envelope with arrow",
    unicode: "U+1F4E9",
    emoji: "📩",
  },
  [MailEmojis.OUTBOX_TRAY]: {
    name: "Outbox tray",
    unicode: "U+1F4E4",
    emoji: "📤",
  },
  [MailEmojis.INBOX_TRAY]: {
    name: "Inbox tray",
    unicode: "U+1F4E5",
    emoji: "📥",
  },
  [MailEmojis.PACKAGE]: {
    name: "Package",
    unicode: "U+1F4E6",
    emoji: "📦",
  },
  [MailEmojis.CLOSED_MAILBOX_WITH_RAISED_FLAG]: {
    name: "Closed mailbox with raised flag",
    unicode: "U+1F4EB",
    emoji: "📫",
  },
  [MailEmojis.CLOSED_MAILBOX_WITH_LOWERED_FLAG]: {
    name: "Closed mailbox with lowered flag",
    unicode: "U+1F4EA",
    emoji: "📪",
  },
  [MailEmojis.OPEN_MAILBOX_WITH_RAISED_FLAG]: {
    name: "Open mailbox with raised flag",
    unicode: "U+1F4EC",
    emoji: "📬",
  },
  [MailEmojis.OPEN_MAILBOX_WITH_LOWERED_FLAG]: {
    name: "Open mailbox with lowered flag",
    unicode: "U+1F4ED",
    emoji: "📭",
  },
  [MailEmojis.POSTBOX]: {
    name: "Postbox",
    unicode: "U+1F4EE",
    emoji: "📮",
  },
  [MailEmojis.BALLOT_BOX_WITH_BALLOT]: {
    name: "Ballot box with ballot",
    unicode: "U+1F5F3",
    emoji: "🗳",
  },
}
