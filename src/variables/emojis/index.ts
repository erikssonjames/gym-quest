// index.ts

import { smileyFaceEmojis } from "./smileyFace"
import { emotionalFaceEmojis } from "./emotionalFaces"
import { facesWithTongueEmojis } from "./facesWithTongue"
import { facesWithHandsEmojis } from "./facesWithHands"
import { neutralFacesEmojis } from "./neutralFaces"
import { sleepyFacesEmojis } from "./sleepyFaces"
import { sickFacesEmojis } from "./sickFaces"
import { concernedFacesEmojis } from "./concernedFaces"
import { negativeFacesEmojis } from "./negativeFaces"
import { costumeFacesEmojis } from "./costumeFaces"
import { multiUnicodeFacesEmojis } from "./facesMultiUnicode"
import { catFacesEmojis } from "./catFaces"
import { monkeyFacesEmojis } from "./monkeyFaces"
import { emotionEmojis } from "./emotion"
import { handsAndOtherBodyPartsEmojis } from "./handsAndOtherBodyParts"
import { personEmojis } from "./person"
import { familyEmojis } from "./family"
import { animalsAndNatureEmojis } from "./animalsAndNature"
import { foodAndDrinksEmojis } from "./foodAndDrinks"
import { travelAndPlacesEmojis } from "./travelAndPlaces"
import { transportEmojis } from "./transport"
import { timeEmojis } from "./time"
import { skyAndWeatherEmojis } from "./skyAndWeather"
import { activityEmojis } from "./activity"
import { awardMedalsEmojis } from "./awardMedals"
import { sportEmojis } from "./sport"
import { gamesEmojis } from "./games"
import { artsAndCraftsEmojis } from "./artsAndCrafts"
import { clothingObjectsEmojis } from "./clothingObjects"
import { soundEmojis } from "./sound"
import { musicalInstrumentsEmojis } from "./musicalInstruments"
import { phoneEmojis } from "./phone"
import { computerEmojis } from "./computer"
import { lightAndVideoEmojis } from "./lightAndVideo"
import { bookAndPaperEmojis } from "./bookAndPaper"
import { mailEmojis } from "./mail"
import { writingEmojis } from "./writing"
import { officeEmojis } from "./office"
import { lockEmojis } from "./lock"
import { toolsEmojis } from "./tools"
import { scienceEmojis } from "./science"
import { medicalEmojis } from "./medical"
import { householdEmojis } from "./household"
import { otherObjectsEmojis } from "./otherObjects"
import { symbolsEmojis } from "./symbols"
import { arrowsEmojis } from "./arrows"
import { keycapEmojis } from "./keycap"
import { alphanumericSymbolsEmojis } from "./alphanumericSymbols"
import { japaneseButtonsEmojis } from "./japaneseButtons"
import { geometricEmojis } from "./geometric"
import { flagsEmojis } from "./flags"
import { countryFlagsEmojis } from "./countryFlags"

/**
 * Exporting all imports
 */
export {
  smileyFaceEmojis,
  emotionalFaceEmojis,
  facesWithTongueEmojis,
  facesWithHandsEmojis,
  neutralFacesEmojis,
  sleepyFacesEmojis,
  sickFacesEmojis,
  concernedFacesEmojis,
  negativeFacesEmojis,
  costumeFacesEmojis,
  multiUnicodeFacesEmojis,
  catFacesEmojis,
  monkeyFacesEmojis,
  emotionEmojis,
  handsAndOtherBodyPartsEmojis,
  personEmojis,
  familyEmojis,
  animalsAndNatureEmojis,
  foodAndDrinksEmojis,
  travelAndPlacesEmojis,
  transportEmojis,
  timeEmojis,
  skyAndWeatherEmojis,
  activityEmojis,
  awardMedalsEmojis,
  sportEmojis,
  gamesEmojis,
  artsAndCraftsEmojis,
  clothingObjectsEmojis,
  soundEmojis,
  musicalInstrumentsEmojis,
  phoneEmojis,
  computerEmojis,
  lightAndVideoEmojis,
  bookAndPaperEmojis,
  mailEmojis,
  writingEmojis,
  officeEmojis,
  lockEmojis,
  toolsEmojis,
  scienceEmojis,
  medicalEmojis,
  householdEmojis,
  otherObjectsEmojis,
  symbolsEmojis,
  arrowsEmojis,
  keycapEmojis,
  alphanumericSymbolsEmojis,
  japaneseButtonsEmojis,
  geometricEmojis,
  flagsEmojis,
  countryFlagsEmojis
}

/**
 * Example: Grouping them in an array. Each group's name and the array of emojis.
 * Feel free to rename or restructure as needed.
 */
