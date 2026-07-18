import { drizzle } from "drizzle-orm/postgres-js";
import { inArray } from "drizzle-orm";
import nextEnv from "@next/env";
import postgres from "postgres";

import {
  muscle,
  muscleGroup,
  type InsertMuscle,
  type InsertMuscleGroup,
} from "./schema/body";
import {
  exercise,
  exerciseToMuscle,
  type InsertExercise,
} from "./schema/exercise";
import {
  userPrivateInformation,
  userProfile,
  users,
  type NewUser,
} from "./schema/user";
import {
  workout,
  workoutSet,
  workoutSetCollection,
  type InsertWorkout,
  type InsertWorkoutSet,
  type InsertWorkoutSetCollection,
} from "./schema/workout";
import { badge } from "./schema/badges";
import { BADGE_DEFINITIONS } from "@/variables/badges";
import { SYSTEM_USER_ID } from "@/variables/auth";
import {
  ADDITIONAL_EXERCISES,
  ADDITIONAL_EXERCISE_MUSCLES,
  ADDITIONAL_MUSCLES,
  ADDITIONAL_MUSCLE_GROUPS,
  validateAdditionalExerciseCatalog,
} from "./exercise-catalog";

nextEnv.loadEnvConfig(process.cwd());
const { env } = await import("@/env");

const seedArguments = new Set(process.argv.slice(2));
const catalogOnly = seedArguments.has("--catalog-only");
const productionImport = seedArguments.has("--production");

function getDatabaseConfiguration() {
  if (!productionImport) {
    return {
      connectionString: env.DATABASE_URL,
      ssl: env.DATABASE_SSL,
    };
  }

  const connectionString = env.PRODUCTION_DATABASE_URL ?? env.DATABASE_URL;

  const hostname = new URL(connectionString).hostname.toLocaleLowerCase("en-US");
  if (["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    throw new Error("The production catalog import refuses to use a localhost database URL.");
  }

  return {
    connectionString,
    ssl: env.PRODUCTION_DATABASE_URL
      ? env.PRODUCTION_DATABASE_SSL ?? "require"
      : env.DATABASE_SSL,
  };
}

const muscleGroups = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Chest",
    description: "Pressing muscles used for horizontal and angled pushing.",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Back",
    description: "Pulling muscles that support rows, pull-ups, and posture.",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Legs",
    description: "Lower-body muscles for squats, hinges, lunges, and jumps.",
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "Shoulders",
    description: "Deltoids and stabilizers used for overhead pressing and raises.",
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    name: "Arms",
    description: "Biceps, triceps, and forearms for curls, extensions, and grip.",
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    name: "Core",
    description: "Trunk muscles for bracing, rotation, and anti-extension.",
  },
] satisfies InsertMuscleGroup[];

const muscles = [
  {
    id: "11000000-0000-4000-8000-000000000001",
    name: "Pectoralis Major",
    latinName: "Pectoralis major",
    muscleGroupId: "10000000-0000-4000-8000-000000000001",
    description: "Primary chest muscle used in presses and push-ups.",
  },
  {
    id: "11000000-0000-4000-8000-000000000002",
    name: "Latissimus Dorsi",
    latinName: "Latissimus dorsi",
    muscleGroupId: "10000000-0000-4000-8000-000000000002",
    description: "Large back muscle used in vertical and horizontal pulling.",
  },
  {
    id: "11000000-0000-4000-8000-000000000003",
    name: "Middle Trapezius",
    latinName: "Trapezius, transverse fibers",
    muscleGroupId: "10000000-0000-4000-8000-000000000002",
    description: "Retracts and stabilizes the shoulder blades during rows and horizontal pulls.",
  },
  {
    id: "11000000-0000-4000-8000-000000000004",
    name: "Quadriceps",
    latinName: "Quadriceps femoris",
    muscleGroupId: "10000000-0000-4000-8000-000000000003",
    description: "Front thigh muscles used in squats, lunges, and leg presses.",
  },
  {
    id: "11000000-0000-4000-8000-000000000005",
    name: "Hamstrings",
    latinName: "Ischiocrural muscles",
    muscleGroupId: "10000000-0000-4000-8000-000000000003",
    description: "Posterior thigh muscles used in hinges and knee flexion.",
  },
  {
    id: "11000000-0000-4000-8000-000000000006",
    name: "Gluteus Maximus",
    latinName: "Gluteus maximus",
    muscleGroupId: "10000000-0000-4000-8000-000000000003",
    description: "Primary hip extension muscle used in squats, hinges, and bridges.",
  },
  {
    id: "11000000-0000-4000-8000-000000000007",
    name: "Anterior Deltoid",
    latinName: "Deltoideus, pars clavicularis",
    muscleGroupId: "10000000-0000-4000-8000-000000000004",
    description: "Front shoulder fibers used in pressing and forward arm elevation.",
  },
  {
    id: "11000000-0000-4000-8000-000000000008",
    name: "Biceps",
    latinName: "Biceps brachii",
    muscleGroupId: "10000000-0000-4000-8000-000000000005",
    description: "Upper-arm pulling muscle used in curls and rows.",
  },
  {
    id: "11000000-0000-4000-8000-000000000009",
    name: "Triceps",
    latinName: "Triceps brachii",
    muscleGroupId: "10000000-0000-4000-8000-000000000005",
    description: "Upper-arm pushing muscle used in presses and extensions.",
  },
  {
    id: "11000000-0000-4000-8000-000000000010",
    name: "Rectus Abdominis",
    latinName: "Rectus abdominis",
    muscleGroupId: "10000000-0000-4000-8000-000000000006",
    description: "Front core muscle used in flexion and bracing.",
  },
] satisfies InsertMuscle[];

