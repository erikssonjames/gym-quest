import { z } from "zod"

export const WorkoutAiChatMessageZod = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
})

export const WorkoutAiChatInputZod = z.object({
  messages: z.array(WorkoutAiChatMessageZod).min(1).max(24),
}).superRefine(({ messages }, context) => {
  const totalCharacters = messages.reduce((total, message) => total + message.content.length, 0)
  if (totalCharacters > 24000) {
    context.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: 24000,
      type: "string",
      inclusive: true,
      message: "Conversation context is too large. Start a new workout draft.",
      path: ["messages"],
    })
  }
})

const WorkoutAiExerciseDraftZod = z.object({
  exerciseName: z.string().trim().min(1).max(120),
  reps: z.array(z.number().int().min(0).max(100)).min(1).max(12),
  weight: z.array(z.number().int().min(0).max(1000)).min(1).max(12),
  duration: z.array(z.number().int().min(0).max(3600)).min(1).max(12),
  restTime: z.array(z.number().int().min(0).max(3600)).min(1).max(12),
})

const WorkoutAiDraftZod = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  category: z.string().trim().min(1).max(80),
  workoutSets: z.array(z.object({
    exercises: z.array(WorkoutAiExerciseDraftZod).min(1).max(8),
  })).min(1).max(20),
})

export const WorkoutAiModelResponseZod = z.object({
  phase: z.enum(["clarifying", "draft"]),
  assistantMessage: z.string().trim().min(1).max(4000),
  draft: WorkoutAiDraftZod.nullable(),
})

export type WorkoutAiChatInput = z.infer<typeof WorkoutAiChatInputZod>
export type WorkoutAiChatMessage = z.infer<typeof WorkoutAiChatMessageZod>
export type WorkoutAiModelResponse = z.infer<typeof WorkoutAiModelResponseZod>
export type WorkoutAiDraft = z.infer<typeof WorkoutAiDraftZod>
export type WorkoutAiExerciseDraft = z.infer<typeof WorkoutAiExerciseDraftZod>
