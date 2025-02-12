import { api } from "@/trpc/react";
import { useCallback } from "react";

export function useExerciseName () {
  const { data: exercises } = api.exercise.getExercises.useQuery()

  const getExerciseName = useCallback((id: string) => {
    return exercises?.find(e => e.id === id)?.name ?? ''
  }, [exercises])

  return { getExerciseName }
}