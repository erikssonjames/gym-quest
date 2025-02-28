import { EmojiDefinition } from "./types";

export enum PersonEmojis {
  PERSON = "person",
  BABY = "baby",
  CHILD = "child",
  BOY = "boy",
  GIRL = "girl",
  PERSON_WITH_BLONDE_HAIR = "person_with_blonde_hair",
  MAN = "man",
  BEARDED_PERSON = "bearded_person",
  BEARDED_MAN = "bearded_man",
  BEARDED_WOMAN = "bearded_woman",
  MAN_WITH_RED_HAIR = "man_with_red_hair",
  MAN_WITH_CURLY_HAIR = "man_with_curly_hair",
  MAN_WITH_WHITE_HAIR = "man_with_white_hair",
  BALD_MAN = "bald_man",
  WOMAN = "woman",
  WOMAN_WITH_RED_HAIR = "woman_with_red_hair",
  WOMAN_WITH_CURLY_HAIR = "woman_with_curly_hair",
  WOMAN_WITH_WHITE_HAIR = "woman_with_white_hair",
  BALD_WOMAN = "bald_woman",
  WOMAN_WITH_BLONDE_HAIR = "woman_with_blonde_hair",
  MAN_WITH_BLONDE_HAIR = "man_with_blonde_hair",
  OLD_PERSON = "old_person",
  OLD_MAN = "old_man",
  OLD_WOMAN = "old_woman",
  PERSON_FROWNING = "person_frowning",
  MAN_FROWNING = "man_frowning",
  WOMAN_FROWNING = "woman_frowning",
  MAN_POUTING = "man_pouting",
  WOMAN_POUTING = "woman_pouting",
  MAN_GESTURING_NO = "man_gesturing_no",
  WOMAN_GESTURING_NO = "woman_gesturing_no",
  MAN_GESTURING_OK = "man_gesturing_ok",
  WOMAN_GESTURING_OK = "woman_gesturing_ok",
  MAN_TIPPING_HAND = "man_tipping_hand",
  WOMAN_TIPPING_HAND = "woman_tipping_hand",
  MAN_RAISING_HAND = "man_raising_hand",
  WOMAN_RAISING_HAND = "woman_raising_hand",
  DEAF_MAN = "deaf_man",
  DEAF_WOMAN = "deaf_woman",
  MAN_BOWING = "man_bowing",
  WOMAN_BOWING = "woman_bowing",
  MAN_FACEPALMING = "man_facepalming",
  WOMAN_FACEPALMING = "woman_facepalming",
  MAN_SHRUGGING = "man_shrugging",
  WOMAN_SHRUGGING = "woman_shrugging",
  HEALTH_WORKER = "health_worker",
  MAN_HEALTH_WORKER = "man_health_worker",
  WOMAN_HEALTH_WORKER = "woman_health_worker",
  STUDENT = "student",
  MAN_STUDENT = "man_student",
  WOMAN_STUDENT = "woman_student",
  TEACHER = "teacher",
  MAN_TEACHER = "man_teacher",
  WOMAN_TEACHER = "woman_teacher",
  JUDGE = "judge",
  WOMAN_JUDGE = "woman_judge",
  FARMER = "farmer",
  MAN_FARMER = "man_farmer",
  WOMAN_FARMER = "woman_farmer",
  COOK = "cook",
  MAN_COOK = "man_cook",
  WOMAN_COOK = "woman_cook",
  MECHANIC = "mechanic",
  MAN_MECHANIC = "man_mechanic",
  WOMAN_MECHANIC = "woman_mechanic",
  FACTORY_WORKER = "factory_worker",
  MAN_FACTORY_WORKER = "man_factory_worker",
  WOMAN_FACTORY_WORKER = "woman_factory_worker",
  OFFICE_WORKER = "office_worker",
  MAN_OFFICE_WORKER = "man_office_worker",
  WOMAN_OFFICE_WORKER = "woman_office_worker",
  SCIENTIST = "scientist",
  MAN_SCIENTIST = "man_scientist",
  WOMAN_SCIENTIST = "woman_scientist",
  TECHNOLOGIST = "technologist",
  MAN_TECHNOLOGIST = "man_technologist",
  WOMAN_TECHNOLOGIST = "woman_technologist",
  SINGER = "singer",
  MAN_SINGER = "man_singer",
  WOMAN_SINGER = "woman_singer",
  ARTIST = "artist",
  MAN_ARTIST = "man_artist",
  WOMAN_ARTIST = "woman_artist",
  PILOT = "pilot",
  MAN_PILOT = "man_pilot",
  WOMAN_PILOT = "woman_pilot",
  ASTRONAUT = "astronaut",
  MAN_ASTRONAUT = "man_astronaut",
  WOMAN_ASTRONAUT = "woman_astronaut",
  FIREFIGHTER = "firefighter",
  MAN_FIREFIGHTER = "man_firefighter",
  WOMAN_FIREFIGHTER = "woman_firefighter",
  MAN_POLICE = "man_police",
  WOMAN_POLICE = "woman_police",
  MAN_DETECTIVE = "man_detective",
  WOMAN_DETECTIVE = "woman_detective",
  MAN_GUARD = "man_guard",
  WOMAN_GUARD = "woman_guard",
  MAN_CONSTRUCTION_WORKER = "man_construction_worker",
  WOMAN_CONSTRUCTION_WORKER = "woman_construction_worker",
  MAN_WEARING_TURBAN = "man_wearing_turban",
  WOMAN_WEARING_TURBAN = "woman_wearing_turban",
  MAN_IN_TUXEDO = "man_in_tuxedo",
  WOMAN_IN_TUXEDO = "woman_in_tuxedo",
  MAN_WITH_VEIL = "man_with_veil",
  WOMAN_WITH_VEIL = "woman_with_veil",
  PERSON_FEEDING_BABY = "person_feeding_baby",
  WOMAN_FEEDING_BABY = "woman_feeding_baby",
  MAN_FEEDING_BABY = "man_feeding_baby",
  MX_CLAUS = "mx_claus",
  MAN_SUPERHERO = "man_superhero",
  WOMAN_SUPERHERO = "woman_superhero",
  MAN_SUPERVILLAIN = "man_supervillain",
  WOMAN_SUPERVILLAIN = "woman_supervillain",
  MAN_MAGE = "man_mage",
  WOMAN_MAGE = "woman_mage",
  MAN_FAIRY = "man_fairy",
  WOMAN_FAIRY = "woman_fairy",
  MAN_VAMPIRE = "man_vampire",
  WOMAN_VAMPIRE = "woman_vampire",
  MERMAN = "merman",
  MERMAID = "mermaid",
  MAN_ELF = "man_elf",
  WOMAN_ELF = "woman_elf",
  MAN_GENIE = "man_genie",
  WOMAN_GENIE = "woman_genie",
  MAN_ZOMBIE = "man_zombie",
  WOMAN_ZOMBIE = "woman_zombie",
  MAN_GETTING_MASSAGE = "man_getting_massage",
  WOMAN_GETTING_MASSAGE = "woman_getting_massage",
  MAN_GETTING_HAIRCUT = "man_getting_haircut",
  WOMAN_GETTING_HAIRCUT = "woman_getting_haircut",
  MAN_WALKING = "man_walking",
  WOMAN_WALKING = "woman_walking",
  MAN_STANDING = "man_standing",
  WOMAN_STANDING = "woman_standing",
  MAN_KNEELING = "man_kneeling",
  WOMAN_KNEELING = "woman_kneeling",
  PERSON_WITH_WHITE_CANE = "person_with_white_cane",
  MAN_WITH_WHITE_CANE = "man_with_white_cane",
  WOMAN_WITH_WHITE_CANE = "woman_with_white_cane",
  PERSON_WITH_MOTORIZED_WHEELCHAIR = "person_with_motorized_wheelchair",
  MAN_IN_MOTORIZED_WHEELCHAIR = "man_in_motorized_wheelchair",
  WOMAN_IN_MOTORIZED_WHEELCHAIR = "woman_in_motorized_wheelchair",
  PERSON_IN_MANUAL_WHEELCHAIR = "person_in_manual_wheelchair",
  MAN_IN_MANUAL_WHEELCHAIR = "man_in_manual_wheelchair",
  WOMAN_IN_MANUAL_WHEELCHAIR = "woman_in_manual_wheelchair",
  MAN_RUNNING = "man_running",
  WOMAN_RUNNING = "woman_running",
  MEN_WITH_BUNNY_EARS = "men_with_bunny_ears",
  WOMEN_WITH_BUNNY_EARS = "women_with_bunny_ears",
  MAN_IN_STEAMY_ROOM = "man_in_steamy_room",
  WOMAN_IN_STEAMY_ROOM = "woman_in_steamy_room",
  MAN_CLIMBING = "man_climbing",
  WOMAN_CLIMBING = "woman_climbing",
  MAN_GOLFING = "man_golfing",
  WOMAN_GOLFING = "woman_golfing",
  PERSON_CLIMBING = "person_climbing",
  MAN_CLIMBING_2 = "man_climbing_2",
  WOMAN_CLIMBING_2 = "woman_climbing_2",
  PERSON_FENCING = "person_fencing",
  HORSE_RACING = "horse_racing",
  SKIER = "skier",
  SNOWBOARDER = "snowboarder",
  PERSON_PLAYING_GOLF = "person_playing_golf",
  MAN_PLAYING_GOLF = "man_playing_golf",
  WOMAN_PLAYING_GOLF = "woman_playing_golf",
  PERSON_SURFING = "person_surfing",
  MAN_SURFING = "man_surfing",
  WOMAN_SURFING = "woman_surfing",
  PERSON_ROWING_BOAT = "person_rowing_boat",
  MAN_ROWING_BOAT = "man_rowing_boat",
  WOMAN_ROWING_BOAT = "woman_rowing_boat",
  PERSON_SWIMMING = "person_swimming",
  MAN_SWIMMING = "man_swimming",
  WOMAN_SWIMMING = "woman_swimming",
  PERSON_BOUNCING_BALL = "person_bouncing_ball",
  MAN_BOUNCING_BALL = "man_bouncing_ball",
  WOMAN_BOUNCING_BALL = "woman_bouncing_ball",
  PERSON_LIFTING_WEIGHT = "person_lifting_weight",
  MAN_LIFTING_WEIGHTS = "man_lifting_weights",
  WOMAN_LIFTING_WEIGHTS = "woman_lifting_weights",
  PERSON_CYCLING = "person_cycling",
  MAN_CYCLING = "man_cycling",
  WOMAN_CYCLING = "woman_cycling",
  PERSON_MOUNTAIN_BIKING = "person_mountain_biking",
  MAN_MOUNTAIN_BIKING = "man_mountain_biking",
  WOMAN_MOUNTAIN_BIKING = "woman_mountain_biking",
  PERSON_CARTWHEELING = "person_cartwheeling",
  MAN_CARTWHEELING = "man_cartwheeling",
  WOMAN_CARTWHEELING = "woman_cartwheeling",
  PEOPLE_WRESTLING = "people_wrestling",
  MEN_WRESTLING = "men_wrestling",
  WOMEN_WRESTLING = "women_wrestling",
  PERSON_PLAYING_WATER_POLO = "person_playing_water_polo",
  MAN_PLAYING_WATER_POLO = "man_playing_water_polo",
  WOMAN_PLAYING_WATER_POLO = "woman_playing_water_polo",
  PERSON_PLAYING_HANDBALL = "person_playing_handball",
  MAN_PLAYING_HANDBALL = "man_playing_handball",
  WOMAN_PLAYING_HANDBALL = "woman_playing_handball",
  PERSON_JUGGLING = "person_juggling",
  MAN_JUGGLING = "man_juggling",
  WOMAN_JUGGLING = "woman_juggling",
  PERSON_LOTUS_POSITION = "person_lotus_position",
  MAN_IN_LOTUS_POSITION = "man_in_lotus_position",
  WOMAN_IN_LOTUS_POSITION = "woman_in_lotus_position",
  PERSON_BATHING = "person_bathing",
  PERSON_IN_BED = "person_in_bed",
}

