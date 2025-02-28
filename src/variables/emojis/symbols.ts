import { type EmojiDefinition } from "./types";

export enum SymbolsEmojis {
  ATM_SIGN = "atm_sign",
  LITTER_IN_BIN = "litter_in_bin",
  PORTABLE_WATER = "portable_water",
  WHEELCHAIR_SYMBOL = "wheelchair_symbol",
  MENS_ROOM_SYMBOL = "mens_room_symbol",
  WOMENS_ROOM_SYMBOL = "womens_room_symbol",
  RESTROOM_SYMBOL = "restroom_symbol",
  BABY_SYMBOL = "baby_symbol",
  WATER_CLOSET = "water_closet",
  PASSPORT_CONTROL = "passport_control",
  CUSTOMS = "customs",
  BAGGAGE_CLAIM = "baggage_claim",
  LEFT_LAUGAGE = "left_laugage",
  WARNING = "warning",
  CHILDREN_CROSSING = "children_crossing",
  NO_ENTRY = "no_entry",
  PROHIBITED = "prohibited",
  NO_BICYCLES = "no_bicycles",
  NO_SMOKING = "no_smoking",
  NO_LITTERING = "no_littering",
  NON_PORTABLE_WATER = "non_portable_water",
  NO_PEDESTRIANS = "no_pedestrians",
  NO_MOBILE_PHONES = "no_mobile_phones",
  NO_ONE_UNDER_18 = "no_one_under_18",
  RADIOACTIVE = "radioactive",
  BIOHAZARD = "biohazard",
  PLACE_OF_WORSHIP = "place_of_worship",
  ATOM_SYMBOL = "atom_symbol",
  OM = "om",
  STAR_OF_DAVID = "star_of_david",
  WHEEL_OF_DHARMA = "wheel_of_dharma",
  YIN_YANG = "yin_yang",
  LATIN_CROSS = "latin_cross",
  ORTHODOX_CROSS = "orthodox_cross",
  STAR_AND_CRESCENT_MOON = "star_and_cresent_moon",
  PEACE = "peace",
  MENORAH = "menorah",
  SIX_POINTED_STAR = "six_pointed_star",
  ARIES = "aries",
  TAURUS = "taurus",
  GEMINI = "gemini",
  CANCER = "cancer",
  LEO = "leo",
  VIRGO = "virgo",
  LIBRA = "libra",
  SCORPIO = "scorpio",
  SAGITTARIUS = "sagittarius",
  CAPRICON = "capricon",
  ACQUARIUS = "acquarius",
  PISCES = "pisces",
  OPHIUCUS = "ophiucus",
  SHUFFLE_TRACKS = "shuffle_tracks",
  REPEAT_ALL = "repeat_all",
  REPEAT_ONE = "repeat_one",
  PLAY = "play",
  PAUSE = "pause",
  FAST_FORWARD = "fast_forward",
  NEXT_TRACK = "next_track",
  PLAY_OR_PAUSE = "play_or_pause",
  REVERSE = "reverse",
  FAST_REVERSE = "fast_reverse",
  PREVIOUS_TRACK = "previous_track",
  UPWARDS = "upwards",
  FAST_UP = "fast_up",
  DOWNWARDS = "downwards",
  FAST_DOWN = "fast_down",
  STOP = "stop",
  RECORD = "record",
  EJECT = "eject",
  CINEMA = "cinema",
  DIM = "dim",
  BRIGHT = "bright",
  NETWORK_ANTENNA_BARS = "network_antenna_bars",
  VIBRATION_MODE = "vibration_mode",
  MOBILE_PHONE_OFF = "mobile_phone_off",
  FEMALE = "female",
  MALE = "male",
  TRANSGENDER = "transgender",
  TIMES = "times",
  PLUS = "plus",
  MINUS = "minus",
  DIVIDE = "divide",
  EQUALS = "equals",
  INFINITY = "infinity",
  DOUBLE_EXCLAMATION = "double_exclamation",
  EXCLAMATION_AND_QUESTION_MARK = "exclamation_and_question_mark",
  RED_QUESTION_MARK = "red_question_mark",
  WHITE_QUESTION_MARK = "white_question_mark",
  RED_EXCLAMATION_MARK = "red_exclamation_mark",
  WHITE_EXCLAMATION_MARK = "white_exclamation_mark",
  WAVY_DASH = "wavy_dash",
  CURRENCY_EXCHANGE = "currency_exchange",
  HEAVY_GREEN_DOLLAR_SIGN = "heavy_green_dollar_sign",
  MEDICAL_SYMBOL = "medical_symbol",
  RECYCLING_SYMBOL = "recycling_symbol",
  FLEUR_DE_LIS = "fleur_de_lis",
  TRIDENT = "trident",
  NAME_BADGE = "name_badge",
  JAPANESE_SYMBOL_FOR_BEGINNER = "japanese_symbol_for_beginner",
  HOLLOW_RED_CIRCLE = "hollow_red_circle",
  GREEN_BOX_WITH_CHECKMARK = "green_box_with_checkmark",
  BLUE_BOX_WITH_CHECKMARK = "blue_box_with_checkmark",
  CHECKMARK = "checkmark",
  CROSSMARK = "crossmark",
  GREEN_CROSSMARK = "green_crossmark",
  CURLY_LOOP = "curly_loop",
  DOUBLE_CURLY_LOOP = "double_curly_loop",
  PART_ALTERNATION_MARK = "part_alternation_mark",
  EIGHT_SPOKED_ASTERISK = "eight_spoked_asterisk",
  EIGHT_POINTED_STAR = "eight_pointed_star",
  SPARKLE = "sparkle",
  COPYRIGHT_SYMBOL = "copyright_symbol",
  REGISTERED = "registered",
  TRADEMARK = "trademark",
}

