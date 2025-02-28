import { type EmojiDefinition } from "./types";

export enum SoundEmojis {
  MUTED_SPEAKER = "muted_speaker",
  LOW_VOLUME_SPEAKER = "low_volume_speaker",
  MID_VOLUME_SPEAKER = "mid_volume_speaker",
  HIGH_VOLUME_SPEAKER = "high_volume_speaker",
  LOUDSPEAKER = "loudspeaker",
  MEGAPHONE = "megaphone",
  POSTAL_HORN = "postal_horn",
  BELL = "bell",
  BELL_WITH_SLASH = "bell_with_slash",
  MUSICAL_SCORE = "musical_score",
  MUSICAL_NOTE = "musical_note",
  MUSICAL_NOTES = "musical_notes",
  STUDIO_MICROPHONE = "studio_microphone",
  LEVEL_SLIDER = "level_slider",
  CONTROL_KNOBS = "control_knobs",
  MICROPHONE = "microphone",
  HEADPHONE = "headphone",
  RADIO = "radio",
}

export const soundEmojis: Record<SoundEmojis, EmojiDefinition> = {
  [SoundEmojis.MUTED_SPEAKER]: { name: "Muted speaker", unicode: "U+1F507", emoji: "🔇" },
  [SoundEmojis.LOW_VOLUME_SPEAKER]: { name: "Low volume speaker", unicode: "U+1F508", emoji: "🔈" },
  [SoundEmojis.MID_VOLUME_SPEAKER]: { name: "Mid volume speaker", unicode: "U+1F509", emoji: "🔉" },
  [SoundEmojis.HIGH_VOLUME_SPEAKER]: { name: "High volume speaker", unicode: "U+1F50A", emoji: "🔊" },
  [SoundEmojis.LOUDSPEAKER]: { name: "Loudspeaker", unicode: "U+1F4E2", emoji: "📢" },
  [SoundEmojis.MEGAPHONE]: { name: "Megaphone", unicode: "U+1F4E3", emoji: "📣" },
  [SoundEmojis.POSTAL_HORN]: { name: "Postal horn", unicode: "U+1F4EF", emoji: "📯" },
  [SoundEmojis.BELL]: { name: "Bell", unicode: "U+1F514", emoji: "🔔" },
  [SoundEmojis.BELL_WITH_SLASH]: { name: "Bell with slash", unicode: "U+1F515", emoji: "🔕" },
  [SoundEmojis.MUSICAL_SCORE]: { name: "Musical score", unicode: "U+1F3BC", emoji: "🎼" },
  [SoundEmojis.MUSICAL_NOTE]: { name: "Musical note", unicode: "U+1F3B5", emoji: "🎵" },
  [SoundEmojis.MUSICAL_NOTES]: { name: "Musical notes", unicode: "U+1F3B6", emoji: "🎶" },
  [SoundEmojis.STUDIO_MICROPHONE]: { name: "Studio microphone", unicode: "U+1F399", emoji: "🎙" },
  [SoundEmojis.LEVEL_SLIDER]: { name: "Level slider", unicode: "U+1F39A", emoji: "🎚" },
  [SoundEmojis.CONTROL_KNOBS]: { name: "Control knobs", unicode: "U+1F39B", emoji: "🎛" },
  [SoundEmojis.MICROPHONE]: { name: "Microphone", unicode: "U+1F3A4", emoji: "🎤" },
  [SoundEmojis.HEADPHONE]: { name: "Headphone", unicode: "U+1F3A7", emoji: "🎧" },
  [SoundEmojis.RADIO]: { name: "Radio", unicode: "U+1F4FB", emoji: "📻" },
}
