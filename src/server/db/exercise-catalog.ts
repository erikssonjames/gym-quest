import { createHash } from "node:crypto"

import type { InsertMuscle, InsertMuscleGroup } from "./schema/body"
import type { InsertExercise } from "./schema/exercise"

const GROUP_IDS = {
  chest: "10000000-0000-4000-8000-000000000001",
  back: "10000000-0000-4000-8000-000000000002",
  legs: "10000000-0000-4000-8000-000000000003",
  shoulders: "10000000-0000-4000-8000-000000000004",
  arms: "10000000-0000-4000-8000-000000000005",
  core: "10000000-0000-4000-8000-000000000006",
  neck: "10000000-0000-4000-8000-000000000007",
} as const

const BASE_MUSCLE_IDS = {
  pectoralis_major: "11000000-0000-4000-8000-000000000001",
  latissimus_dorsi: "11000000-0000-4000-8000-000000000002",
  middle_trapezius: "11000000-0000-4000-8000-000000000003",
  quadriceps: "11000000-0000-4000-8000-000000000004",
  hamstrings: "11000000-0000-4000-8000-000000000005",
  gluteus_maximus: "11000000-0000-4000-8000-000000000006",
  anterior_deltoid: "11000000-0000-4000-8000-000000000007",
  biceps_brachii: "11000000-0000-4000-8000-000000000008",
  triceps_brachii: "11000000-0000-4000-8000-000000000009",
  rectus_abdominis: "11000000-0000-4000-8000-000000000010",
} as const

