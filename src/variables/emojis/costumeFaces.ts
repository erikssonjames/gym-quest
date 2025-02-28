import { type EmojiDefinition } from "./types";

export enum CostumeFacesEmojis {
  PILE_OF_POO = "pile_of_poo",
  CLOWN = "clown",
  OGRE = "ogre",
  GOBLIN = "goblin",
  GHOST = "ghost",
  ALIEN = "alien",
  ALIEN_MONSTER = "alien_monster",
  ROBOT = "robot",
}

export const costumeFacesEmojis: Record<CostumeFacesEmojis, EmojiDefinition> = {
  [CostumeFacesEmojis.PILE_OF_POO]: {
    name: "Pile of poo",
    unicode: "U+1F4A9",
    emoji: "💩",
  },
  [CostumeFacesEmojis.CLOWN]: {
    name: "Clown",
    unicode: "U+1F921",
    emoji: "🤡",
  },
  [CostumeFacesEmojis.OGRE]: {
    name: "Ogre",
    unicode: "U+1F479",
    emoji: "👹",
  },
  [CostumeFacesEmojis.GOBLIN]: {
    name: "Goblin",
    unicode: "U+1F47A",
    emoji: "👺",
  },
  [CostumeFacesEmojis.GHOST]: {
    name: "Ghost",
    unicode: "U+1F47B",
    emoji: "👻",
  },
  [CostumeFacesEmojis.ALIEN]: {
    name: "Alien",
    unicode: "U+1F47D",
    emoji: "👽",
  },
  [CostumeFacesEmojis.ALIEN_MONSTER]: {
    name: "Alien monster",
    unicode: "U+1F47E",
    emoji: "👾",
  },
  [CostumeFacesEmojis.ROBOT]: {
    name: "Robot",
    unicode: "U+1F916",
    emoji: "🤖",
  },
};
