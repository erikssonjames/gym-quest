import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { muscle } from "./body";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const exercise = pgTable("exercise", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
})

export const exerciseMuscle = pgTable(
  "exercise_muscle",
  {
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercise.id),
    muscleId: uuid("muscle_id")
      .notNull()
      .references(() => muscle.id)
  },
  (t) => ({
    pk: primaryKey({ columns: [t.exerciseId, t.muscleId] })
  })
)

export const InsertExerciseZod = createInsertSchema(exercise)
export type InsertExercise = typeof exercise.$inferInsert
export const ExerciseZod = createSelectSchema(exercise)
export type Exercise = typeof exercise.$inferSelect


export const InsertExerciseMuscleZod = createInsertSchema(exerciseMuscle)
export type InsertExerciseMuscle = typeof exerciseMuscle.$inferInsert
export const ExercisMuscleZod = createSelectSchema(exerciseMuscle)
export type ExerciseMuscle = typeof exerciseMuscle.$inferSelect
