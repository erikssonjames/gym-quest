import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const muscleGroup = pgTable("muscle_group", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const muscle = pgTable("muscle", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  latinName: text("name"),
  muscleGroupId: uuid("muscle_group_id")
    .notNull()
    .references(() => muscleGroup.id),
  description: text("description"),
});

export const InsertMuscleZod = createInsertSchema(muscle)
export type InsertMuscle = typeof muscle.$inferInsert
export const MuscleZod = createSelectSchema(muscle)
export type Muscle = typeof muscle.$inferSelect


export const InsertMuscleGroupZod = createInsertSchema(muscleGroup)
export type InsertMuscleGroup = typeof muscleGroup.$inferInsert
export const MuscleGroupZod = createSelectSchema(muscleGroup)
export type MuscleGroup = typeof muscleGroup.$inferSelect