const exercises = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    name: "Barbell Bench Press",
    description: "Lie on a bench and press a barbell from chest level to full arm extension.",
    isPublic: true,
    userId: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    name: "Push-Up",
    description: "Keep a straight body line while lowering the chest toward the floor and pressing back up.",
    isPublic: true,
    userId: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    name: "Pull-Up",
    description: "Hang from a bar and pull until the chin clears the bar, then lower under control.",
    isPublic: true,
    userId: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    name: "Bent-Over Row",
    description: "Hinge at the hips and row the weight toward the torso while keeping the back braced.",
    isPublic: true,
    userId: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    name: "Back Squat",
    description: "Squat with a barbell across the upper back, keeping the torso braced and knees tracking.",
    isPublic: true,
    userId: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    name: "Romanian Deadlift",
    description: "Hinge at the hips with soft knees and lower the weight until the hamstrings are loaded.",
    isPublic: true,
    userId: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000007",
    name: "Walking Lunge",
    description: "Step forward into alternating lunges while keeping the torso tall and front foot planted.",
    isPublic: true,
    userId: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000008",
    name: "Overhead Press",
    description: "Press a barbell or dumbbells from shoulder height to overhead while bracing the core.",
    isPublic: true,
    userId: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000009",
    name: "Dumbbell Curl",
    description: "Curl dumbbells toward the shoulders while keeping elbows close to the sides.",
    isPublic: true,
    userId: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000010",
    name: "Triceps Rope Pushdown",
    description: "Extend the elbows against a cable rope while keeping the upper arms still.",
    isPublic: true,
    userId: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000011",
    name: "Plank",
    description: "Hold a straight line from shoulders to ankles while bracing the core.",
    isPublic: true,
    userId: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000012",
    name: "Mountain Climber",
    description: "From a plank position, alternate driving knees toward the chest at a steady tempo.",
    isPublic: true,
    userId: null,
  },
] satisfies InsertExercise[];

