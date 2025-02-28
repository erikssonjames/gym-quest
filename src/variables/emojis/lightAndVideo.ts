import { type EmojiDefinition } from "./types";

export enum LightAndVideoEmojis {
  MOVIE_CAMERA = "movie_camera",
  FILM_FRAMES = "film_frames",
  FILM_PROJECTOR = "film_projector",
  CLAPPER_BOARD = "clapper_board",
  TELEVISION = "television",
  CAMERA = "camera",
  CAMERA_WITH_FLASH = "camera_with_flash",
  VIDEO_CAMERA = "video_camera",
  VIDEO_CASSETTE = "video_cassette",
  MAGNIFYING_GLASS_TILTED_LEFT = "magnifying_glass_tilted_left",
  MAGNIFYING_GLASS_TILTED_RIGHT = "magnifying_glass_tilted_right",
  CANDLE = "candle",
  LIGHT_BULB = "light_bulb",
  FLASHLIGHT = "flashlight",
  RED_PEPPER_LANTERN = "red_pepper_lantern",
  DIYA_LAMP = "diya_lamp",
}

export const lightAndVideoEmojis: Record<LightAndVideoEmojis, EmojiDefinition> = {
  [LightAndVideoEmojis.MOVIE_CAMERA]: { name: "Movie camera", unicode: "U+1F3A5", emoji: "🎥" },
  [LightAndVideoEmojis.FILM_FRAMES]: { name: "Film frames", unicode: "U+1F39E", emoji: "🎞" },
  [LightAndVideoEmojis.FILM_PROJECTOR]: { name: "Film Projector", unicode: "U+1F4FD", emoji: "📽" },
  [LightAndVideoEmojis.CLAPPER_BOARD]: { name: "Clapper board", unicode: "U+1F3AC", emoji: "🎬" },
  [LightAndVideoEmojis.TELEVISION]: { name: "Television", unicode: "U+1F4FA", emoji: "📺" },
  [LightAndVideoEmojis.CAMERA]: { name: "Camera", unicode: "U+1F4F7", emoji: "📷" },
  [LightAndVideoEmojis.CAMERA_WITH_FLASH]: { name: "Camera with flash", unicode: "U+1F4F8", emoji: "📸" },
  [LightAndVideoEmojis.VIDEO_CAMERA]: { name: "Video camera", unicode: "U+1F4F9", emoji: "📹" },
  [LightAndVideoEmojis.VIDEO_CASSETTE]: { name: "Video cassette", unicode: "U+1F4FC", emoji: "📼" },
  [LightAndVideoEmojis.MAGNIFYING_GLASS_TILTED_LEFT]: { name: "Magnifying glass tilted left", unicode: "U+1F50D", emoji: "🔍" },
  [LightAndVideoEmojis.MAGNIFYING_GLASS_TILTED_RIGHT]: { name: "Magnifying glass tilted right", unicode: "U+1F50E", emoji: "🔎" },
  [LightAndVideoEmojis.CANDLE]: { name: "Candle", unicode: "U+1F56F", emoji: "🕯" },
  [LightAndVideoEmojis.LIGHT_BULB]: { name: "Light bulb", unicode: "U+1F4A1", emoji: "💡" },
  [LightAndVideoEmojis.FLASHLIGHT]: { name: "Flashlight", unicode: "U+1F526", emoji: "🔦" },
  [LightAndVideoEmojis.RED_PEPPER_LANTERN]: { name: "Red pepper lantern", unicode: "U+1F3EE", emoji: "🏮" },
  [LightAndVideoEmojis.DIYA_LAMP]: { name: "Diya lamp", unicode: "U+1FA94", emoji: "🪔" },
}
