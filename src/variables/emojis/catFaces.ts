import { type EmojiDefinition } from "./types";

export enum CatFacesEmojis {
  GRINNING_CAT = "grinning_cat",
  GRINNING_CAT_WITH_SMILING_EYES = "grinning_cat_with_smiling_eyes",
  GRINNING_CAT_WITH_TEARS = "grinning_cat_with_tears",
  SMILING_CAT_WITH_HEART_EYES = "smiling_cat_with_heart_eyes",
  CAT_WITH_WRY_SMILE = "cat_with_wry_smile",
  KISSING_CAT = "kissing_cat",
  WEARY_CAT = "weary_cat",
  CRYING_CAT = "crying_cat",
  POUTING_CAT = "pouting_cat",
}

export const catFacesEmojis: Record<CatFacesEmojis, EmojiDefinition> = {
  [CatFacesEmojis.GRINNING_CAT]: {
    name: "Grinnig cat",
    unicode: "U+1F63A",
    emoji: "😺",
  },
  [CatFacesEmojis.GRINNING_CAT_WITH_SMILING_EYES]: {
    name: "Grinning cat with smiling eyes",
    unicode: "U+1F638",
    emoji: "😸",
  },
  [CatFacesEmojis.GRINNING_CAT_WITH_TEARS]: {
    name: "Grinning cat with tears",
    unicode: "U+1F639",
    emoji: "😹",
  },
  [CatFacesEmojis.SMILING_CAT_WITH_HEART_EYES]: {
    name: "Smiling cat with heart eyes",
    unicode: "U+1F63B",
    emoji: "😻",
  },
  [CatFacesEmojis.CAT_WITH_WRY_SMILE]: {
    name: "Cat with wry smile",
    unicode: "U+1F63C",
    emoji: "😼",
  },
  [CatFacesEmojis.KISSING_CAT]: {
    name: "Kissing cat",
    unicode: "U+1F63D",
    emoji: "😽",
  },
  [CatFacesEmojis.WEARY_CAT]: {
    name: "Weary cat",
    unicode: "U+1F640",
    emoji: "🙀",
  },
  [CatFacesEmojis.CRYING_CAT]: {
    name: "Crying cat",
    unicode: "U+1F63F",
    emoji: "😿",
  },
  [CatFacesEmojis.POUTING_CAT]: {
    name: "Pouting cat",
    unicode: "U+1F63E",
    emoji: "😾",
  },
};