function deterministicUuid(namespace: string, value: string) {
  const characters = createHash("sha256").update(`${namespace}:${value}`).digest("hex").slice(0, 32).split("")
  characters[12] = "4"
  characters[16] = "8"
  const hex = characters.join("")

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export const ADDITIONAL_MUSCLE_GROUPS = [
  {
    id: GROUP_IDS.neck,
    name: "Neck",
    description: "Muscles that flex, extend, rotate, and stabilize the head and cervical spine.",
  },
] satisfies InsertMuscleGroup[]

const additionalMuscleDefinitions = [
  ["pectoralis_minor", "Pectoralis Minor", "Pectoralis minor", "chest", "A deep chest muscle that draws the shoulder blade forward and downward."],
  ["serratus_anterior", "Serratus Anterior", "Serratus anterior", "chest", "Protracts and upwardly rotates the shoulder blade during pressing and overhead movement."],

  ["upper_trapezius", "Upper Trapezius", "Trapezius, descending fibers", "back", "Elevates and upwardly rotates the shoulder blade."],
  ["lower_trapezius", "Lower Trapezius", "Trapezius, ascending fibers", "back", "Depresses and upwardly rotates the shoulder blade."],
  ["rhomboids", "Rhomboids", "Rhomboideus major et minor", "back", "Retract and stabilize the shoulder blades during rows and pulls."],
  ["erector_spinae", "Erector Spinae", "Erector spinae", "back", "Extends and stabilizes the spine during hinges, squats, and carries."],
  ["teres_major", "Teres Major", "Teres major", "back", "Assists shoulder extension and adduction in pulling movements."],
  ["levator_scapulae", "Levator Scapulae", "Levator scapulae", "back", "Elevates the shoulder blade and assists cervical positioning."],
  ["multifidus", "Multifidus", "Multifidus", "back", "Deep spinal stabilizer active during bracing and unilateral loading."],
  ["quadratus_lumborum", "Quadratus Lumborum", "Quadratus lumborum", "back", "Stabilizes the lumbar spine and resists side bending."],

  ["gluteus_medius", "Gluteus Medius", "Gluteus medius", "legs", "Abducts the hip and stabilizes the pelvis during single-leg movement."],
  ["gluteus_minimus", "Gluteus Minimus", "Gluteus minimus", "legs", "Assists hip abduction and pelvic stability."],
  ["hip_adductors", "Hip Adductors", "Musculi adductores", "legs", "Draw the thigh inward and stabilize squats, lunges, and lateral movement."],
  ["hip_flexors", "Hip Flexors", "Iliopsoas et musculi flexores coxae", "legs", "Flex the hip during running, climbing, and leg-raise patterns."],
  ["tensor_fasciae_latae", "Tensor Fasciae Latae", "Tensor fasciae latae", "legs", "Assists hip flexion and abduction and stabilizes the iliotibial band."],
  ["sartorius", "Sartorius", "Sartorius", "legs", "Assists combined hip flexion, abduction, external rotation, and knee flexion."],
  ["gastrocnemius", "Gastrocnemius", "Gastrocnemius", "legs", "The superficial calf muscle used in plantar flexion and jumping."],
  ["soleus", "Soleus", "Soleus", "legs", "A deep calf muscle emphasized when plantar flexing with bent knees."],
  ["tibialis_anterior", "Tibialis Anterior", "Tibialis anterior", "legs", "Lifts the forefoot and controls the ankle during walking and landing."],
  ["fibularis", "Fibularis Muscles", "Fibularis longus et brevis", "legs", "Evert and stabilize the foot and ankle."],

  ["lateral_deltoid", "Lateral Deltoid", "Deltoideus, pars acromialis", "shoulders", "Raises the upper arm away from the body."],
  ["posterior_deltoid", "Posterior Deltoid", "Deltoideus, pars spinalis", "shoulders", "Extends and horizontally abducts the shoulder."],
  ["supraspinatus", "Supraspinatus", "Supraspinatus", "shoulders", "Initiates shoulder abduction and stabilizes the humeral head."],
  ["infraspinatus", "Infraspinatus", "Infraspinatus", "shoulders", "Externally rotates and stabilizes the shoulder."],
  ["teres_minor", "Teres Minor", "Teres minor", "shoulders", "Assists external shoulder rotation and joint stability."],
  ["subscapularis", "Subscapularis", "Subscapularis", "shoulders", "Internally rotates and stabilizes the shoulder."],

  ["brachialis", "Brachialis", "Brachialis", "arms", "A primary elbow flexor beneath the biceps."],
  ["brachioradialis", "Brachioradialis", "Brachioradialis", "arms", "Flexes the elbow strongly with a neutral or pronated grip."],
  ["anconeus", "Anconeus", "Anconeus", "arms", "Assists elbow extension and stabilizes the elbow joint."],
  ["wrist_flexors", "Wrist Flexors", "Musculi flexores carpi", "arms", "Flex the wrist and support gripping."],
  ["wrist_extensors", "Wrist Extensors", "Musculi extensores carpi", "arms", "Extend and stabilize the wrist during gripping and lifting."],
  ["forearm_pronators", "Forearm Pronators", "Pronator teres et quadratus", "arms", "Rotate the forearm so the palm faces down."],
  ["forearm_supinators", "Forearm Supinators", "Supinator", "arms", "Rotate the forearm so the palm faces up."],
  ["finger_flexors", "Finger Flexors", "Musculi flexores digitorum", "arms", "Close the hand and produce grip force."],
  ["finger_extensors", "Finger Extensors", "Musculi extensores digitorum", "arms", "Open the hand and balance the gripping muscles."],

  ["external_obliques", "External Obliques", "Obliquus externus abdominis", "core", "Rotate and side-bend the trunk while resisting unwanted motion."],
  ["internal_obliques", "Internal Obliques", "Obliquus internus abdominis", "core", "Assist trunk rotation, side bending, and abdominal bracing."],
  ["transverse_abdominis", "Transverse Abdominis", "Transversus abdominis", "core", "Compresses the abdomen and supports deep trunk bracing."],
  ["diaphragm", "Diaphragm", "Diaphragma", "core", "Primary breathing muscle that contributes to pressure and trunk stability."],

  ["sternocleidomastoid", "Sternocleidomastoid", "Sternocleidomastoideus", "neck", "Flexes and rotates the head and neck."],
  ["scalenes", "Scalenes", "Musculi scaleni", "neck", "Assist neck flexion and lateral flexion and support breathing."],
  ["splenius", "Splenius Muscles", "Splenius capitis et cervicis", "neck", "Extend and rotate the head and neck."],
  ["deep_neck_flexors", "Deep Neck Flexors", "Longus capitis et longus colli", "neck", "Stabilize the cervical spine and support a neutral head position."],
] as const

type AdditionalMuscleKey = (typeof additionalMuscleDefinitions)[number][0]
export type MuscleKey = keyof typeof BASE_MUSCLE_IDS | AdditionalMuscleKey

const additionalMuscleIds = Object.fromEntries(
  additionalMuscleDefinitions.map(([key]) => [key, deterministicUuid("gym-quest-muscle", key)]),
) as Record<AdditionalMuscleKey, string>

export const MUSCLE_IDS: Record<MuscleKey, string> = {
  ...BASE_MUSCLE_IDS,
  ...additionalMuscleIds,
}

export const ADDITIONAL_MUSCLES = additionalMuscleDefinitions.map(
  ([key, name, latinName, group, description]) => ({
    id: MUSCLE_IDS[key],
    name,
    latinName,
    muscleGroupId: GROUP_IDS[group],
    description,
  }),
) satisfies InsertMuscle[]

type ExerciseDefinition = {
  name: string
  muscles: MuscleKey[]
  description: string
}

function movements(
  names: string[],
  muscles: MuscleKey[],
  description: string,
): ExerciseDefinition[] {
  return names.map((name) => ({ name, muscles, description }))
}

const additionalExerciseDefinitions: ExerciseDefinition[] = [
  // Chest presses and flyes
  ...movements(
    [
      "Incline Barbell Bench Press",
      "Decline Barbell Bench Press",
      "Wide-Grip Barbell Bench Press",
      "Spoto Press",
      "Larsen Press",
      "Barbell Floor Press",
      "Barbell Pin Press",
      "Barbell Board Press",
      "Guillotine Press",
    ],
    ["pectoralis_major", "triceps_brachii", "anterior_deltoid"],
    "Press the bar through a controlled range while keeping the shoulder blades stable and the wrists stacked.",
  ),
  ...movements(
    ["Close-Grip Barbell Bench Press", "JM Press"],
    ["triceps_brachii", "pectoralis_major", "anterior_deltoid", "anconeus"],
    "Use a close grip and controlled elbow bend to emphasize elbow extension without losing shoulder position.",
  ),
  ...movements(
    [
      "Dumbbell Bench Press",
      "Incline Dumbbell Bench Press",
      "Decline Dumbbell Bench Press",
      "Neutral-Grip Dumbbell Bench Press",
      "Alternating Dumbbell Bench Press",
      "Single-Arm Dumbbell Bench Press",
      "Dumbbell Floor Press",
      "Dumbbell Squeeze Press",
    ],
    ["pectoralis_major", "triceps_brachii", "anterior_deltoid", "serratus_anterior"],
    "Press the dumbbell resistance while controlling each shoulder and maintaining a braced trunk.",
  ),
  ...movements(
    [
      "Machine Chest Press",
      "Incline Machine Chest Press",
      "Decline Machine Chest Press",
      "Plate-Loaded Chest Press",
      "Smith Machine Bench Press",
      "Smith Machine Incline Bench Press",
      "Smith Machine Decline Bench Press",
    ],
    ["pectoralis_major", "triceps_brachii", "anterior_deltoid"],
    "Press through the machine path with a controlled eccentric and stable shoulder blades.",
  ),
  ...movements(
    ["Standing Cable Chest Press", "Seated Cable Chest Press", "Single-Arm Cable Chest Press", "Cable Crossover Press"],
    ["pectoralis_major", "triceps_brachii", "anterior_deltoid", "serratus_anterior"],
    "Press the cable forward without allowing the ribs or pelvis to rotate.",
  ),
  ...movements(
    [
      "Dumbbell Fly",
      "Incline Dumbbell Fly",
      "Decline Dumbbell Fly",
      "Cable Fly",
      "Low-to-High Cable Fly",
      "High-to-Low Cable Fly",
      "Single-Arm Cable Fly",
      "Pec Deck Fly",
      "Machine Fly",
      "Ring Fly",
    ],
    ["pectoralis_major", "pectoralis_minor", "anterior_deltoid"],
    "Bring the arms together in a wide arc while keeping a soft elbow bend and controlling the chest stretch.",
  ),
  ...movements(
    ["Chest Dip", "Ring Dip", "Straight-Bar Dip", "Bench Dip"],
    ["pectoralis_major", "triceps_brachii", "anterior_deltoid", "pectoralis_minor"],
    "Lower between the supports under control and press back to a stable lockout.",
  ),
  ...movements(
    [
      "Knee Push-Up",
      "Incline Push-Up",
      "Decline Push-Up",
      "Wide Push-Up",
      "Diamond Push-Up",
      "Close-Grip Push-Up",
      "Deficit Push-Up",
      "Weighted Push-Up",
      "Resistance-Band Push-Up",
      "Archer Push-Up",
      "One-Arm Push-Up",
      "Staggered Push-Up",
      "Spiderman Push-Up",
      "Hand-Release Push-Up",
      "Clap Push-Up",
      "Plyometric Push-Up",
      "Medicine-Ball Push-Up",
      "Ring Push-Up",
      "Suspension-Trainer Push-Up",
      "Scapular Push-Up",
    ],
    ["pectoralis_major", "triceps_brachii", "anterior_deltoid", "serratus_anterior", "rectus_abdominis"],
    "Maintain a rigid body line as the chest lowers and presses away from the support.",
  ),

  // Back, vertical pulls, rows, and posterior-chain work
  ...movements(
    ["Conventional Deadlift", "Sumo Deadlift", "Trap-Bar Deadlift", "Deficit Deadlift", "Snatch-Grip Deadlift", "Paused Deadlift"],
    ["gluteus_maximus", "hamstrings", "quadriceps", "erector_spinae", "latissimus_dorsi", "middle_trapezius", "finger_flexors"],
    "Brace the trunk, push through the floor, and extend the hips while keeping the load close to the body.",
  ),
  ...movements(
    ["Rack Pull", "Block Pull", "Barbell Hip Hinge"],
    ["gluteus_maximus", "hamstrings", "erector_spinae", "latissimus_dorsi", "upper_trapezius", "finger_flexors"],
    "Drive the hips forward from a braced hinge while keeping the resistance close.",
  ),
  ...movements(
    [
      "Barbell Bent-Over Row",
      "Pendlay Row",
      "Yates Row",
      "Underhand Barbell Row",
      "Wide-Grip Barbell Row",
      "Seal Row",
      "Chest-Supported Barbell Row",
      "Meadows Row",
      "T-Bar Row",
      "Landmine Row",
    ],
    ["latissimus_dorsi", "middle_trapezius", "rhomboids", "posterior_deltoid", "biceps_brachii", "brachialis", "erector_spinae"],
    "Row toward the torso while keeping the trunk braced and drawing the shoulder blades back under control.",
  ),
  ...movements(
    [
      "One-Arm Dumbbell Row",
      "Chest-Supported Dumbbell Row",
      "Incline Dumbbell Row",
      "Dumbbell Gorilla Row",
      "Renegade Row",
      "Tripod Dumbbell Row",
    ],
    ["latissimus_dorsi", "middle_trapezius", "rhomboids", "posterior_deltoid", "biceps_brachii", "brachialis", "transverse_abdominis"],
    "Pull the dumbbell toward the hip or lower ribs without twisting away from a stable torso.",
  ),
  ...movements(
    [
      "Seated Cable Row",
      "Wide-Grip Seated Cable Row",
      "Close-Grip Seated Cable Row",
      "Single-Arm Cable Row",
      "High Cable Row",
      "Low Cable Row",
      "Standing Cable Row",
      "Machine Row",
      "Chest-Supported Machine Row",
      "Iso-Lateral Machine Row",
      "Suspension-Trainer Row",
      "Ring Row",
      "Inverted Row",
      "Feet-Elevated Inverted Row",
    ],
    ["latissimus_dorsi", "middle_trapezius", "rhomboids", "posterior_deltoid", "biceps_brachii", "brachialis"],
    "Lead with the elbows and finish the row without shrugging or overextending the lower back.",
  ),
  ...movements(
    [
      "Chin-Up",
      "Neutral-Grip Pull-Up",
      "Wide-Grip Pull-Up",
      "Close-Grip Pull-Up",
      "Commando Pull-Up",
      "Weighted Pull-Up",
      "Weighted Chin-Up",
      "Assisted Pull-Up",
      "Band-Assisted Pull-Up",
      "Eccentric Pull-Up",
      "Sternum Pull-Up",
      "Archer Pull-Up",
      "L-Sit Pull-Up",
      "Scapular Pull-Up",
    ],
    ["latissimus_dorsi", "teres_major", "biceps_brachii", "brachialis", "brachioradialis", "lower_trapezius", "finger_flexors"],
    "Pull the body toward the bar by driving the elbows down, then lower with control to a stable hang.",
  ),
  ...movements(
    [
      "Lat Pulldown",
      "Wide-Grip Lat Pulldown",
      "Close-Grip Lat Pulldown",
      "Neutral-Grip Lat Pulldown",
      "Underhand Lat Pulldown",
      "Single-Arm Lat Pulldown",
      "Half-Kneeling Single-Arm Pulldown",
      "Machine Pulldown",
      "Band Lat Pulldown",
    ],
    ["latissimus_dorsi", "teres_major", "biceps_brachii", "brachialis", "lower_trapezius"],
    "Draw the elbow toward the side of the torso while keeping the ribs stacked and the neck relaxed.",
  ),
  ...movements(
    ["Straight-Arm Cable Pulldown", "Cable Pullover", "Dumbbell Pullover", "Machine Pullover", "Resistance-Band Pullover"],
    ["latissimus_dorsi", "teres_major", "pectoralis_major", "triceps_brachii", "rectus_abdominis"],
    "Move the arms toward the torso without turning the exercise into an elbow-flexion movement or arching the back.",
  ),
  ...movements(
    ["Barbell Shrug", "Dumbbell Shrug", "Trap-Bar Shrug", "Cable Shrug", "Machine Shrug", "Behind-the-Back Barbell Shrug", "Overhead Shrug"],
    ["upper_trapezius", "levator_scapulae", "finger_flexors"],
    "Elevate the shoulder blades under control without rolling the shoulders or thrusting the head forward.",
  ),
  ...movements(
    ["Back Extension", "45-Degree Back Extension", "Weighted Back Extension", "Reverse Hyperextension", "Superman Hold", "Bird Dog"],
    ["erector_spinae", "multifidus", "gluteus_maximus", "hamstrings", "quadratus_lumborum"],
    "Extend or stabilize the trunk from a braced position without forcing excessive lumbar range.",
  ),
  ...movements(
    ["Barbell Good Morning", "Safety-Bar Good Morning", "Seated Good Morning", "Banded Good Morning"],
    ["hamstrings", "gluteus_maximus", "erector_spinae", "multifidus"],
    "Hinge at the hips with a braced spine until the hamstrings load, then return by extending the hips.",
  ),

  // Shoulders and rotator cuff
  ...movements(
    [
      "Barbell Overhead Press",
      "Seated Barbell Overhead Press",
      "Behind-the-Neck Press",
      "Z Press",
      "Bradford Press",
      "Dumbbell Shoulder Press",
      "Seated Dumbbell Shoulder Press",
      "Neutral-Grip Dumbbell Shoulder Press",
      "Single-Arm Dumbbell Shoulder Press",
      "Arnold Press",
      "Machine Shoulder Press",
      "Smith Machine Shoulder Press",
      "Cable Shoulder Press",
      "Resistance-Band Shoulder Press",
      "Bottoms-Up Kettlebell Press",
    ],
    ["anterior_deltoid", "lateral_deltoid", "triceps_brachii", "serratus_anterior", "upper_trapezius", "rectus_abdominis"],
    "Press overhead while keeping the ribs controlled and finishing with a stable shoulder-blade position.",
  ),
  ...movements(
    ["Landmine Press", "Half-Kneeling Landmine Press", "Single-Arm Landmine Press", "Viking Press"],
    ["anterior_deltoid", "pectoralis_major", "triceps_brachii", "serratus_anterior", "external_obliques"],
    "Press along the angled path without rotating the torso or losing pelvic position.",
  ),
  ...movements(
    ["Push Press", "Dumbbell Push Press", "Kettlebell Push Press", "Push Jerk", "Split Jerk"],
    ["quadriceps", "gluteus_maximus", "anterior_deltoid", "lateral_deltoid", "triceps_brachii", "serratus_anterior"],
    "Use a coordinated leg drive to accelerate the load overhead and finish in a stable locked-out position.",
  ),
  ...movements(
    [
      "Dumbbell Lateral Raise",
      "Seated Dumbbell Lateral Raise",
      "Lean-Away Lateral Raise",
      "Cable Lateral Raise",
      "Behind-the-Back Cable Lateral Raise",
      "Machine Lateral Raise",
      "Resistance-Band Lateral Raise",
      "Landmine Lateral Raise",
    ],
    ["lateral_deltoid", "supraspinatus", "upper_trapezius"],
    "Raise the arm out to the side with a soft elbow and controlled shoulder elevation.",
  ),
  ...movements(
    ["Dumbbell Front Raise", "Cable Front Raise", "Plate Front Raise", "Barbell Front Raise", "Resistance-Band Front Raise"],
    ["anterior_deltoid", "pectoralis_major", "serratus_anterior"],
    "Raise the resistance in front without leaning back or shrugging excessively.",
  ),
  ...movements(
    [
      "Bent-Over Reverse Fly",
      "Chest-Supported Reverse Fly",
      "Cable Reverse Fly",
      "Reverse Pec Deck",
      "Rear-Delt Machine Fly",
      "Rear-Delt Dumbbell Row",
      "Rear-Delt Cable Row",
      "Face Pull",
      "Resistance-Band Face Pull",
    ],
    ["posterior_deltoid", "middle_trapezius", "rhomboids", "infraspinatus", "teres_minor"],
    "Move the upper arms back while keeping the shoulder blades controlled and the neck relaxed.",
  ),
  ...movements(
    ["Barbell Upright Row", "Dumbbell Upright Row", "Cable Upright Row", "Kettlebell Upright Row"],
    ["lateral_deltoid", "upper_trapezius", "biceps_brachii"],
    "Pull the resistance upward with the elbows leading, using only a comfortable shoulder range.",
  ),
  ...movements(
    ["Prone Y Raise", "Incline Y Raise", "Cable Y Raise", "Wall Slide", "Scapular Wall Slide"],
    ["lower_trapezius", "serratus_anterior", "supraspinatus", "infraspinatus"],
    "Upwardly rotate the shoulder blades while keeping the ribs controlled and the neck long.",
  ),
  ...movements(
    [
      "Cable External Rotation",
      "Side-Lying Dumbbell External Rotation",
      "Resistance-Band External Rotation",
      "Cable Internal Rotation",
      "Resistance-Band Internal Rotation",
      "Cuban Press",
      "Cable Cuban Rotation",
    ],
    ["infraspinatus", "teres_minor", "subscapularis", "posterior_deltoid"],
    "Rotate the shoulder through a controlled, pain-free range while keeping the upper arm positioned steadily.",
  ),
  ...movements(
    ["Pike Push-Up", "Feet-Elevated Pike Push-Up", "Handstand Push-Up", "Wall Handstand Push-Up"],
    ["anterior_deltoid", "lateral_deltoid", "triceps_brachii", "serratus_anterior", "upper_trapezius"],
    "Lower the head between the hands and press to a stable overhead position while keeping the trunk braced.",
  ),

  // Biceps, triceps, forearms, and grip
  ...movements(
    [
      "Barbell Curl",
      "EZ-Bar Curl",
      "Wide-Grip Barbell Curl",
      "Close-Grip Barbell Curl",
      "Alternating Dumbbell Curl",
      "Seated Dumbbell Curl",
      "Incline Dumbbell Curl",
      "Standing Cable Curl",
      "Straight-Bar Cable Curl",
      "Resistance-Band Curl",
      "Machine Biceps Curl",
    ],
    ["biceps_brachii", "brachialis", "forearm_supinators", "wrist_flexors"],
    "Flex the elbow without swinging the torso, keeping the upper arm controlled throughout the repetition.",
  ),
  ...movements(
    ["Preacher Curl", "EZ-Bar Preacher Curl", "Dumbbell Preacher Curl", "Machine Preacher Curl", "Spider Curl"],
    ["biceps_brachii", "brachialis", "forearm_supinators"],
    "Curl from a supported upper-arm position and control the lengthened range.",
  ),
  ...movements(
    ["Hammer Curl", "Alternating Hammer Curl", "Cross-Body Hammer Curl", "Rope Cable Hammer Curl", "Incline Hammer Curl"],
    ["brachialis", "brachioradialis", "biceps_brachii", "finger_flexors"],
    "Maintain a neutral grip and flex the elbow without allowing the upper arm to drift.",
  ),
  ...movements(
    ["Reverse Barbell Curl", "EZ-Bar Reverse Curl", "Dumbbell Reverse Curl", "Cable Reverse Curl", "Zottman Curl"],
    ["brachioradialis", "brachialis", "biceps_brachii", "wrist_extensors", "forearm_pronators"],
    "Curl with a pronated or rotating grip while keeping the wrists aligned with the forearms.",
  ),
  ...movements(
    ["Concentration Curl", "Bayesian Cable Curl", "High Cable Curl", "Double-Biceps Cable Curl", "Drag Curl", "Waiter Curl"],
    ["biceps_brachii", "brachialis", "forearm_supinators"],
    "Curl through a controlled arc while keeping tension on the elbow flexors rather than moving the shoulder.",
  ),
  ...movements(
    [
      "Cable Triceps Pushdown",
      "Straight-Bar Triceps Pushdown",
      "V-Bar Triceps Pushdown",
      "Reverse-Grip Triceps Pushdown",
      "Single-Arm Cable Pushdown",
      "Resistance-Band Pushdown",
    ],
    ["triceps_brachii", "anconeus"],
    "Extend the elbow to lockout while keeping the upper arm still and the shoulder relaxed.",
  ),
  ...movements(
    [
      "Cable Overhead Triceps Extension",
      "Rope Overhead Triceps Extension",
      "Single-Arm Cable Overhead Triceps Extension",
      "Dumbbell Overhead Triceps Extension",
      "Single-Arm Dumbbell Overhead Triceps Extension",
      "EZ-Bar Overhead Triceps Extension",
      "Resistance-Band Overhead Triceps Extension",
    ],
    ["triceps_brachii", "anconeus"],
    "Extend the elbows from an overhead position while keeping the upper arms steady and the ribs controlled.",
  ),
  ...movements(
    [
      "Barbell Skull Crusher",
      "EZ-Bar Skull Crusher",
      "Dumbbell Skull Crusher",
      "Incline Skull Crusher",
      "Decline Skull Crusher",
      "Rolling Dumbbell Triceps Extension",
      "Tate Press",
    ],
    ["triceps_brachii", "anconeus"],
    "Bend and extend the elbows under control without allowing the upper arms to flare excessively.",
  ),
  ...movements(
    ["Triceps Kickback", "Cable Triceps Kickback", "Resistance-Band Triceps Kickback", "Bodyweight Triceps Extension", "Ring Triceps Extension"],
    ["triceps_brachii", "anconeus", "rectus_abdominis"],
    "Hold the upper arm or body steady while extending the elbow to a controlled lockout.",
  ),
  ...movements(
    ["Barbell Wrist Curl", "Dumbbell Wrist Curl", "Behind-the-Back Wrist Curl", "Cable Wrist Curl"],
    ["wrist_flexors", "finger_flexors"],
    "Flex the wrist through a controlled range while supporting the forearm.",
  ),
  ...movements(
    ["Barbell Reverse Wrist Curl", "Dumbbell Reverse Wrist Curl", "Cable Reverse Wrist Curl"],
    ["wrist_extensors", "finger_extensors"],
    "Extend the wrist through a controlled range while keeping the forearm supported.",
  ),
  ...movements(
    ["Wrist Roller", "Lever Bar Wrist Rotation", "Dumbbell Pronation", "Dumbbell Supination", "Rice-Bucket Hand Drill"],
    ["wrist_flexors", "wrist_extensors", "forearm_pronators", "forearm_supinators", "finger_flexors", "finger_extensors"],
    "Move the wrist or forearm slowly through the intended range without compensating at the elbow or shoulder.",
  ),
  ...movements(
    ["Dead Hang", "Towel Dead Hang", "One-Arm Dead Hang", "Plate Pinch", "Gripper Close", "Barbell Finger Curl", "Towel Pull-Up"],
    ["finger_flexors", "wrist_flexors", "brachioradialis", "latissimus_dorsi"],
    "Maintain a strong, even grip while keeping the wrist aligned and the shoulder safely engaged.",
  ),

  // Squats, lunges, and knee-dominant lower-body work
  ...movements(
    [
      "High-Bar Back Squat",
      "Low-Bar Back Squat",
      "Front Squat",
      "Paused Back Squat",
      "Tempo Back Squat",
      "Box Squat",
      "Pin Squat",
      "Anderson Squat",
      "Safety-Bar Squat",
      "Zercher Squat",
      "Overhead Squat",
      "Snatch-Grip Overhead Squat",
    ],
    ["quadriceps", "gluteus_maximus", "hip_adductors", "hamstrings", "erector_spinae", "rectus_abdominis", "transverse_abdominis"],
    "Descend with the knees tracking over the feet and the trunk braced, then stand by driving through the whole foot.",
  ),
  ...movements(
    [
      "Goblet Squat",
      "Dumbbell Squat",
      "Kettlebell Front Squat",
      "Double-Kettlebell Front Squat",
      "Landmine Squat",
      "Belt Squat",
      "Hack Squat",
      "Pendulum Squat",
      "Smith Machine Squat",
      "Machine Squat",
      "Wall Sit",
      "Sissy Squat",
      "Spanish Squat",
    ],
    ["quadriceps", "gluteus_maximus", "hip_adductors", "rectus_abdominis"],
    "Squat through a controlled, comfortable depth while keeping the feet planted and the knees aligned.",
  ),
  ...movements(
    ["Bodyweight Squat", "Prisoner Squat", "Resistance-Band Squat", "Squat to Box", "Assisted Squat", "Hindu Squat"],
    ["quadriceps", "gluteus_maximus", "hip_adductors", "gastrocnemius", "rectus_abdominis"],
    "Sit between the hips with control and stand tall while maintaining balanced foot pressure.",
  ),
  ...movements(
    ["Pistol Squat", "Assisted Pistol Squat", "Shrimp Squat", "Skater Squat", "Single-Leg Box Squat"],
    ["quadriceps", "gluteus_maximus", "gluteus_medius", "hip_adductors", "gastrocnemius", "rectus_abdominis"],
    "Lower on one leg with the pelvis level and knee aligned, then stand without using momentum.",
  ),
  ...movements(
    [
      "Reverse Lunge",
      "Forward Lunge",
      "Stationary Lunge",
      "Dumbbell Walking Lunge",
      "Barbell Walking Lunge",
      "Deficit Reverse Lunge",
      "Front-Foot-Elevated Split Squat",
      "Bulgarian Split Squat",
      "Dumbbell Bulgarian Split Squat",
      "Barbell Bulgarian Split Squat",
      "Rear-Foot-Elevated Split Squat",
      "Smith Machine Split Squat",
      "Pendulum Lunge",
    ],
    ["quadriceps", "gluteus_maximus", "gluteus_medius", "hip_adductors", "hamstrings", "rectus_abdominis"],
    "Lower into a split stance with the front foot planted and pelvis controlled, then drive back to standing.",
  ),
  ...movements(
    ["Lateral Lunge", "Cossack Squat", "Curtsy Lunge", "Lateral Slider Lunge", "Diagonal Lunge"],
    ["quadriceps", "gluteus_maximus", "gluteus_medius", "gluteus_minimus", "hip_adductors", "tensor_fasciae_latae"],
    "Move into the lateral or diagonal hip while keeping the working foot planted and the knee aligned.",
  ),
  ...movements(
    ["Step-Up", "High Step-Up", "Lateral Step-Up", "Step-Down", "Peterson Step-Up", "Weighted Step-Up"],
    ["quadriceps", "gluteus_maximus", "gluteus_medius", "hip_adductors", "gastrocnemius"],
    "Drive through the working leg onto the platform without pushing excessively from the trailing foot.",
  ),
  ...movements(
    ["Leg Press", "Single-Leg Press", "Narrow-Stance Leg Press", "Wide-Stance Leg Press", "Horizontal Leg Press"],
    ["quadriceps", "gluteus_maximus", "hip_adductors", "hamstrings"],
    "Lower the sled under control while keeping the pelvis supported, then press through the whole foot.",
  ),
  ...movements(
    ["Leg Extension", "Single-Leg Extension", "Resistance-Band Leg Extension", "Reverse Nordic Curl"],
    ["quadriceps"],
    "Extend the knee through a controlled range and avoid using momentum at the top or bottom.",
  ),

  // Hip hinges, hamstrings, glutes, calves, and lower legs
  ...movements(
    [
      "Barbell Romanian Deadlift",
      "Dumbbell Romanian Deadlift",
      "Kettlebell Romanian Deadlift",
      "Single-Leg Romanian Deadlift",
      "Dumbbell Single-Leg Romanian Deadlift",
      "B-Stance Romanian Deadlift",
      "Stiff-Leg Deadlift",
      "Smith Machine Romanian Deadlift",
      "Cable Romanian Deadlift",
    ],
    ["hamstrings", "gluteus_maximus", "erector_spinae", "gluteus_medius", "finger_flexors"],
    "Hinge the hips backward with soft knees until the hamstrings load, then extend the hips without overextending the spine.",
  ),
  ...movements(
    ["Nordic Hamstring Curl", "Assisted Nordic Curl", "Glute-Ham Raise", "Natural Glute-Ham Raise", "Razor Curl"],
    ["hamstrings", "gastrocnemius", "gluteus_maximus"],
    "Control knee extension with the hamstrings and use assistance as needed to preserve alignment.",
  ),
  ...movements(
    ["Lying Leg Curl", "Seated Leg Curl", "Standing Leg Curl", "Single-Leg Curl", "Stability-Ball Leg Curl", "Slider Leg Curl", "Resistance-Band Leg Curl"],
    ["hamstrings", "gastrocnemius"],
    "Flex the knee without lifting or rotating the pelvis, then return slowly to the start.",
  ),
  ...movements(
    [
      "Barbell Hip Thrust",
      "Dumbbell Hip Thrust",
      "Machine Hip Thrust",
      "Smith Machine Hip Thrust",
      "Single-Leg Hip Thrust",
      "B-Stance Hip Thrust",
      "Resistance-Band Hip Thrust",
      "Glute Bridge",
      "Weighted Glute Bridge",
      "Single-Leg Glute Bridge",
      "Frog Pump",
    ],
    ["gluteus_maximus", "hamstrings", "gluteus_medius", "hip_adductors"],
    "Extend the hips to a neutral lockout while keeping the ribs down and the pelvis controlled.",
  ),
  ...movements(
    ["Cable Pull-Through", "Kettlebell Swing", "American Kettlebell Swing", "Band Hip Hinge", "Dumbbell Swing"],
    ["gluteus_maximus", "hamstrings", "erector_spinae", "rectus_abdominis"],
    "Snap the hips forward from a loaded hinge while keeping the arms relaxed and the trunk braced.",
  ),
  ...movements(
    ["Cable Glute Kickback", "Machine Glute Kickback", "Resistance-Band Kickback", "Quadruped Hip Extension", "Donkey Kick"],
    ["gluteus_maximus", "hamstrings", "gluteus_medius"],
    "Extend the hip without rotating the pelvis or arching the lower back.",
  ),
  ...movements(
    ["Machine Hip Abduction", "Cable Hip Abduction", "Side-Lying Hip Abduction", "Banded Lateral Walk", "Monster Walk", "Clamshell", "Fire Hydrant"],
    ["gluteus_medius", "gluteus_minimus", "tensor_fasciae_latae"],
    "Move the thigh outward while keeping the pelvis stacked and the trunk steady.",
  ),
  ...movements(
    ["Machine Hip Adduction", "Cable Hip Adduction", "Side-Lying Hip Adduction", "Copenhagen Plank"],
    ["hip_adductors", "external_obliques", "quadratus_lumborum"],
    "Draw or hold the leg inward without rotating the pelvis or collapsing the trunk.",
  ),
  ...movements(
    ["Standing Calf Raise", "Single-Leg Calf Raise", "Donkey Calf Raise", "Leg-Press Calf Raise", "Smith Machine Calf Raise", "Calf Raise on Step"],
    ["gastrocnemius", "soleus", "fibularis"],
    "Rise onto the ball of the foot, pause at the top, and lower through a controlled ankle range.",
  ),
  ...movements(
    ["Seated Calf Raise", "Bent-Knee Calf Raise", "Soleus Raise"],
    ["soleus", "gastrocnemius"],
    "Plantar flex the ankle with the knee bent and lower slowly into the available stretch.",
  ),
  ...movements(
    ["Tibialis Raise", "Wall Tibialis Raise", "Band Dorsiflexion", "Heel Walk"],
    ["tibialis_anterior"],
    "Lift the forefoot toward the shin and lower it under control while the heel remains planted.",
  ),

  // Core flexion, anti-extension, rotation, and carries
  ...movements(
    ["Crunch", "Weighted Crunch", "Cable Crunch", "Machine Crunch", "Decline Crunch", "Stability-Ball Crunch", "Reverse Crunch", "Bicycle Crunch"],
    ["rectus_abdominis", "external_obliques", "internal_obliques"],
    "Shorten the trunk under control without pulling on the neck or using momentum.",
  ),
  ...movements(
    ["Sit-Up", "Weighted Sit-Up", "Decline Sit-Up", "Butterfly Sit-Up", "V-Up", "Alternating V-Up", "Jackknife Sit-Up"],
    ["rectus_abdominis", "hip_flexors", "external_obliques", "internal_obliques"],
    "Flex the trunk and hips under control, then lower without losing abdominal tension.",
  ),
  ...movements(
    ["Hanging Knee Raise", "Hanging Leg Raise", "Captain's Chair Knee Raise", "Captain's Chair Leg Raise", "Lying Leg Raise", "Incline Leg Raise", "Toes-to-Bar", "Knees-to-Elbows"],
    ["rectus_abdominis", "hip_flexors", "external_obliques", "finger_flexors", "latissimus_dorsi"],
    "Raise the pelvis or legs without swinging, then lower under control while maintaining trunk position.",
  ),
  ...movements(
    ["Forearm Plank", "High Plank", "Long-Lever Plank", "Weighted Plank", "RKC Plank", "Body Saw", "Stir-the-Pot", "Plank Walkout"],
    ["transverse_abdominis", "rectus_abdominis", "external_obliques", "internal_obliques", "diaphragm", "serratus_anterior", "gluteus_maximus"],
    "Brace the entire trunk and maintain a straight body line without allowing the lower back to sag.",
  ),
  ...movements(
    ["Side Plank", "Weighted Side Plank", "Side Plank Hip Lift", "Star Side Plank", "Side Plank Row"],
    ["external_obliques", "internal_obliques", "quadratus_lumborum", "gluteus_medius", "transverse_abdominis"],
    "Hold the body in a straight side-on line while resisting rotation and hip drop.",
  ),
  ...movements(
    ["Ab Wheel Rollout", "Barbell Rollout", "Stability-Ball Rollout", "Ring Rollout", "Bodyweight Fall-Out"],
    ["rectus_abdominis", "transverse_abdominis", "latissimus_dorsi", "serratus_anterior", "triceps_brachii"],
    "Reach forward only as far as the trunk can resist extension, then pull back without hinging at the hips.",
  ),
  ...movements(
    ["Pallof Press", "Half-Kneeling Pallof Press", "Tall-Kneeling Pallof Press", "Pallof Press Hold", "Resistance-Band Anti-Rotation Hold"],
    ["external_obliques", "internal_obliques", "transverse_abdominis", "rectus_abdominis", "gluteus_medius"],
    "Press away from the anchor while resisting trunk rotation and maintaining stacked ribs and pelvis.",
  ),
  ...movements(
    ["Cable Wood Chop", "Low-to-High Cable Chop", "High-to-Low Cable Chop", "Landmine Rotation", "Russian Twist", "Medicine-Ball Rotational Throw"],
    ["external_obliques", "internal_obliques", "rectus_abdominis", "transverse_abdominis", "gluteus_maximus"],
    "Rotate through the trunk and hips in a controlled sequence without forcing range from the lower back.",
  ),
  ...movements(
    ["Dumbbell Side Bend", "Cable Side Bend", "Suitcase Side Bend", "Oblique Crunch", "Side Jackknife"],
    ["external_obliques", "internal_obliques", "quadratus_lumborum"],
    "Move or resist movement in the frontal plane while keeping the hips and shoulders aligned.",
  ),
  ...movements(
    ["Dead Bug", "Weighted Dead Bug", "Hollow-Body Hold", "Hollow-Body Rock", "Bear Plank", "Bear Crawl", "Crab Walk"],
    ["transverse_abdominis", "rectus_abdominis", "external_obliques", "internal_obliques", "hip_flexors", "serratus_anterior"],
    "Maintain abdominal pressure and a stable spine while the arms and legs move.",
  ),
  ...movements(
    ["Farmer's Carry", "Suitcase Carry", "Front-Rack Carry", "Overhead Carry", "Waiter Carry", "Zercher Carry", "Bear-Hug Carry", "Sandbag Carry"],
    ["finger_flexors", "upper_trapezius", "quadratus_lumborum", "transverse_abdominis", "external_obliques", "gluteus_medius", "gastrocnemius"],
    "Walk with controlled steps while maintaining a strong grip, stacked posture, and steady load position.",
  ),

  // Olympic lifts, strongman, power, and conditioning
  ...movements(
    ["Power Clean", "Hang Power Clean", "Clean", "Hang Clean", "Clean Pull", "Clean High Pull", "Muscle Clean"],
    ["quadriceps", "gluteus_maximus", "hamstrings", "gastrocnemius", "upper_trapezius", "anterior_deltoid", "finger_flexors"],
    "Accelerate the bar with coordinated leg and hip extension, then receive or finish it in a balanced position.",
  ),
  ...movements(
    ["Power Snatch", "Hang Power Snatch", "Snatch", "Hang Snatch", "Snatch Pull", "Snatch High Pull", "Muscle Snatch"],
    ["quadriceps", "gluteus_maximus", "hamstrings", "gastrocnemius", "upper_trapezius", "lateral_deltoid", "serratus_anterior", "finger_flexors"],
    "Accelerate the bar vertically with the legs and hips, then receive or finish it overhead with stable shoulders.",
  ),
  ...movements(
    ["Clean and Jerk", "Clean and Press", "Dumbbell Clean", "Dumbbell Clean and Press", "Kettlebell Clean", "Kettlebell Clean and Press", "Kettlebell Snatch", "Dumbbell Snatch"],
    ["quadriceps", "gluteus_maximus", "hamstrings", "upper_trapezius", "anterior_deltoid", "triceps_brachii", "rectus_abdominis"],
    "Move the implement from the floor or hang to the shoulder or overhead using coordinated hip drive and a stable catch.",
  ),
  ...movements(
    ["Turkish Get-Up", "Half Turkish Get-Up", "Kettlebell Windmill", "Dumbbell Windmill", "Bent Press"],
    ["external_obliques", "internal_obliques", "quadratus_lumborum", "gluteus_medius", "anterior_deltoid", "serratus_anterior", "triceps_brachii"],
    "Move through the multi-stage pattern while keeping the loaded arm stable and the eyes oriented toward the implement.",
  ),
  ...movements(
    ["Barbell Thruster", "Dumbbell Thruster", "Kettlebell Thruster", "Wall Ball", "Devil Press", "Man Maker"],
    ["quadriceps", "gluteus_maximus", "anterior_deltoid", "triceps_brachii", "rectus_abdominis", "erector_spinae"],
    "Link lower-body extension to an overhead press while keeping the load balanced and the trunk braced.",
  ),
  ...movements(
    ["Atlas Stone Lift", "Sandbag to Shoulder", "Log Clean and Press", "Axle Clean and Press", "Tire Flip", "Keg Carry", "Yoke Walk"],
    ["quadriceps", "gluteus_maximus", "hamstrings", "erector_spinae", "upper_trapezius", "biceps_brachii", "finger_flexors", "transverse_abdominis"],
    "Brace around the awkward load and use coordinated leg and hip drive to lift, carry, or press it safely.",
  ),
  ...movements(
    ["Sled Push", "Sled Drag", "Backward Sled Drag", "Rope Sled Pull", "Prowler Sprint"],
    ["quadriceps", "gluteus_maximus", "hamstrings", "gastrocnemius", "rectus_abdominis", "serratus_anterior"],
    "Drive through the ground with short, powerful steps while maintaining the chosen torso and arm position.",
  ),
  ...movements(
    ["Battle Rope Waves", "Alternating Battle Rope Waves", "Battle Rope Slams", "Battle Rope Circles"],
    ["anterior_deltoid", "lateral_deltoid", "latissimus_dorsi", "rectus_abdominis", "external_obliques", "finger_flexors"],
    "Create continuous rope motion from a braced stance without losing shoulder or trunk control.",
  ),
  ...movements(
    ["Box Jump", "Broad Jump", "Squat Jump", "Tuck Jump", "Depth Jump", "Lateral Bound", "Single-Leg Hop", "Jumping Lunge"],
    ["quadriceps", "gluteus_maximus", "hamstrings", "gastrocnemius", "soleus", "gluteus_medius"],
    "Produce a powerful jump and land quietly with the hips, knees, and ankles aligned.",
  ),
  ...movements(
    ["Burpee", "Burpee Box Jump", "Burpee Pull-Up", "Squat Thrust", "Cross-Body Mountain Climber"],
    ["quadriceps", "gluteus_maximus", "pectoralis_major", "triceps_brachii", "rectus_abdominis", "hip_flexors"],
    "Move between the floor and standing positions with a braced trunk and controlled foot placement.",
  ),
  ...movements(
    ["Jumping Jack", "Seal Jack", "Skater Jump", "High Knees", "Butt Kicks", "Lateral Shuffle"],
    ["quadriceps", "gluteus_medius", "hip_flexors", "hamstrings", "gastrocnemius", "soleus"],
    "Maintain a steady rhythm and athletic alignment while moving repeatedly through the conditioning pattern.",
  ),
  ...movements(
    ["Running", "Treadmill Run", "Hill Sprint", "Track Sprint", "Shuttle Run", "Stair Climb", "StepMill", "Cycling", "Air Bike", "Rowing Machine", "Ski Erg", "Elliptical Trainer", "Jump Rope", "Double-Under"],
    ["quadriceps", "gluteus_maximus", "hamstrings", "hip_flexors", "sartorius", "gastrocnemius", "soleus", "rectus_abdominis"],
    "Use efficient repeated motion and a sustainable posture for the intended conditioning intensity.",
  ),

  // Neck training and mobility-oriented strength
  ...movements(
    ["Neck Flexion", "Lying Neck Flexion", "Resistance-Band Neck Flexion"],
    ["sternocleidomastoid", "scalenes", "deep_neck_flexors"],
    "Flex the neck gently through a controlled range without jutting the chin forward.",
  ),
  ...movements(
    ["Neck Extension", "Lying Neck Extension", "Resistance-Band Neck Extension"],
    ["splenius", "upper_trapezius", "levator_scapulae"],
    "Extend the neck gently through a controlled range without compressing into an end position.",
  ),
  ...movements(
    ["Neck Lateral Flexion", "Resistance-Band Neck Lateral Flexion", "Neck Rotation", "Resistance-Band Neck Rotation"],
    ["sternocleidomastoid", "scalenes", "splenius", "deep_neck_flexors"],
    "Move or resist the head slowly while keeping the shoulders level and the jaw relaxed.",
  ),
  ...movements(
    ["Chin Tuck", "Wall Chin Tuck", "Neck Isometric Hold"],
    ["deep_neck_flexors", "sternocleidomastoid", "scalenes"],
    "Draw the head gently back to a neutral stacked position and hold without forceful neck motion.",
  ),
]

export const ADDITIONAL_EXERCISES = additionalExerciseDefinitions.map(({ name, description }) => ({
  id: deterministicUuid("gym-quest-exercise", name.toLocaleLowerCase("en-US")),
  name,
  description,
  isPublic: true,
  userId: null,
})) satisfies InsertExercise[]

export const ADDITIONAL_EXERCISE_MUSCLES = additionalExerciseDefinitions.flatMap((definition) => {
  const exerciseId = deterministicUuid("gym-quest-exercise", definition.name.toLocaleLowerCase("en-US"))

  return definition.muscles.map((muscleKey) => [exerciseId, MUSCLE_IDS[muscleKey]] as [string, string])
})

export function validateAdditionalExerciseCatalog() {
  const duplicateValues = (values: string[]) => {
    const seen = new Set<string>()
    const duplicates = new Set<string>()

    for (const value of values) {
      const normalized = value.trim().toLocaleLowerCase("en-US")
      if (seen.has(normalized)) duplicates.add(value)
      seen.add(normalized)
    }

    return [...duplicates]
  }

  const duplicateMuscles = duplicateValues(ADDITIONAL_MUSCLES.map(({ name }) => name))
  const duplicateExercises = duplicateValues(ADDITIONAL_EXERCISES.map(({ name }) => name))
  const exerciseIds = new Set(ADDITIONAL_EXERCISES.map(({ id }) => id))
  const muscleIds = new Set(Object.values(MUSCLE_IDS))
  const invalidLinks = ADDITIONAL_EXERCISE_MUSCLES.filter(
    ([exerciseId, muscleId]) => !exerciseIds.has(exerciseId) || !muscleIds.has(muscleId),
  )

  if (duplicateMuscles.length > 0 || duplicateExercises.length > 0 || invalidLinks.length > 0) {
    throw new Error(
      `Invalid exercise catalog: ${duplicateMuscles.length} duplicate muscles, ${duplicateExercises.length} duplicate exercises, and ${invalidLinks.length} invalid links.`,
    )
  }
}