export const symbolsEmojis: Record<SymbolsEmojis, EmojiDefinition> = {
  [SymbolsEmojis.ATM_SIGN]: { name: "ATM Sign", unicode: "U+1F3E7", emoji: "🏧" },
  [SymbolsEmojis.LITTER_IN_BIN]: { name: "Litter in bin", unicode: "U+1F6AE", emoji: "🚮" },
  [SymbolsEmojis.PORTABLE_WATER]: { name: "Portable water", unicode: "U+1F6B0", emoji: "🚰" },
  [SymbolsEmojis.WHEELCHAIR_SYMBOL]: { name: "Wheelchair symbol", unicode: "U+267F", emoji: "♿" },
  [SymbolsEmojis.MENS_ROOM_SYMBOL]: { name: "Men's room symbol", unicode: "U+1F6B9", emoji: "🚹" },
  [SymbolsEmojis.WOMENS_ROOM_SYMBOL]: { name: "Women's room symbol", unicode: "U+1F6BA", emoji: "🚺" },
  [SymbolsEmojis.RESTROOM_SYMBOL]: { name: "Restroom symbol", unicode: "U+1F6BB", emoji: "🚻" },
  [SymbolsEmojis.BABY_SYMBOL]: { name: "Baby symbol", unicode: "U+1F6BC", emoji: "🚼" },
  [SymbolsEmojis.WATER_CLOSET]: { name: "Water closet", unicode: "U+1F6BE", emoji: "🚾" },
  [SymbolsEmojis.PASSPORT_CONTROL]: { name: "Passport control", unicode: "U+1F6C2", emoji: "🛂" },
  [SymbolsEmojis.CUSTOMS]: { name: "Customs", unicode: "U+1F6C3", emoji: "🛃" },
  [SymbolsEmojis.BAGGAGE_CLAIM]: { name: "Baggage claim", unicode: "U+1F6C4", emoji: "🛄" },
  [SymbolsEmojis.LEFT_LAUGAGE]: { name: "Left laugage", unicode: "U+1F6C5", emoji: "🛅" },
  [SymbolsEmojis.WARNING]: { name: "Warning", unicode: "U+26A0", emoji: "⚠" },
  [SymbolsEmojis.CHILDREN_CROSSING]: { name: "Children crossing", unicode: "U+1F6B8", emoji: "🚸" },
  [SymbolsEmojis.NO_ENTRY]: { name: "No entry", unicode: "U+26D4", emoji: "⛔" },
  [SymbolsEmojis.PROHIBITED]: { name: "Prohibited", unicode: "U+1F6AB", emoji: "🚫" },
  [SymbolsEmojis.NO_BICYCLES]: { name: "No bicycles", unicode: "U+1F6B3", emoji: "🚳" },
  [SymbolsEmojis.NO_SMOKING]: { name: "No smoking", unicode: "U+1F6AD", emoji: "🚭" },
  [SymbolsEmojis.NO_LITTERING]: { name: "No littering", unicode: "U+1F6AF", emoji: "🚯" },
  [SymbolsEmojis.NON_PORTABLE_WATER]: { name: "Non-portable water", unicode: "U+1F6B1", emoji: "🚱" },
  [SymbolsEmojis.NO_PEDESTRIANS]: { name: "No pedestrians", unicode: "U+1F6B7", emoji: "🚷" },
  [SymbolsEmojis.NO_MOBILE_PHONES]: { name: "No mobile phones", unicode: "U+1F4F5", emoji: "📵" },
  [SymbolsEmojis.NO_ONE_UNDER_18]: { name: "No one under 18", unicode: "U+1F51E", emoji: "🔞" },
  [SymbolsEmojis.RADIOACTIVE]: { name: "Radioactive", unicode: "U+2622", emoji: "☢" },
  [SymbolsEmojis.BIOHAZARD]: { name: "Biohazard", unicode: "U+2623", emoji: "☣" },
  [SymbolsEmojis.PLACE_OF_WORSHIP]: { name: "Place of worship", unicode: "U+1F6D0", emoji: "🛐" },
  [SymbolsEmojis.ATOM_SYMBOL]: { name: "Atom symbol", unicode: "U+269B", emoji: "⚛" },
  [SymbolsEmojis.OM]: { name: "OM", unicode: "U+1F549", emoji: "🕉" },
  [SymbolsEmojis.STAR_OF_DAVID]: { name: "Star of David", unicode: "U+2721", emoji: "✡" },
  [SymbolsEmojis.WHEEL_OF_DHARMA]: { name: "Wheel of Dharma", unicode: "U+2638", emoji: "☸" },
  [SymbolsEmojis.YIN_YANG]: { name: "Yin yang", unicode: "U+262F", emoji: "☯" },
  [SymbolsEmojis.LATIN_CROSS]: { name: "Latin cross", unicode: "U+271D", emoji: "✝" },
  [SymbolsEmojis.ORTHODOX_CROSS]: { name: "Orthodox cross", unicode: "U+2626", emoji: "☦" },
  [SymbolsEmojis.STAR_AND_CRESCENT_MOON]: { name: "Star and cresent moon", unicode: "U+262A", emoji: "☪" },
  [SymbolsEmojis.PEACE]: { name: "Peace", unicode: "U+262E", emoji: "☮" },
  [SymbolsEmojis.MENORAH]: { name: "Menorah", unicode: "U+1F54E", emoji: "🕎" },
  [SymbolsEmojis.SIX_POINTED_STAR]: { name: "Six-pointed star", unicode: "U+1F52F", emoji: "🔯" },
  [SymbolsEmojis.ARIES]: { name: "Aries", unicode: "U+2648", emoji: "♈" },
  [SymbolsEmojis.TAURUS]: { name: "Taurus", unicode: "U+2649", emoji: "♉" },
  [SymbolsEmojis.GEMINI]: { name: "Gemini", unicode: "U+264A", emoji: "♊" },
  [SymbolsEmojis.CANCER]: { name: "Cancer", unicode: "U+264B", emoji: "♋" },
  [SymbolsEmojis.LEO]: { name: "Leo", unicode: "U+264C", emoji: "♌" },
  [SymbolsEmojis.VIRGO]: { name: "Virgo", unicode: "U+264D", emoji: "♍" },
  [SymbolsEmojis.LIBRA]: { name: "Libra", unicode: "U+264E", emoji: "♎" },
  [SymbolsEmojis.SCORPIO]: { name: "Scorpio", unicode: "U+264F", emoji: "♏" },
  [SymbolsEmojis.SAGITTARIUS]: { name: "Sagittarius", unicode: "U+2650", emoji: "♐" },
  [SymbolsEmojis.CAPRICON]: { name: "Capricon", unicode: "U+2651", emoji: "♑" },
  [SymbolsEmojis.ACQUARIUS]: { name: "Acquarius", unicode: "U+2652", emoji: "♒" },
  [SymbolsEmojis.PISCES]: { name: "Pisces", unicode: "U+2653", emoji: "♓" },
  [SymbolsEmojis.OPHIUCUS]: { name: "Ophiucus", unicode: "U+26CE", emoji: "⛎" },
  [SymbolsEmojis.SHUFFLE_TRACKS]: { name: "Shuffle tracks", unicode: "U+1F500", emoji: "🔀" },
  [SymbolsEmojis.REPEAT_ALL]: { name: "Repeat all", unicode: "U+1F501", emoji: "🔁" },
  [SymbolsEmojis.REPEAT_ONE]: { name: "Repeat one", unicode: "U+1F502", emoji: "🔂" },
  [SymbolsEmojis.PLAY]: { name: "Play", unicode: "U+25B6", emoji: "▶" },
  [SymbolsEmojis.PAUSE]: { name: "Pause", unicode: "U+23F8", emoji: "⏸" },
  [SymbolsEmojis.FAST_FORWARD]: { name: "Fast-forward", unicode: "U+23E9", emoji: "⏩" },
  [SymbolsEmojis.NEXT_TRACK]: { name: "Next track", unicode: "U+23ED", emoji: "⏭" },
  [SymbolsEmojis.PLAY_OR_PAUSE]: { name: "Play or pause", unicode: "U+23EF", emoji: "⏯" },
  [SymbolsEmojis.REVERSE]: { name: "Reverse", unicode: "U+25C0", emoji: "◀" },
  [SymbolsEmojis.FAST_REVERSE]: { name: "Fast-reverse", unicode: "U+23EA", emoji: "⏪" },
  [SymbolsEmojis.PREVIOUS_TRACK]: { name: "Previous track", unicode: "U+23EE", emoji: "⏮" },
  [SymbolsEmojis.UPWARDS]: { name: "Upwards", unicode: "U+1F53C", emoji: "🔼" },
  [SymbolsEmojis.FAST_UP]: { name: "Fast-up", unicode: "U+23EB", emoji: "⏫" },
  [SymbolsEmojis.DOWNWARDS]: { name: "Downwards", unicode: "U+1F53D", emoji: "🔽" },
  [SymbolsEmojis.FAST_DOWN]: { name: "Fast down", unicode: "U+23EC", emoji: "⏬" },
  [SymbolsEmojis.STOP]: { name: "Stop", unicode: "U+23F9", emoji: "⏹" },
  [SymbolsEmojis.RECORD]: { name: "Record", unicode: "U+23FA", emoji: "⏺" },
  [SymbolsEmojis.EJECT]: { name: "Eject", unicode: "U+23CF", emoji: "⏏" },
  [SymbolsEmojis.CINEMA]: { name: "Cinema", unicode: "U+1F3A6", emoji: "🎦" },
  [SymbolsEmojis.DIM]: { name: "Dim", unicode: "U+1F505", emoji: "🔅" },
  [SymbolsEmojis.BRIGHT]: { name: "Bright", unicode: "U+1F506", emoji: "🔆" },
  [SymbolsEmojis.NETWORK_ANTENNA_BARS]: { name: "Network antenna bars", unicode: "U+1F4F6", emoji: "📶" },
  [SymbolsEmojis.VIBRATION_MODE]: { name: "Vibration mode", unicode: "U+1F4F3", emoji: "📳" },
  [SymbolsEmojis.MOBILE_PHONE_OFF]: { name: "Mobile phone off", unicode: "U+1F4F4", emoji: "📴" },
  [SymbolsEmojis.FEMALE]: { name: "Female", unicode: "U+2640", emoji: "♀" },
  [SymbolsEmojis.MALE]: { name: "Male", unicode: "U+2642", emoji: "♂" },
  [SymbolsEmojis.TRANSGENDER]: { name: "Transgender", unicode: "U+26A7", emoji: "⚧" },
  [SymbolsEmojis.TIMES]: { name: "Times", unicode: "U+2716", emoji: "✖" },
  [SymbolsEmojis.PLUS]: { name: "Plus", unicode: "U+2795", emoji: "➕" },
  [SymbolsEmojis.MINUS]: { name: "Minus", unicode: "U+2796", emoji: "➖" },
  [SymbolsEmojis.DIVIDE]: { name: "Divide", unicode: "U+2797", emoji: "➗" },
  [SymbolsEmojis.EQUALS]: { name: "Equals", unicode: "U+1F7F0", emoji: "🟰" },
  [SymbolsEmojis.INFINITY]: { name: "Infinity", unicode: "U+267E", emoji: "♾" },
  [SymbolsEmojis.DOUBLE_EXCLAMATION]: { name: "Double exclamation", unicode: "U+203C", emoji: "‼" },
  [SymbolsEmojis.EXCLAMATION_AND_QUESTION_MARK]: { name: "Exclamation and question mark", unicode: "U+2049", emoji: "⁉" },
  [SymbolsEmojis.RED_QUESTION_MARK]: { name: "Red question mark", unicode: "U+2753", emoji: "❓" },
  [SymbolsEmojis.WHITE_QUESTION_MARK]: { name: "White question mark", unicode: "U+2754", emoji: "❔" },
  [SymbolsEmojis.RED_EXCLAMATION_MARK]: { name: "Red exclamation mark", unicode: "U+2757", emoji: "❗" },
  [SymbolsEmojis.WHITE_EXCLAMATION_MARK]: { name: "White exclamation mark", unicode: "U+2755", emoji: "❕" },
  [SymbolsEmojis.WAVY_DASH]: { name: "Wavy dash", unicode: "U+3030", emoji: "〰" },
  [SymbolsEmojis.CURRENCY_EXCHANGE]: { name: "Currency exchange", unicode: "U+1F4B1", emoji: "💱" },
  [SymbolsEmojis.HEAVY_GREEN_DOLLAR_SIGN]: { name: "Heavy green dollar sign", unicode: "U+1F4B2", emoji: "💲" },
  [SymbolsEmojis.MEDICAL_SYMBOL]: { name: "Medical symbol", unicode: "U+2695", emoji: "⚕" },
  [SymbolsEmojis.RECYCLING_SYMBOL]: { name: "Recycling symbol", unicode: "U+267B", emoji: "♻" },
  [SymbolsEmojis.FLEUR_DE_LIS]: { name: "Fleur-de-lis", unicode: "U+269C", emoji: "⚜" },
  [SymbolsEmojis.TRIDENT]: { name: "Trident", unicode: "U+1F531", emoji: "🔱" },
  [SymbolsEmojis.NAME_BADGE]: { name: "Name badge", unicode: "U+1F4DB", emoji: "📛" },
  [SymbolsEmojis.JAPANESE_SYMBOL_FOR_BEGINNER]: { name: "Japanese symbol for beginner", unicode: "U+1F530", emoji: "🔰" },
  [SymbolsEmojis.HOLLOW_RED_CIRCLE]: { name: "Hollow red circle", unicode: "U+2B55", emoji: "⭕" },
  [SymbolsEmojis.GREEN_BOX_WITH_CHECKMARK]: { name: "Green box with checkmark", unicode: "U+2705", emoji: "✅" },
  [SymbolsEmojis.BLUE_BOX_WITH_CHECKMARK]: { name: "Blue box with checkmark", unicode: "U+2611", emoji: "☑" },
  [SymbolsEmojis.CHECKMARK]: { name: "Checkmark", unicode: "U+2714", emoji: "✔" },
  [SymbolsEmojis.CROSSMARK]: { name: "Crossmark", unicode: "U+274C", emoji: "❌" },
  [SymbolsEmojis.GREEN_CROSSMARK]: { name: "Green crossmark", unicode: "U+274E", emoji: "❎" },
  [SymbolsEmojis.CURLY_LOOP]: { name: "Curly loop", unicode: "U+27B0", emoji: "➰" },
  [SymbolsEmojis.DOUBLE_CURLY_LOOP]: { name: "Double curly loop", unicode: "U+27BF", emoji: "➿" },
  [SymbolsEmojis.PART_ALTERNATION_MARK]: { name: "Part alternation mark", unicode: "U+303D", emoji: "〽" },
  [SymbolsEmojis.EIGHT_SPOKED_ASTERISK]: { name: "Eight-spoked asterisk", unicode: "U+2733", emoji: "✳" },
  [SymbolsEmojis.EIGHT_POINTED_STAR]: { name: "Eight-pointed star", unicode: "U+2734", emoji: "✴" },
  [SymbolsEmojis.SPARKLE]: { name: "Sparkle", unicode: "U+2747", emoji: "❇" },
  [SymbolsEmojis.COPYRIGHT_SYMBOL]: { name: "Copyright symbol", unicode: "U+00A9", emoji: "©" },
  [SymbolsEmojis.REGISTERED]: { name: "Registered", unicode: "U+00AE", emoji: "®" },
  [SymbolsEmojis.TRADEMARK]: { name: "Trademark", unicode: "U+2122", emoji: "™" },
}
