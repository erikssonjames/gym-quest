import { boolean, date, integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";
import { exercise } from "./exercise";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const workout = pgTable("workout", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  isPublic: boolean("isPublic").notNull(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
})

export const workoutSet = pgTable("workoutSet", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutId: uuid("workoutId")
    .references(() => workout.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull()
})

export const workoutSetCollection = pgTable("workoutSetCollection", {
  id: uuid("id").defaultRandom().primaryKey(),
  exerciseId: uuid("exerciseId")
    .references(() => exercise.id, { onDelete: "cascade" })
    .notNull(),
  workoutSetId: uuid("workoutSetId")
    .references(() => workoutSet.id, { onDelete: "cascade" })
    .notNull(),
  weight: integer("weight").array().notNull(),
  reps: integer("reps").array().notNull(),
  restTime: integer("restTime").array().notNull(),
  duration: integer("duration").array().notNull(),
  order: integer("order").notNull()
})

export const workoutToUser = pgTable(
  "workoutToUser",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workoutId: uuid("workoutId")
      .notNull()
      .references(() => workout.id, { onDelete: "cascade" })
  },
  (t) => [primaryKey({ columns: [t.userId, t.workoutId] }) ]
)

export const ratingEnum = pgEnum("rating", ["1", "2", "3", "4", "5"])

export const workoutReview = pgTable("workoutReview", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: date("createdAt").notNull(),
  editedAt: date("editedAt"),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  workoutId: uuid("workoutId")
    .references(() => workout.id, { onDelete: "cascade" })
    .notNull(),
  rating: ratingEnum("rating").default("3").notNull(),
  comment: text("comment").notNull()
})

export const workoutSession = pgTable("workoutSession", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  workoutId: uuid("workoutId")
    .references(() => workout.id, { onDelete: "set null" })
    .notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  useLastRecordedValue: boolean("useLastRecordedValue").notNull()
})

export const workoutSessionLog = pgTable("workoutSessionLog", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutSessionId: uuid("workoutSessionId")
    .references(() => workoutSession.id, { onDelete: "cascade" })
    .notNull(),
  exerciseId: uuid("exerciseId")
    .references(() => exercise.id, { onDelete: "set null" })
    .notNull(),
  workoutSetCollectionId: uuid("workoutSetCollectionId")
    .references(() => workoutSetCollection.id, { onDelete: "set null" })
    .notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt")
});

export const workoutSessionLogFragment = pgTable("workoutSessionLogFragment", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutSessionLogId: uuid("workoutSessionLogId")
    .references(() => workoutSessionLog.id, { onDelete: "cascade" })
    .notNull(),
  reps: integer("reps"),
  weight: integer("weight"),
  duration: integer("duration"),
  startedAt: timestamp("startedAt").notNull(),
  endedAt: timestamp("endedAt"),
  skipped: boolean("skipped")
})

// General types

export const InsertWorkoutZod = createInsertSchema(workout)
export type InsertWorkout = typeof workout.$inferInsert
export const WorkoutZod = createSelectSchema(workout)
export type Workout = typeof workout.$inferSelect

export const InsertWorkoutSetZod = createInsertSchema(workoutSet)
export type InsertWorkoutSet = typeof workoutSet.$inferInsert
export const WorkoutSetZod = createSelectSchema(workoutSet)
export type WorkoutSet = typeof workoutSet.$inferSelect

export const InsertWorkoutSetCollectionZod = createInsertSchema(workoutSetCollection)
export type InsertWorkoutSetCollection = typeof workoutSetCollection.$inferInsert
export const WorkoutSetCollectionZod = createSelectSchema(workoutSetCollection)
export type WorkoutSetCollection = typeof workoutSetCollection.$inferSelect

export const InsertWorkoutReviewZod = createInsertSchema(workoutReview)
export type InsertWorkoutReview = typeof workoutReview.$inferInsert
export const WorkoutReviewZod = createSelectSchema(workoutReview)
export type WorkoutReview = typeof workoutReview.$inferSelect

export const InsertWorkoutSessionZod = createInsertSchema(workoutSession)
export type InsertWorkoutSession = typeof workoutSession.$inferInsert
export const WorkoutSessionZod = createSelectSchema(workoutSession)
export type WorkoutSession = typeof workoutSession.$inferSelect

export const InsertWorkoutSessionLogZod = createInsertSchema(workoutSessionLog)
export type InsertWorkoutSessionLog = typeof workoutSessionLog.$inferInsert
export const WorkoutSessionLogZod = createSelectSchema(workoutSessionLog)
export type WorkoutSessionLog = typeof workoutSessionLog.$inferSelect

export const InsertWorkoutSessionLogFragmentZod = createInsertSchema(workoutSessionLogFragment)
export type InsertWorkoutSessionLogFragment = typeof workoutSessionLogFragment.$inferInsert
export const WorkoutSessionLogFragmentZod = createSelectSchema(workoutSessionLogFragment)
export type WorkoutSessionLogFragment = typeof workoutSessionLogFragment.$inferSelect

// Api types

export const CreateWorkoutInputZod = InsertWorkoutZod.extend({
  workoutSets: z.array(
    InsertWorkoutSetZod.extend({
      workoutSetCollections: z.array(InsertWorkoutSetCollectionZod.omit({ workoutSetId: true, order: true })),
    }).omit({ workoutId: true, order: true })
  ),
})
  .omit({ userId: true })
export type CreateWorkoutInput = z.infer<typeof CreateWorkoutInputZod>

export const CreateWorkoutSetsInputZod = CreateWorkoutInputZod.shape.workoutSets.element
export type CreateWorkoutSetsInput = z.infer<typeof CreateWorkoutSetsInputZod>

export const CreateWorkoutSetCollectionInputZod = CreateWorkoutInputZod.shape.workoutSets.element.shape.workoutSetCollections.element
export type CreateWorkoutSetCollectionInput = z.infer<typeof CreateWorkoutSetCollectionInputZod>

export const WorkoutInputZod = WorkoutZod.extend({
  workoutSets: z.array(
    InsertWorkoutSetZod.extend({
      workoutSetCollections: z.array(InsertWorkoutSetCollectionZod.extend({
        workoutSetId: z.string().optional()
      }).omit({ order: true })),
    }).omit({ order: true })
  ),
})
export type WorkoutInput = z.infer<typeof WorkoutInputZod>

export const FullWorkoutZod = WorkoutZod.extend({
  workoutSets: z.array(
    InsertWorkoutSetZod.extend({
      workoutSetCollections: z.array(InsertWorkoutSetCollectionZod),
    })
  ),
})
export type FullWorkout = z.infer<typeof FullWorkoutZod>

export const CreateWorkoutSessionZod = InsertWorkoutSessionZod.omit({ startedAt: true, userId: true })
export type CreateWorkoutSession = z.infer<typeof CreateWorkoutSessionZod>

export const CreateWorkoutSessionLogZod = InsertWorkoutSessionLogZod.omit({ startedAt: true })
export type CreateWorkoutSessionLog = z.infer<typeof CreateWorkoutSessionLogZod>

export const CreateWorkoutSessionLogFragmentZod = InsertWorkoutSessionLogFragmentZod
export type CreateWorkoutSessionLogFragment = z.infer<typeof CreateWorkoutSessionLogFragmentZod>