const exerciseMuscles = [
  ["20000000-0000-4000-8000-000000000001", "11000000-0000-4000-8000-000000000001"],
  ["20000000-0000-4000-8000-000000000001", "11000000-0000-4000-8000-000000000009"],
  ["20000000-0000-4000-8000-000000000002", "11000000-0000-4000-8000-000000000001"],
  ["20000000-0000-4000-8000-000000000002", "11000000-0000-4000-8000-000000000009"],
  ["20000000-0000-4000-8000-000000000003", "11000000-0000-4000-8000-000000000002"],
  ["20000000-0000-4000-8000-000000000003", "11000000-0000-4000-8000-000000000008"],
  ["20000000-0000-4000-8000-000000000004", "11000000-0000-4000-8000-000000000002"],
  ["20000000-0000-4000-8000-000000000004", "11000000-0000-4000-8000-000000000003"],
  ["20000000-0000-4000-8000-000000000005", "11000000-0000-4000-8000-000000000004"],
  ["20000000-0000-4000-8000-000000000005", "11000000-0000-4000-8000-000000000006"],
  ["20000000-0000-4000-8000-000000000006", "11000000-0000-4000-8000-000000000005"],
  ["20000000-0000-4000-8000-000000000006", "11000000-0000-4000-8000-000000000006"],
  ["20000000-0000-4000-8000-000000000007", "11000000-0000-4000-8000-000000000004"],
  ["20000000-0000-4000-8000-000000000007", "11000000-0000-4000-8000-000000000006"],
  ["20000000-0000-4000-8000-000000000008", "11000000-0000-4000-8000-000000000007"],
  ["20000000-0000-4000-8000-000000000008", "11000000-0000-4000-8000-000000000009"],
  ["20000000-0000-4000-8000-000000000009", "11000000-0000-4000-8000-000000000008"],
  ["20000000-0000-4000-8000-000000000010", "11000000-0000-4000-8000-000000000009"],
  ["20000000-0000-4000-8000-000000000011", "11000000-0000-4000-8000-000000000010"],
  ["20000000-0000-4000-8000-000000000012", "11000000-0000-4000-8000-000000000010"],
] satisfies [string, string][];

const catalogMuscleGroups = [...muscleGroups, ...ADDITIONAL_MUSCLE_GROUPS];
const catalogMuscles = [...muscles, ...ADDITIONAL_MUSCLES];
const catalogExercises = [...exercises, ...ADDITIONAL_EXERCISES];
const catalogExerciseMuscles = [...exerciseMuscles, ...ADDITIONAL_EXERCISE_MUSCLES];

function validateCatalog() {
  validateAdditionalExerciseCatalog();

  const assertUnique = (label: string, values: string[]) => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const value of values) {
      const normalized = value.trim().toLocaleLowerCase("en-US");
      if (seen.has(normalized)) duplicates.add(value);
      seen.add(normalized);
    }

    if (duplicates.size > 0) {
      throw new Error(`Duplicate ${label}: ${[...duplicates].join(", ")}`);
    }
  };

  assertUnique("muscle group names", catalogMuscleGroups.map(({ name }) => name));
  assertUnique("muscle names", catalogMuscles.map(({ name }) => name));
  assertUnique("exercise names", catalogExercises.map(({ name }) => name));
  assertUnique("muscle IDs", catalogMuscles.map(({ id }) => id!));
  assertUnique("exercise IDs", catalogExercises.map(({ id }) => id!));

  const exerciseIds = new Set(catalogExercises.map(({ id }) => id));
  const muscleIds = new Set(catalogMuscles.map(({ id }) => id));
  const invalidLinks = catalogExerciseMuscles.filter(
    ([exerciseId, muscleId]) => !exerciseIds.has(exerciseId) || !muscleIds.has(muscleId),
  );

  if (invalidLinks.length > 0) {
    throw new Error(`Catalog contains ${invalidLinks.length} exercise-to-muscle links with missing records.`);
  }
}

const workouts = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    name: "Beginner Full Body",
    description: "A simple strength foundation using squat, push, pull, hinge, and core work.",
    category: "Strength",
    isPublic: true,
    userId: SYSTEM_USER_ID,
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    name: "Upper Body Strength",
    description: "A balanced upper-body session for pressing, pulling, shoulders, and arms.",
    category: "Strength",
    isPublic: true,
    userId: SYSTEM_USER_ID,
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    name: "Lower Body Builder",
    description: "A lower-body workout built around squat, hinge, and single-leg patterns.",
    category: "Hypertrophy",
    isPublic: true,
    userId: SYSTEM_USER_ID,
  },
  {
    id: "30000000-0000-4000-8000-000000000004",
    name: "Quick Conditioning",
    description: "A short bodyweight circuit for movement, stamina, and core control.",
    category: "Conditioning",
    isPublic: true,
    userId: SYSTEM_USER_ID,
  },
] satisfies InsertWorkout[];

