export function parseWeightInput(value: string) {
  const weight = Number(value.replace(",", "."))
  return Number.isFinite(weight) && weight >= 20 && weight <= 500 ? weight : null
}

export function calculateGoalProgress({
  startingWeight,
  currentWeight,
  goalWeight,
}: {
  startingWeight: number | null
  currentWeight: number | null
  goalWeight: number | null
}) {
  if (startingWeight == null || currentWeight == null || goalWeight == null) return null
  const totalDistance = goalWeight - startingWeight
  if (totalDistance === 0) return currentWeight === goalWeight ? 100 : 0
  return Math.max(0, Math.min(100, ((currentWeight - startingWeight) / totalDistance) * 100))
}