export const ALL_EMOJI_GROUPS = [
  {
    groupName: "Smiley Face",
    emojis: Object.values(smileyFaceEmojis),
  },
  {
    groupName: "Emotional Faces",
    emojis: Object.values(emotionalFaceEmojis),
  },
  {
    groupName: "Faces With Tongue",
    emojis: Object.values(facesWithTongueEmojis),
  },
  {
    groupName: "Faces With Hands",
    emojis: Object.values(facesWithHandsEmojis),
  },
  {
    groupName: "Neutral Faces",
    emojis: Object.values(neutralFacesEmojis),
  },
  {
    groupName: "Sleepy Faces",
    emojis: Object.values(sleepyFacesEmojis),
  },
  {
    groupName: "Sick Faces",
    emojis: Object.values(sickFacesEmojis),
  },
  {
    groupName: "Concerned Faces",
    emojis: Object.values(concernedFacesEmojis),
  },
  {
    groupName: "Negative Faces",
    emojis: Object.values(negativeFacesEmojis),
  },
  {
    groupName: "Costume Faces",
    emojis: Object.values(costumeFacesEmojis),
  },
  {
    groupName: "Faces (Multi-Unicode)",
    emojis: Object.values(multiUnicodeFacesEmojis),
  },
  {
    groupName: "Cat Faces",
    emojis: Object.values(catFacesEmojis),
  },
  {
    groupName: "Monkey Faces",
    emojis: Object.values(monkeyFacesEmojis),
  },
  {
    groupName: "Emotion Emojis",
    emojis: Object.values(emotionEmojis),
  },
  {
    groupName: "Hands and Other Body Parts",
    emojis: Object.values(handsAndOtherBodyPartsEmojis),
  },
  {
    groupName: "Person Emojis",
    emojis: Object.values(personEmojis),
  },
  {
    groupName: "Family Emojis",
    emojis: Object.values(familyEmojis),
  },
  {
    groupName: "Animals & Nature",
    emojis: Object.values(animalsAndNatureEmojis),
  },
  {
    groupName: "Food & Drinks",
    emojis: Object.values(foodAndDrinksEmojis),
  },
  {
    groupName: "Travel & Places",
    emojis: Object.values(travelAndPlacesEmojis),
  },
  {
    groupName: "Transport",
    emojis: Object.values(transportEmojis),
  },
  {
    groupName: "Time",
    emojis: Object.values(timeEmojis),
  },
  {
    groupName: "Sky & Weather",
    emojis: Object.values(skyAndWeatherEmojis),
  },
  {
    groupName: "Activity",
    emojis: Object.values(activityEmojis),
  },
  {
    groupName: "Award Medals",
    emojis: Object.values(awardMedalsEmojis),
  },
  {
    groupName: "Sport",
    emojis: Object.values(sportEmojis),
  },
  {
    groupName: "Games",
    emojis: Object.values(gamesEmojis),
  },
  {
    groupName: "Arts & Crafts",
    emojis: Object.values(artsAndCraftsEmojis),
  },
  {
    groupName: "Clothing Objects",
    emojis: Object.values(clothingObjectsEmojis),
  },
  {
    groupName: "Sound",
    emojis: Object.values(soundEmojis),
  },
  {
    groupName: "Musical Instruments",
    emojis: Object.values(musicalInstrumentsEmojis),
  },
  {
    groupName: "Phone",
    emojis: Object.values(phoneEmojis),
  },
  {
    groupName: "Computer",
    emojis: Object.values(computerEmojis),
  },
  {
    groupName: "Light & Video",
    emojis: Object.values(lightAndVideoEmojis),
  },
  {
    groupName: "Book & Paper",
    emojis: Object.values(bookAndPaperEmojis),
  },
  {
    groupName: "Mail",
    emojis: Object.values(mailEmojis),
  },
  {
    groupName: "Writing",
    emojis: Object.values(writingEmojis),
  },
  {
    groupName: "Office",
    emojis: Object.values(officeEmojis),
  },
  {
    groupName: "Lock",
    emojis: Object.values(lockEmojis),
  },
  {
    groupName: "Tools",
    emojis: Object.values(toolsEmojis),
  },
  {
    groupName: "Science",
    emojis: Object.values(scienceEmojis),
  },
  {
    groupName: "Medical",
    emojis: Object.values(medicalEmojis),
  },
  {
    groupName: "Household",
    emojis: Object.values(householdEmojis),
  },
  {
    groupName: "Other Objects",
    emojis: Object.values(otherObjectsEmojis),
  },
  {
    groupName: "Symbols",
    emojis: Object.values(symbolsEmojis),
  },
  {
    groupName: "Arrows",
    emojis: Object.values(arrowsEmojis),
  },
  {
    groupName: "Keycap",
    emojis: Object.values(keycapEmojis),
  },
  {
    groupName: "Alphanumeric Symbols",
    emojis: Object.values(alphanumericSymbolsEmojis),
  },
  {
    groupName: "Japanese Buttons",
    emojis: Object.values(japaneseButtonsEmojis),
  },
  {
    groupName: "Geometric",
    emojis: Object.values(geometricEmojis),
  },
  {
    groupName: "Flags",
    emojis: Object.values(flagsEmojis),
  },
  {
    groupName: "Country Flags",
    emojis: Object.values(countryFlagsEmojis),
  },
] as const