const workoutSets = [
  { id: "31000000-0000-4000-8000-000000000001", workoutId: "30000000-0000-4000-8000-000000000001", order: 0 },
  { id: "31000000-0000-4000-8000-000000000002", workoutId: "30000000-0000-4000-8000-000000000001", order: 1 },
  { id: "31000000-0000-4000-8000-000000000003", workoutId: "30000000-0000-4000-8000-000000000001", order: 2 },
  { id: "31000000-0000-4000-8000-000000000004", workoutId: "30000000-0000-4000-8000-000000000002", order: 0 },
  { id: "31000000-0000-4000-8000-000000000005", workoutId: "30000000-0000-4000-8000-000000000002", order: 1 },
  { id: "31000000-0000-4000-8000-000000000006", workoutId: "30000000-0000-4000-8000-000000000002", order: 2 },
  { id: "31000000-0000-4000-8000-000000000007", workoutId: "30000000-0000-4000-8000-000000000003", order: 0 },
  { id: "31000000-0000-4000-8000-000000000008", workoutId: "30000000-0000-4000-8000-000000000003", order: 1 },
  { id: "31000000-0000-4000-8000-000000000009", workoutId: "30000000-0000-4000-8000-000000000004", order: 0 },
  { id: "31000000-0000-4000-8000-000000000010", workoutId: "30000000-0000-4000-8000-000000000004", order: 1 },
] satisfies InsertWorkoutSet[];

const workoutSetCollections = [
  collection("32000000-0000-4000-8000-000000000001", "20000000-0000-4000-8000-000000000005", "31000000-0000-4000-8000-000000000001", [20, 25, 30], [8, 8, 8], [90, 90, 120], 0),
  collection("32000000-0000-4000-8000-000000000002", "20000000-0000-4000-8000-000000000001", "31000000-0000-4000-8000-000000000002", [20, 25, 30], [8, 8, 8], [90, 90, 120], 0),
  collection("32000000-0000-4000-8000-000000000003", "20000000-0000-4000-8000-000000000004", "31000000-0000-4000-8000-000000000002", [20, 25, 30], [10, 10, 10], [90, 90, 120], 1),
  collection("32000000-0000-4000-8000-000000000004", "20000000-0000-4000-8000-000000000011", "31000000-0000-4000-8000-000000000003", [0, 0, 0], [0, 0, 0], [45, 45, 60], 0, [30, 30, 45]),
  collection("32000000-0000-4000-8000-000000000005", "20000000-0000-4000-8000-000000000001", "31000000-0000-4000-8000-000000000004", [30, 35, 40, 40], [6, 6, 6, 6], [120, 120, 120, 150], 0),
  collection("32000000-0000-4000-8000-000000000006", "20000000-0000-4000-8000-000000000003", "31000000-0000-4000-8000-000000000004", [0, 0, 0, 0], [5, 5, 5, 5], [120, 120, 120, 150], 1),
  collection("32000000-0000-4000-8000-000000000007", "20000000-0000-4000-8000-000000000008", "31000000-0000-4000-8000-000000000005", [15, 17, 20], [8, 8, 8], [90, 90, 120], 0),
  collection("32000000-0000-4000-8000-000000000008", "20000000-0000-4000-8000-000000000009", "31000000-0000-4000-8000-000000000006", [8, 10, 10], [12, 12, 12], [60, 60, 90], 0),
  collection("32000000-0000-4000-8000-000000000009", "20000000-0000-4000-8000-000000000010", "31000000-0000-4000-8000-000000000006", [15, 17, 20], [12, 12, 12], [60, 60, 90], 1),
  collection("32000000-0000-4000-8000-000000000010", "20000000-0000-4000-8000-000000000005", "31000000-0000-4000-8000-000000000007", [30, 40, 45, 45], [8, 8, 8, 8], [120, 120, 120, 150], 0),
  collection("32000000-0000-4000-8000-000000000011", "20000000-0000-4000-8000-000000000006", "31000000-0000-4000-8000-000000000007", [30, 40, 45], [10, 10, 10], [120, 120, 150], 1),
  collection("32000000-0000-4000-8000-000000000012", "20000000-0000-4000-8000-000000000007", "31000000-0000-4000-8000-000000000008", [0, 0, 0], [12, 12, 12], [75, 75, 90], 0),
  collection("32000000-0000-4000-8000-000000000013", "20000000-0000-4000-8000-000000000002", "31000000-0000-4000-8000-000000000009", [0, 0, 0], [12, 12, 12], [30, 30, 45], 0),
  collection("32000000-0000-4000-8000-000000000014", "20000000-0000-4000-8000-000000000012", "31000000-0000-4000-8000-000000000009", [0, 0, 0], [20, 20, 20], [30, 30, 45], 1),
  collection("32000000-0000-4000-8000-000000000015", "20000000-0000-4000-8000-000000000011", "31000000-0000-4000-8000-000000000010", [0, 0, 0], [0, 0, 0], [30, 30, 45], 0, [30, 30, 30]),
] satisfies InsertWorkoutSetCollection[];