export const personEmojis: Record<PersonEmojis, EmojiDefinition> = {
  [PersonEmojis.PERSON]: { name: "Person", unicode: "U+1F9D1", emoji: "🧑" },
  [PersonEmojis.BABY]: { name: "Baby", unicode: "U+1F476", emoji: "👶" },
  [PersonEmojis.CHILD]: { name: "Child", unicode: "U+1F9D2", emoji: "🧒" },
  [PersonEmojis.BOY]: { name: "Boy", unicode: "U+1F466", emoji: "👦" },
  [PersonEmojis.GIRL]: { name: "Girl", unicode: "U+1F467", emoji: "👧" },
  [PersonEmojis.PERSON_WITH_BLONDE_HAIR]: { name: "Person with blonde hair", unicode: "U+1F471", emoji: "👱" },
  [PersonEmojis.MAN]: { name: "Man", unicode: "U+1F468", emoji: "👨" },
  [PersonEmojis.BEARDED_PERSON]: { name: "Bearded person", unicode: "U+1F9D4", emoji: "🧔" },
  [PersonEmojis.BEARDED_MAN]: { name: "Bearded man", unicode: "U+1F9D4", emoji: "🧔‍♂️" },
  [PersonEmojis.BEARDED_WOMAN]: { name: "Bearded woman", unicode: "U+1F9D4", emoji: "🧔‍♀️" },
  [PersonEmojis.MAN_WITH_RED_HAIR]: { name: "Man with red hair", unicode: "U+1F468 U+200D U+1F9B0", emoji: "👨‍🦰" },
  [PersonEmojis.MAN_WITH_CURLY_HAIR]: { name: "Man with curly hair", unicode: "U+1F9B1", emoji: "👨‍🦱" },
  [PersonEmojis.MAN_WITH_WHITE_HAIR]: { name: "Man with white hair", unicode: "U+200D", emoji: "👨‍🦳" },
  [PersonEmojis.BALD_MAN]: { name: "Bald man", unicode: "U+1F468 U+200D U+1F9B2", emoji: "👨‍🦲" },
  [PersonEmojis.WOMAN]: { name: "Woman", unicode: "U+1F469", emoji: "👩" },
  [PersonEmojis.WOMAN_WITH_RED_HAIR]: { name: "Woman with red hair", unicode: "U+1F469 U+200D U+1F9B0", emoji: "👩‍🦰" },
  [PersonEmojis.WOMAN_WITH_CURLY_HAIR]: { name: "Woman with curly hair", unicode: "U+1F469 U+200D U+1F9B1", emoji: "👩‍🦱" },
  [PersonEmojis.WOMAN_WITH_WHITE_HAIR]: { name: "Woman with white hair", unicode: "U+1F469 U+200D U+1F9B3", emoji: "👩‍🦳" },
  [PersonEmojis.BALD_WOMAN]: { name: "Bald woman", unicode: "U+1F469 U+200D U+1F9B2", emoji: "👩‍🦲" },
  [PersonEmojis.WOMAN_WITH_BLONDE_HAIR]: { name: "Woman with blonde hair", unicode: "U+1F471 U+200D U+2640 U+FE0F", emoji: "👱‍♀️" },
  [PersonEmojis.MAN_WITH_BLONDE_HAIR]: { name: "Man with blonde hair", unicode: "U+1F471 U+200D U+2642 U+FE0F", emoji: "👱‍♂️" },
  [PersonEmojis.OLD_PERSON]: { name: "Old person", unicode: "U+1F9D3", emoji: "🧓" },
  [PersonEmojis.OLD_MAN]: { name: "Old man", unicode: "U+1F474", emoji: "👴" },
  [PersonEmojis.OLD_WOMAN]: { name: "Old woman", unicode: "U+1F475", emoji: "👵" },
  [PersonEmojis.PERSON_FROWNING]: { name: "Person frowning", unicode: "U+1F64D", emoji: "🙍" },
  [PersonEmojis.MAN_FROWNING]: { name: "Man frowning", unicode: "U+1F64D U+200D U+2642 U+FE0F", emoji: "🙍‍♂️" },
  [PersonEmojis.WOMAN_FROWNING]: { name: "Woman frowning", unicode: "U+1F64D U+200D U+2640 U+FE0F", emoji: "🙍‍♀️" },
  [PersonEmojis.MAN_POUTING]: { name: "Man pouting", unicode: "U+1F64E U+200D U+2642 U+FE0F", emoji: "🙎‍♂️" },
  [PersonEmojis.WOMAN_POUTING]: { name: "Woman pouting", unicode: "U+1F64E U+200D U+2640 U+FE0F", emoji: "🙎‍♀️" },
  [PersonEmojis.MAN_GESTURING_NO]: { name: "Man gesturing no", unicode: "U+1F645 U+200D U+2642 U+FE0F", emoji: "🙅‍♂️" },
  [PersonEmojis.WOMAN_GESTURING_NO]: { name: "Woman gesturing no", unicode: "U+1F645 U+200D U+2640 U+FE0F", emoji: "🙅‍♀️" },
  [PersonEmojis.MAN_GESTURING_OK]: { name: "Man gesturing ok", unicode: "U+1F646 U+200D U+2642 U+FE0F", emoji: "🙆‍♂️" },
  [PersonEmojis.WOMAN_GESTURING_OK]: { name: "Woman gesturing ok", unicode: "U+1F646 U+200D U+2640 U+FE0F", emoji: "🙆‍♀️" },
  [PersonEmojis.MAN_TIPPING_HAND]: { name: "Man tipping hand", unicode: "U+1F481 U+200D U+2642 U+FE0F", emoji: "💁‍♂️" },
  [PersonEmojis.WOMAN_TIPPING_HAND]: { name: "Woman tipping hand", unicode: "U+1F481 U+200D U+2640 U+FE0F", emoji: "💁‍♀️" },
  [PersonEmojis.MAN_RAISING_HAND]: { name: "Man raising hand", unicode: "U+1F64B U+200D U+2642 U+FE0F", emoji: "🙋‍♂️" },
  [PersonEmojis.WOMAN_RAISING_HAND]: { name: "Woman raising hand", unicode: "U+1F64B U+200D U+2640 U+FE0F", emoji: "🙋‍♀️" },
  [PersonEmojis.DEAF_MAN]: { name: "Deaf man", unicode: "U+1F9CF U+200D U+2642 U+FE0F", emoji: "🧏‍♂️" },
  [PersonEmojis.DEAF_WOMAN]: { name: "Deaf woman", unicode: "U+1F9CF U+200D U+2640 U+FE0F", emoji: "🧏‍♀️" },
  [PersonEmojis.MAN_BOWING]: { name: "Man bowing", unicode: "U+1F647 U+200D U+2642 U+FE0F", emoji: "🙇‍♂️" },
  [PersonEmojis.WOMAN_BOWING]: { name: "Woman bowing", unicode: "U+1F647 U+200D U+2640 U+FE0F", emoji: "🙇‍♀️" },
  [PersonEmojis.MAN_FACEPALMING]: { name: "Man facepalming", unicode: "U+1F926 U+200D U+2642 U+FE0F", emoji: "🤦‍♂️" },
  [PersonEmojis.WOMAN_FACEPALMING]: { name: "Woman facepalming", unicode: "U+1F926 U+200D U+2640 U+FE0F", emoji: "🤦‍♀️" },
  [PersonEmojis.MAN_SHRUGGING]: { name: "Man shrugging", unicode: "U+1F937 U+200D U+2642 U+FE0F", emoji: "🤷‍♂️" },
  [PersonEmojis.WOMAN_SHRUGGING]: { name: "Woman shrugging", unicode: "U+1F937 U+200D U+2640 U+FE0F", emoji: "🤷‍♀️" },
  [PersonEmojis.HEALTH_WORKER]: { name: "Health worker", unicode: "U+1F9D1 U+200D U+2695 U+FE0F", emoji: "🧑‍⚕️" },
  [PersonEmojis.MAN_HEALTH_WORKER]: { name: "Man health worker", unicode: "U+1F468 U+200D U+2695 U+FE0F", emoji: "👨‍⚕️" },
  [PersonEmojis.WOMAN_HEALTH_WORKER]: { name: "Woman health worker", unicode: "U+1F469 U+200D U+2695 U+FE0F", emoji: "👩‍⚕️" },
  [PersonEmojis.STUDENT]: { name: "Student", unicode: "U+1F9D1 U+200D U+1F393", emoji: "🧑‍🎓" },
  [PersonEmojis.MAN_STUDENT]: { name: "Man student", unicode: "U+1F468 U+200D U+1F393", emoji: "👨‍🎓" },
  [PersonEmojis.WOMAN_STUDENT]: { name: "Woman student", unicode: "U+1F469 U+200D U+1F393", emoji: "👩‍🎓" },
  [PersonEmojis.TEACHER]: { name: "Teacher", unicode: "U+1F9D1 U+200D U+1F3EB", emoji: "🧑‍🏫" },
  [PersonEmojis.MAN_TEACHER]: { name: "Man teacher", unicode: "U+1F468 U+200D U+1F3EB", emoji: "👨‍🏫" },
  [PersonEmojis.WOMAN_TEACHER]: { name: "Woman teacher", unicode: "U+1F469 U+200D U+1F3EB", emoji: "👩‍🏫" },
  [PersonEmojis.JUDGE]: { name: "Judge", unicode: "U+1F468 U+200D U+2696 U+FE0F", emoji: "🧑‍⚖️" },
  [PersonEmojis.WOMAN_JUDGE]: { name: "Woman judge", unicode: "U+1F469 U+200D U+2696 U+FE0F", emoji: "👩‍⚖️" },
  [PersonEmojis.FARMER]: { name: "Farmer", unicode: "U+1F9D1 U+200D U+1F33E", emoji: "🧑‍🌾" },
  [PersonEmojis.MAN_FARMER]: { name: "Man farmer", unicode: "U+1F468 U+200D U+1F33E", emoji: "👨‍🌾" },
  [PersonEmojis.WOMAN_FARMER]: { name: "Woman farmer", unicode: "U+1F469 U+200D U+1F33E", emoji: "👩‍🌾" },
  [PersonEmojis.COOK]: { name: "Cook", unicode: "U+1F9D1 U+200D U+1F373", emoji: "🧑‍🍳" },
  [PersonEmojis.MAN_COOK]: { name: "Man cook", unicode: "U+1F468 U+200D U+1F373", emoji: "👨‍🍳" },
  [PersonEmojis.WOMAN_COOK]: { name: "Woman cook", unicode: "U+1F469 U+200D U+1F373", emoji: "👩‍🍳" },
  [PersonEmojis.MECHANIC]: { name: "Mechanic", unicode: "U+1F9D1 U+200D U+1F527", emoji: "🧑‍🔧" },
  [PersonEmojis.MAN_MECHANIC]: { name: "Man mechanic", unicode: "U+1F468 U+200D U+1F527", emoji: "👨‍🔧" },
  [PersonEmojis.WOMAN_MECHANIC]: { name: "Woman mechanic", unicode: "U+1F469 U+200D U+1F527", emoji: "👩‍🔧" },
  [PersonEmojis.FACTORY_WORKER]: { name: "Factory worker", unicode: "U+1F9D1 U+200D U+1F3ED", emoji: "🧑‍🏭" },
  [PersonEmojis.MAN_FACTORY_WORKER]: { name: "Man factory worker", unicode: "U+1F468 U+200D U+1F3ED", emoji: "👨‍🏭" },
  [PersonEmojis.WOMAN_FACTORY_WORKER]: { name: "Woman factory worker", unicode: "U+1F469 U+200D U+1F3ED", emoji: "👩‍🏭" },
  [PersonEmojis.OFFICE_WORKER]: { name: "Office worker", unicode: "U+1F9D1 U+200D U+1F4BC", emoji: "🧑‍💼" },
  [PersonEmojis.MAN_OFFICE_WORKER]: { name: "Man office worker", unicode: "U+1F468 U+200D U+1F4BC", emoji: "👨‍💼" },
  [PersonEmojis.WOMAN_OFFICE_WORKER]: { name: "Woman factory worker", unicode: "U+1F469 U+200D U+1F4BC", emoji: "👩‍💼" },
  [PersonEmojis.SCIENTIST]: { name: "Scientist", unicode: "U+1F9D1 U+200D U+1F52C", emoji: "🧑‍🔬" },
  [PersonEmojis.MAN_SCIENTIST]: { name: "Man scientist", unicode: "U+1F468 U+200D U+1F52C", emoji: "👨‍🔬" },
  [PersonEmojis.WOMAN_SCIENTIST]: { name: "Woman scientist", unicode: "U+1F469 U+200D U+1F52C", emoji: "👩‍🔬" },
  [PersonEmojis.TECHNOLOGIST]: { name: "Technologist", unicode: "U+1F9D1 U+200D U+1F4BB", emoji: "🧑‍💻" },
  [PersonEmojis.MAN_TECHNOLOGIST]: { name: "Man technologist", unicode: "U+1F468 U+200D U+1F4BB", emoji: "👨‍💻" },
  [PersonEmojis.WOMAN_TECHNOLOGIST]: { name: "Woman technologist", unicode: "U+1F469 U+200D U+1F4BB", emoji: "👩‍💻" },
  [PersonEmojis.SINGER]: { name: "Singer", unicode: "U+1F9D1 U+200D U+1F3A4", emoji: "🧑‍🎤" },
  [PersonEmojis.MAN_SINGER]: { name: "Man singer", unicode: "U+1F468 U+200D U+1F3A4", emoji: "👨‍🎤" },
  [PersonEmojis.WOMAN_SINGER]: { name: "Woman singer", unicode: "U+1F469 U+200D U+1F3A4", emoji: "👩‍🎤" },
  [PersonEmojis.ARTIST]: { name: "Artist", unicode: "U+1F9D1 U+200D U+1F3A8", emoji: "🧑‍🎨" },
  [PersonEmojis.MAN_ARTIST]: { name: "Man artist", unicode: "U+1F468 U+200D U+1F3A8", emoji: "👨‍🎨" },
  [PersonEmojis.WOMAN_ARTIST]: { name: "Woman artist", unicode: "U+1F469 U+200D U+1F3A8", emoji: "👩‍🎨" },
  [PersonEmojis.PILOT]: { name: "Pilot", unicode: "U+1F9D1 U+200D U+2708 U+FE0F", emoji: "🧑‍✈️" },
  [PersonEmojis.MAN_PILOT]: { name: "Man pilot", unicode: "U+1F468 U+200D U+2708 U+FE0F", emoji: "👨‍✈️" },
  [PersonEmojis.WOMAN_PILOT]: { name: "Woman pilot", unicode: "U+1F469 U+200D U+2708 U+FE0F", emoji: "👩‍✈️" },
  [PersonEmojis.ASTRONAUT]: { name: "Astronaut", unicode: "U+1F9D1 U+200D U+1F680", emoji: "🧑‍🚀" },
  [PersonEmojis.MAN_ASTRONAUT]: { name: "Man astronaut", unicode: "U+1F468 U+200D U+1F680", emoji: "👨‍🚀" },
  [PersonEmojis.WOMAN_ASTRONAUT]: { name: "Womanh astronaut", unicode: "U+1F469 U+200D U+1F680", emoji: "👩‍🚀" },
  [PersonEmojis.FIREFIGHTER]: { name: "Firefighter", unicode: "U+1F9D1 U+200D U+1F692", emoji: "🧑‍🚒" },
  [PersonEmojis.MAN_FIREFIGHTER]: { name: "Man firefighter", unicode: "U+1F468 U+200D U+1F692", emoji: "👨‍🚒" },
  [PersonEmojis.WOMAN_FIREFIGHTER]: { name: "Woman firefighter", unicode: "U+1F469 U+200D U+1F692", emoji: "👩‍🚒" },
  [PersonEmojis.MAN_POLICE]: { name: "Man police", unicode: "U+1F46E U+200D U+2642 U+FE0F", emoji: "👮‍♂️" },
  [PersonEmojis.WOMAN_POLICE]: { name: "Woman police", unicode: "U+1F46E U+200D U+2640 U+FE0F", emoji: "👮‍♀️" },
  [PersonEmojis.MAN_DETECTIVE]: { name: "Man detective", unicode: "U+1F575 U+FE0F U+200D U+2642 U+FE0F", emoji: "🕵️‍♂️" },
  [PersonEmojis.WOMAN_DETECTIVE]: { name: "Woman detective", unicode: "U+1F575 U+FE0F U+200D U+2640 U+FE0F", emoji: "🕵️‍♀️" },
  [PersonEmojis.MAN_GUARD]: { name: "Man guard", unicode: "U+1F482 U+200D U+2642 U+FE0F", emoji: "💂‍♂️" },
  [PersonEmojis.WOMAN_GUARD]: { name: "Woman guard", unicode: "U+1F482 U+200D U+2640 U+FE0F", emoji: "💂‍♀️" },
  [PersonEmojis.MAN_CONSTRUCTION_WORKER]: { name: "Man construction worker", unicode: "U+1F477 U+200D U+2642 U+FE0F", emoji: "👷‍♂️" },
  [PersonEmojis.WOMAN_CONSTRUCTION_WORKER]: { name: "Woman construction worker", unicode: "U+1F477 U+200D U+2640 U+FE0F", emoji: "👷‍♀️" },
  [PersonEmojis.MAN_WEARING_TURBAN]: { name: "Man wearing turban", unicode: "U+1F473 U+200D U+2642 U+FE0F", emoji: "👳‍♂️" },
  [PersonEmojis.WOMAN_WEARING_TURBAN]: { name: "Woman wearing turban", unicode: "U+1F473 U+200D U+2640 U+FE0F", emoji: "👳‍♀️" },
  [PersonEmojis.MAN_IN_TUXEDO]: { name: "Man in tuxedo", unicode: "U+1F935 U+200D U+2642 U+FE0F", emoji: "🤵‍♂️" },
  [PersonEmojis.WOMAN_IN_TUXEDO]: { name: "Woman in tuxedo", unicode: "U+1F935 U+200D U+2640 U+FE0F", emoji: "🤵‍♀️" },
  [PersonEmojis.MAN_WITH_VEIL]: { name: "Man with veil", unicode: "U+1F470 U+200D U+2642 U+FE0F", emoji: "👰‍♂️" },
  [PersonEmojis.WOMAN_WITH_VEIL]: { name: "Woman with veil", unicode: "U+1F470 U+200D U+2640 U+FE0F", emoji: "👰‍♀️" },
  [PersonEmojis.PERSON_FEEDING_BABY]: { name: "Person feeding baby", unicode: "U+1F9D1 U+200D U+1F37C", emoji: "🧑‍🍼" },
  [PersonEmojis.WOMAN_FEEDING_BABY]: { name: "Woman feeding baby", unicode: "U+1F469 U+200D U+1F37C", emoji: "👩‍🍼" },
  [PersonEmojis.MAN_FEEDING_BABY]: { name: "Man feeding baby", unicode: "U+1F468 U+200D U+1F37C", emoji: "👨‍🍼" },
  [PersonEmojis.MX_CLAUS]: { name: "Mx claus", unicode: "U+1F9D1 U+200D U+1F384", emoji: "🧑‍🎄" },
  [PersonEmojis.MAN_SUPERHERO]: { name: "Man superhero", unicode: "U+1F9B8 U+200D U+2642 U+FE0F", emoji: "🦸‍♂️" },
  [PersonEmojis.WOMAN_SUPERHERO]: { name: "Woman superhero", unicode: "U+1F9B8 U+200D U+2640 U+FE0F", emoji: "🦸‍♀️" },
  [PersonEmojis.MAN_SUPERVILLAIN]: { name: "Man supervillain", unicode: "U+1F9B9 U+200D U+2642 U+FE0F", emoji: "🦹‍♂️" },
  [PersonEmojis.WOMAN_SUPERVILLAIN]: { name: "Woman supervillain", unicode: "U+1F9B9 U+200D U+2640 U+FE0F", emoji: "🦹‍♀️" },
  [PersonEmojis.MAN_MAGE]: { name: "Man mage", unicode: "U+1F9D9 U+200D U+2642 U+FE0F", emoji: "🧙‍♂️" },
  [PersonEmojis.WOMAN_MAGE]: { name: "Woman mage", unicode: "U+1F9D9 U+200D U+2640 U+FE0F", emoji: "🧙‍♀️" },
  [PersonEmojis.MAN_FAIRY]: { name: "Man fairy", unicode: "U+1F9DA U+200D U+2642 U+FE0F", emoji: "🧚‍♂️" },
  [PersonEmojis.WOMAN_FAIRY]: { name: "Woman fairy", unicode: "U+1F9DA U+200D U+2640 U+FE0F", emoji: "🧚‍♀️" },
  [PersonEmojis.MAN_VAMPIRE]: { name: "Man vampire", unicode: "U+1F9DB U+200D U+2642 U+FE0F", emoji: "🧛‍♂️" },
  [PersonEmojis.WOMAN_VAMPIRE]: { name: "Woman vampire", unicode: "U+1F9DB U+200D U+2640 U+FE0F", emoji: "🧛‍♀️" },
  [PersonEmojis.MERMAN]: { name: "Merman", unicode: "U+1F9DC U+200D U+2642 U+FE0F", emoji: "🧜‍♂️" },
  [PersonEmojis.MERMAID]: { name: "Mermaid", unicode: "U+1F9DC U+200D U+2640 U+FE0F", emoji: "🧜‍♀️" },
  [PersonEmojis.MAN_ELF]: { name: "Man elf", unicode: "U+1F9DD U+200D U+2642 U+FE0F", emoji: "🧝‍♂️" },
  [PersonEmojis.WOMAN_ELF]: { name: "Woman elf", unicode: "U+1F9DD U+200D U+2640 U+FE0F", emoji: "🧝‍♀️" },
  [PersonEmojis.MAN_GENIE]: { name: "Man genie", unicode: "U+1F9DE U+200D U+2642 U+FE0F", emoji: "🧞‍♂️" },
  [PersonEmojis.WOMAN_GENIE]: { name: "Woman genie", unicode: "U+1F9DE U+200D U+2640 U+FE0F", emoji: "🧞‍♀️" },
  [PersonEmojis.MAN_ZOMBIE]: { name: "Man zombie", unicode: "U+1F9DF U+200D U+2642 U+FE0F", emoji: "🧟‍♂️" },
  [PersonEmojis.WOMAN_ZOMBIE]: { name: "Woman zombie", unicode: "U+1F9DF U+200D U+2640 U+FE0F", emoji: "🧟‍♀️" },
  [PersonEmojis.MAN_GETTING_MASSAGE]: { name: "Man getting massage", unicode: "U+1F486 U+200D U+2642 U+FE0F", emoji: "💆‍♂️" },
  [PersonEmojis.WOMAN_GETTING_MASSAGE]: { name: "Woman getting massage", unicode: "U+1F486 U+200D U+2640 U+FE0F", emoji: "💆‍♀️" },
  [PersonEmojis.MAN_GETTING_HAIRCUT]: { name: "Man getting haircut", unicode: "U+1F487 U+200D U+2642 U+FE0F", emoji: "💇‍♂️" },
  [PersonEmojis.WOMAN_GETTING_HAIRCUT]: { name: "Woman getting haircut", unicode: "U+1F487 U+200D U+2640 U+FE0F", emoji: "💇‍♀️" },
  [PersonEmojis.MAN_WALKING]: { name: "Man walking", unicode: "U+1F6B6 U+200D U+2642 U+FE0F", emoji: "🚶‍♂️" },
  [PersonEmojis.WOMAN_WALKING]: { name: "Woman walking", unicode: "U+1F6B6 U+200D U+2640 U+FE0F", emoji: "🚶‍♀️" },
  [PersonEmojis.MAN_STANDING]: { name: "Man standing", unicode: "U+1F9CD U+200D U+2642 U+FE0F", emoji: "🧍‍♂️" },
  [PersonEmojis.WOMAN_STANDING]: { name: "Woman standing", unicode: "U+1F9CD U+200D U+2640 U+FE0F", emoji: "🧍‍♀️" },
  [PersonEmojis.MAN_KNEELING]: { name: "Man kneeling", unicode: "U+1F9CE U+200D U+2642 U+FE0F", emoji: "🧎‍♂️" },
  [PersonEmojis.WOMAN_KNEELING]: { name: "Woman kneeling", unicode: "U+1F9CE U+200D U+2640 U+FE0F", emoji: "🧎‍♀️" },
  [PersonEmojis.PERSON_WITH_WHITE_CANE]: { name: "Person with white cane", unicode: "U+1F9D1 U+200D U+1F9AF", emoji: "🧑‍🦯" },
  [PersonEmojis.MAN_WITH_WHITE_CANE]: { name: "Man with white cane", unicode: "U+1F468 U+200D U+1F9AF", emoji: "👨‍🦯" },
  [PersonEmojis.WOMAN_WITH_WHITE_CANE]: { name: "Woman with white cane", unicode: "U+1F469 U+200D U+1F9AF", emoji: "👩‍🦯" },
  [PersonEmojis.PERSON_WITH_MOTORIZED_WHEELCHAIR]: { name: "Person with motorized wheelchair", unicode: "U+1F9D1 U+200D U+1F9BC", emoji: "🧑‍🦼" },
  [PersonEmojis.MAN_IN_MOTORIZED_WHEELCHAIR]: { name: "Man in motorized wheelchair", unicode: "U+1F468 U+200D U+1F9BC", emoji: "👨‍🦼" },
  [PersonEmojis.WOMAN_IN_MOTORIZED_WHEELCHAIR]: { name: "Woman in motorized wheelchair", unicode: "U+1F469 U+200D U+1F9BC", emoji: "👩‍🦼" },
  [PersonEmojis.PERSON_IN_MANUAL_WHEELCHAIR]: { name: "Person in manual wheelchair", unicode: "U+1F9D1 U+200D U+1F9BD", emoji: "🧑‍🦽" },
  [PersonEmojis.MAN_IN_MANUAL_WHEELCHAIR]: { name: "Man in manual wheelchair", unicode: "U+1F468 U+200D U+1F9BD", emoji: "👨‍🦽" },
  [PersonEmojis.WOMAN_IN_MANUAL_WHEELCHAIR]: { name: "Woman in manual wheelchair", unicode: "U+1F469 U+200D U+1F9BD", emoji: "👩‍🦽" },
  [PersonEmojis.MAN_RUNNING]: { name: "Man running", unicode: "U+1F3C3 U+200D U+2642 U+FE0F", emoji: "🏃‍♂️" },
  [PersonEmojis.WOMAN_RUNNING]: { name: "Woman running", unicode: "U+1F3C3 U+200D U+2640 U+FE0F", emoji: "🏃‍♀️" },
  [PersonEmojis.MEN_WITH_BUNNY_EARS]: { name: "Men with bunny ears", unicode: "U+1F46F U+200D U+2642 U+FE0F", emoji: "👯‍♂️" },
  [PersonEmojis.WOMEN_WITH_BUNNY_EARS]: { name: "Women with bunny ears", unicode: "U+1F46F U+200D U+2640 U+FE0F", emoji: "👯‍♀️" },
  [PersonEmojis.MAN_IN_STEAMY_ROOM]: { name: "Man in steamy room", unicode: "U+1F9D6 U+200D U+2642 U+FE0F", emoji: "🧖‍♂️" },
  [PersonEmojis.WOMAN_IN_STEAMY_ROOM]: { name: "Woman in steamy room", unicode: "U+1F9D6 U+200D U+2640 U+FE0F", emoji: "🧖‍♀️" },
  [PersonEmojis.MAN_CLIMBING]: { name: "Man climbing", unicode: "U+1F9D7 U+200D U+2642 U+FE0F", emoji: "🧗‍♂️" },
  [PersonEmojis.WOMAN_CLIMBING]: { name: "Woman climbing", unicode: "U+1F9D7 U+200D U+2640 U+FE0F", emoji: "🧗‍♀️" },
  [PersonEmojis.MAN_GOLFING]: { name: "Man golfing", unicode: "U+1F3CC U+FE0F U+200D U+2642 U+FE0F", emoji: "🏌️‍♂️" },
  [PersonEmojis.WOMAN_GOLFING]: { name: "Woman golfing", unicode: "U+1F3CC U+FE0F U+200D U+2640 U+FE0F", emoji: "🏌️‍♀️" },
  [PersonEmojis.PERSON_CLIMBING]: { name: "Person climbing", unicode: "U+1F9D7", emoji: "🧗" },
  [PersonEmojis.MAN_CLIMBING_2]: { name: "Man climbing", unicode: "U+200D", emoji: "🧗‍♂‍" },
  [PersonEmojis.WOMAN_CLIMBING_2]: { name: "Woman climbing", unicode: "U+2640", emoji: "🧗‍♀‍" },
  [PersonEmojis.PERSON_FENCING]: { name: "Person fencing", unicode: "U+1F93A", emoji: "🤺" },
  [PersonEmojis.HORSE_RACING]: { name: "Horse racing", unicode: "U+1F3C7", emoji: "🏇" },
  [PersonEmojis.SKIER]: { name: "Skier", unicode: "U+26F7", emoji: "⛷" },
  [PersonEmojis.SNOWBOARDER]: { name: "Snowboarder", unicode: "U+1F3C2", emoji: "🏂" },
  [PersonEmojis.PERSON_PLAYING_GOLF]: { name: "Person playing golf", unicode: "U+1F3CC", emoji: "🏌" },
  [PersonEmojis.MAN_PLAYING_GOLF]: { name: "Man playing golf", unicode: "U+FE0F", emoji: "🏌️‍♂‍" },
  [PersonEmojis.WOMAN_PLAYING_GOLF]: { name: "Woman playing golf", unicode: "U+200D", emoji: "🏌️‍♀‍" },
  [PersonEmojis.PERSON_SURFING]: { name: "Person surfing", unicode: "U+1F3C4", emoji: "🏄" },
  [PersonEmojis.MAN_SURFING]: { name: "Man sufing", unicode: "U+1F3C4 U+200D U+2642 U+FE0F", emoji: "🏄‍♂️" },
  [PersonEmojis.WOMAN_SURFING]: { name: "Woman surfing", unicode: "U+1F3C4 U+200D U+2640 U+FE0F", emoji: "🏄‍♀️" },
  [PersonEmojis.PERSON_ROWING_BOAT]: { name: "Person rowing boat", unicode: "U+1F6A3", emoji: "🚣" },
  [PersonEmojis.MAN_ROWING_BOAT]: { name: "Man rowing boat", unicode: "U+1F6A3 U+200D U+2642 U+FE0F", emoji: "🚣‍♂️" },
  [PersonEmojis.WOMAN_ROWING_BOAT]: { name: "Woman rowing boat", unicode: "U+1F6A3 U+200D U+2640 U+FE0F", emoji: "🚣‍♀️" },
  [PersonEmojis.PERSON_SWIMMING]: { name: "Person swimming", unicode: "U+1F3CA", emoji: "🏊" },
  [PersonEmojis.MAN_SWIMMING]: { name: "Man swimming", unicode: "U+1F3CA U+200D U+2642 U+FE0F", emoji: "🏊‍♂️" },
  [PersonEmojis.WOMAN_SWIMMING]: { name: "Woman swimming", unicode: "U+1F3CA U+200D U+2640 U+FE0F", emoji: "🏊‍♀️" },
  [PersonEmojis.PERSON_BOUNCING_BALL]: { name: "Person bouncing ball", unicode: "U+26F9", emoji: "⛹" },
  [PersonEmojis.MAN_BOUNCING_BALL]: { name: "Man bouncing ball", unicode: "U+26F9 U+FE0F U+200D U+2642 U+FE0F", emoji: "⛹️‍♂️" },
  [PersonEmojis.WOMAN_BOUNCING_BALL]: { name: "Woman bouncing ball", unicode: "U+26F9 U+FE0F U+200D U+2640 U+FE0F", emoji: "⛹️‍♀️" },
  [PersonEmojis.PERSON_LIFTING_WEIGHT]: { name: "Person lifting weight", unicode: "U+1F3CB", emoji: "🏋" },
  [PersonEmojis.MAN_LIFTING_WEIGHTS]: { name: "Man lifting weights", unicode: "U+1F3CB U+FE0F U+200D U+2642 U+FE0F", emoji: "🏋️‍♂️" },
  [PersonEmojis.WOMAN_LIFTING_WEIGHTS]: { name: "Woman lifting weights", unicode: "U+1F3CB U+FE0F U+200D U+2640 U+FE0F", emoji: "🏋️‍♀️" },
  [PersonEmojis.PERSON_CYCLING]: { name: "Person cycling", unicode: "U+1F6B4", emoji: "🚴" },
  [PersonEmojis.MAN_CYCLING]: { name: "Man cycling", unicode: "U+1F6B4 U+200D U+2642 U+FE0F", emoji: "🚴‍♂️" },
  [PersonEmojis.WOMAN_CYCLING]: { name: "Woman cycling", unicode: "U+1F6B4 U+200D U+2640 U+FE0F", emoji: "🚴‍♀️" },
  [PersonEmojis.PERSON_MOUNTAIN_BIKING]: { name: "Person mountain biking", unicode: "U+1F6B5", emoji: "🚵" },
  [PersonEmojis.MAN_MOUNTAIN_BIKING]: { name: "Man mountain biking", unicode: "U+1F6B5 U+200D U+2642 U+FE0F", emoji: "🚵‍♂️" },
  [PersonEmojis.WOMAN_MOUNTAIN_BIKING]: { name: "Woman mountain biking", unicode: "U+1F6B5 U+200D U+2640 U+FE0F", emoji: "🚵‍♀️" },
  [PersonEmojis.PERSON_CARTWHEELING]: { name: "Person cartwheeling", unicode: "U+1F938", emoji: "🤸" },
  [PersonEmojis.MAN_CARTWHEELING]: { name: "Man cartwheeling", unicode: "U+1F938 U+200D U+2642 U+FE0F", emoji: "🤸‍♂️" },
  [PersonEmojis.WOMAN_CARTWHEELING]: { name: "Woman cartwheeling", unicode: "U+1F938 U+200D U+2640 U+FE0F", emoji: "🤸‍♀️" },
  [PersonEmojis.PEOPLE_WRESTLING]: { name: "People wrestling", unicode: "U+1F93C", emoji: "🤼" },
  [PersonEmojis.MEN_WRESTLING]: { name: "Men wrestling", unicode: "U+1F93C U+200D U+2642 U+FE0F", emoji: "🤼‍♂️" },
  [PersonEmojis.WOMEN_WRESTLING]: { name: "Women wrestling", unicode: "U+1F93C U+200D U+2640 U+FE0F", emoji: "🤼‍♀️" },
  [PersonEmojis.PERSON_PLAYING_WATER_POLO]: { name: "Person playing water polo", unicode: "U+1F93D", emoji: "🤽" },
  [PersonEmojis.MAN_PLAYING_WATER_POLO]: { name: "Man playing water polo", unicode: "U+1F93D U+200D U+2642 U+FE0F", emoji: "🤽‍♂️" },
  [PersonEmojis.WOMAN_PLAYING_WATER_POLO]: { name: "Woman playing water polo", unicode: "U+1F93D U+200D U+2640 U+FE0F", emoji: "🤽‍♀️" },
  [PersonEmojis.PERSON_PLAYING_HANDBALL]: { name: "Person playing handball", unicode: "U+1F93E", emoji: "🤾" },
  [PersonEmojis.MAN_PLAYING_HANDBALL]: { name: "Man playing handball", unicode: "U+1F93E U+200D U+2642 U+FE0F", emoji: "🤾‍♂️" },
  [PersonEmojis.WOMAN_PLAYING_HANDBALL]: { name: "Woman playing handblall", unicode: "U+1F93E U+200D U+2640 U+FE0F", emoji: "🤾‍♀️" },
  [PersonEmojis.PERSON_JUGGLING]: { name: "Person juggling", unicode: "U+1F939", emoji: "🤹" },
  [PersonEmojis.MAN_JUGGLING]: { name: "Man juggling", unicode: "U+1F939 U+200D U+2642 U+FE0F", emoji: "🤹‍♂️" },
  [PersonEmojis.WOMAN_JUGGLING]: { name: "Woman juggling", unicode: "U+1F939 U+200D U+2640 U+FE0F", emoji: "🤹‍♀️" },
  [PersonEmojis.PERSON_LOTUS_POSITION]: { name: "Person lotus position", unicode: "U+1F9D8", emoji: "🧘" },
  [PersonEmojis.MAN_IN_LOTUS_POSITION]: { name: "Man in lotus position", unicode: "U+1F9D8 U+200D U+2642 U+FE0F", emoji: "🧘‍♂️" },
  [PersonEmojis.WOMAN_IN_LOTUS_POSITION]: { name: "Woman in lotus position", unicode: "U+1F9D8 U+200D U+2640 U+FE0F", emoji: "🧘‍♀️" },
  [PersonEmojis.PERSON_BATHING]: { name: "Person bathing", unicode: "U+1F6C0", emoji: "🛀" },
  [PersonEmojis.PERSON_IN_BED]: { name: "Person in bed", unicode: "U+1F6CC", emoji: "🛌" },
}
