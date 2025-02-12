import { boolean, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { muscle } from "./body";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./user";

export const exercise = pgTable("exercise", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  isPublic: boolean("isPublic"),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "set null" })
})

export const exercisePublicRequest = pgTable("exercisePublicRequest", {
  id: uuid("id").defaultRandom().primaryKey(),
  exerciseId: uuid("execiseId")
    .references(() => exercise.id, { onDelete: "cascade" })
    .notNull(),
  requestMadeAt: timestamp("requestMadeAt").defaultNow()
})

export const exerciseToMuscle = pgTable(
  "exerciseToMuscle",
  {
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercise.id, { onDelete: "cascade" }),
    muscleId: uuid("muscle_id")
      .notNull()
      .references(() => muscle.id, { onDelete: "cascade" })
  },
  (t) => [primaryKey({ columns: [t.exerciseId, t.muscleId] }) ]
)

export const InsertExerciseZod = createInsertSchema(exercise)
export type InsertExercise = typeof exercise.$inferInsert
export const ExerciseZod = createSelectSchema(exercise)
export type Exercise = typeof exercise.$inferSelect

export const CreateExerciseZod = z.object({
  ...InsertExerciseZod.shape,
  requestToBePublic: z.boolean(),
  muscleIds: z.array(z.string())
})
export type CreateExercise = z.infer<typeof CreateExerciseZod>

export const UpdateExerciseZod = z.object({
  ...ExerciseZod.shape,
  requestToBePublic: z.boolean(),
  muscleIds: z.array(z.string())
})
export type UpdateExercise = z.infer<typeof UpdateExerciseZod>