function collection(
  id: string,
  exerciseId: string,
  workoutSetId: string,
  weight: number[],
  reps: number[],
  restTime: number[],
  order: number,
  duration = weight.map(() => 0),
): InsertWorkoutSetCollection {
  return {
    id,
    exerciseId,
    workoutSetId,
    weight,
    reps,
    restTime,
    duration,
    order,
  };
}

async function seed() {
  validateCatalog();

  const databaseConfiguration = getDatabaseConfiguration();

  const client = postgres(databaseConfiguration.connectionString, {
    max: 1,
    ssl: databaseConfiguration.ssl === "require" ? "require" : databaseConfiguration.ssl === "true",
    onnotice: () => undefined,
  });
  const db = drizzle(client);

  const systemUser = {
    id: SYSTEM_USER_ID,
    name: "Gym Quest",
    username: "gymquest",
    email: "seed@gym-quest.local",
    emailVerified: new Date("2024-01-01T00:00:00.000Z"),
    image: null,
    uploadedImage: null,
  } satisfies NewUser;

  try {
    await db.transaction(async (tx) => {
      if (!catalogOnly) {
        await tx
          .insert(users)
          .values(systemUser)
          .onConflictDoUpdate({
            target: users.id,
            set: {
              name: systemUser.name,
              username: systemUser.username,
              email: systemUser.email,
            },
          });

        await tx
          .insert(userPrivateInformation)
          .values({ userId: SYSTEM_USER_ID, password: null, role: "user" })
          .onConflictDoNothing({ target: userPrivateInformation.userId });

        await tx
          .insert(userProfile)
          .values({ userId: SYSTEM_USER_ID, selectedBadge: null })
          .onConflictDoNothing({ target: userProfile.userId });

        await tx
          .insert(badge)
          .values(BADGE_DEFINITIONS)
          .onConflictDoNothing();
      }

      const [existingMuscleGroups, existingMuscles, existingExercises] = await Promise.all([
        tx.select({ id: muscleGroup.id, name: muscleGroup.name }).from(muscleGroup),
        tx.select({ id: muscle.id, name: muscle.name }).from(muscle),
        tx.select({ id: exercise.id, name: exercise.name, userId: exercise.userId }).from(exercise),
      ]);
      const normalizedName = (name: string) => name.trim().toLocaleLowerCase("en-US");
      const expectedMuscleGroupIds = new Map(
        catalogMuscleGroups.map(({ id, name }) => [normalizedName(name), id]),
      );
      const expectedMuscleIds = new Map(
        catalogMuscles.map(({ id, name }) => [normalizedName(name), id]),
      );
      const expectedExerciseIds = new Map(
        catalogExercises.map(({ id, name }) => [normalizedName(name), id]),
      );
      const conflicts = [
        ...existingMuscleGroups
          .filter(({ id, name }) => {
            const expectedId = expectedMuscleGroupIds.get(normalizedName(name));
            return expectedId !== undefined && expectedId !== id;
          })
          .map(({ name }) => `muscle group "${name}"`),
        ...existingMuscles
          .filter(({ id, name }) => {
            const expectedId = expectedMuscleIds.get(normalizedName(name));
            return expectedId !== undefined && expectedId !== id;
          })
          .map(({ name }) => `muscle "${name}"`),
        ...existingExercises
          .filter(({ id, name, userId }) => {
            const expectedId = expectedExerciseIds.get(normalizedName(name));
            return userId === null && expectedId !== undefined && expectedId !== id;
          })
          .map(({ name }) => `system exercise "${name}"`),
      ];

      if (conflicts.length > 0) {
        throw new Error(
          `Catalog import stopped to avoid duplicate global records. Conflicts: ${conflicts.slice(0, 20).join(", ")}${conflicts.length > 20 ? `, and ${conflicts.length - 20} more` : ""}.`,
        );
      }

      await tx
        .insert(muscleGroup)
        .values(catalogMuscleGroups)
        .onConflictDoUpdate({
          target: muscleGroup.id,
          set: {
            name: muscleGroup.name,
            description: muscleGroup.description,
          },
        });

      await tx
        .insert(muscle)
        .values(catalogMuscles)
        .onConflictDoUpdate({
          target: muscle.id,
          set: {
            name: muscle.name,
            latinName: muscle.latinName,
            muscleGroupId: muscle.muscleGroupId,
            description: muscle.description,
          },
        });

      await tx
        .insert(exercise)
        .values(catalogExercises)
        .onConflictDoUpdate({
          target: exercise.id,
          set: {
            name: exercise.name,
            description: exercise.description,
            isPublic: exercise.isPublic,
            userId: exercise.userId,
            archivedAt: null,
          },
        });

      await tx
        .delete(exerciseToMuscle)
        .where(inArray(exerciseToMuscle.exerciseId, catalogExercises.map(({ id }) => id!)));

      await tx
        .insert(exerciseToMuscle)
        .values(
          catalogExerciseMuscles.map(([exerciseId, muscleId]) => ({
            exerciseId,
            muscleId,
          })),
        )
        .onConflictDoNothing();

      if (!catalogOnly) {
        await tx
          .insert(workout)
          .values(workouts)
          .onConflictDoUpdate({
            target: workout.id,
            set: {
              name: workout.name,
              description: workout.description,
              category: workout.category,
              isPublic: workout.isPublic,
              userId: workout.userId,
            },
          });

        await tx
          .insert(workoutSet)
          .values(workoutSets)
          .onConflictDoUpdate({
            target: workoutSet.id,
            set: {
              workoutId: workoutSet.workoutId,
              order: workoutSet.order,
            },
          });

        await tx
          .insert(workoutSetCollection)
          .values(workoutSetCollections)
          .onConflictDoUpdate({
            target: workoutSetCollection.id,
            set: {
              exerciseId: workoutSetCollection.exerciseId,
              workoutSetId: workoutSetCollection.workoutSetId,
              weight: workoutSetCollection.weight,
              reps: workoutSetCollection.reps,
              restTime: workoutSetCollection.restTime,
              duration: workoutSetCollection.duration,
              order: workoutSetCollection.order,
            },
          });
      }

      const [savedMuscleGroups, savedMuscles, savedExercises, savedExerciseMuscles] = await Promise.all([
        tx
          .select({ id: muscleGroup.id })
          .from(muscleGroup)
          .where(inArray(muscleGroup.id, catalogMuscleGroups.map(({ id }) => id!))),
        tx
          .select({ id: muscle.id })
          .from(muscle)
          .where(inArray(muscle.id, catalogMuscles.map(({ id }) => id!))),
        tx
          .select({ id: exercise.id })
          .from(exercise)
          .where(inArray(exercise.id, catalogExercises.map(({ id }) => id!))),
        tx
          .select({ exerciseId: exerciseToMuscle.exerciseId, muscleId: exerciseToMuscle.muscleId })
          .from(exerciseToMuscle)
          .where(inArray(exerciseToMuscle.exerciseId, catalogExercises.map(({ id }) => id!))),
      ]);

      if (
        savedMuscleGroups.length !== catalogMuscleGroups.length ||
        savedMuscles.length !== catalogMuscles.length ||
        savedExercises.length !== catalogExercises.length ||
        savedExerciseMuscles.length !== catalogExerciseMuscles.length
      ) {
        throw new Error(
          `Catalog verification failed inside the transaction. Saved ${savedMuscleGroups.length}/${catalogMuscleGroups.length} muscle groups, ${savedMuscles.length}/${catalogMuscles.length} muscles, ${savedExercises.length}/${catalogExercises.length} exercises, and ${savedExerciseMuscles.length}/${catalogExerciseMuscles.length} links.`,
        );
      }
    });

    console.log(
      catalogOnly
        ? `Imported ${catalogMuscleGroups.length} muscle groups, ${catalogMuscles.length} muscles, ${catalogExercises.length} exercises, and ${catalogExerciseMuscles.length} exercise-to-muscle links.`
        : `Seeded ${catalogMuscleGroups.length} muscle groups, ${catalogMuscles.length} muscles, ${catalogExercises.length} exercises, ${catalogExerciseMuscles.length} exercise-to-muscle links, and ${workouts.length} workouts.`,
    );
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error("Failed to seed database.");
  console.error(error);
  process.exit(1);
});
