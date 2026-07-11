import { drizzle } from "drizzle-orm/postgres-js";
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

nextEnv.loadEnvConfig(process.cwd());
const { env } = await import("@/env");

const SYSTEM_USER_ID = "00000000-0000-4000-8000-000000000001";

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
    name: "Trapezius",
    latinName: "Trapezius",
    muscleGroupId: "10000000-0000-4000-8000-000000000002",
    description: "Upper and mid-back muscle used in rows, carries, and shrugs.",
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
    name: "Deltoids",
    latinName: "Deltoideus",
    muscleGroupId: "10000000-0000-4000-8000-000000000004",
    description: "Shoulder muscle used in pressing, raising, and stabilizing.",
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
  const client = postgres(env.DATABASE_URL, {
    max: 1,
    ssl: env.DATABASE_SSL === "require" ? "require" : env.DATABASE_SSL === "true",
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
        .insert(muscleGroup)
        .values(muscleGroups)
        .onConflictDoUpdate({
          target: muscleGroup.id,
          set: {
            name: muscleGroup.name,
            description: muscleGroup.description,
          },
        });

      await tx
        .insert(muscle)
        .values(muscles)
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
        .values(exercises)
        .onConflictDoUpdate({
          target: exercise.id,
          set: {
            name: exercise.name,
            description: exercise.description,
            isPublic: exercise.isPublic,
            userId: exercise.userId,
          },
        });

      await tx
        .insert(exerciseToMuscle)
        .values(
          exerciseMuscles.map(([exerciseId, muscleId]) => ({
            exerciseId,
            muscleId,
          })),
        )
        .onConflictDoNothing();

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
    });

    console.log(
      `Seeded ${muscleGroups.length} muscle groups, ${muscles.length} muscles, ${exercises.length} exercises, and ${workouts.length} workouts.`,
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
