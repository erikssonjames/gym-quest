import { api } from "@/trpc/server"
import { TRPCError } from "@trpc/server"
import { redirect } from "next/navigation"

export default async function ActiveWorkoutSummary ({ params }: { params: Promise<{ sessionId: string }> }) {
  const sessionId = (await params).sessionId
  
  let session;
  try {
    session = await api.workout.getWorkoutSessionById(sessionId)
  } catch (e) {
    if (e instanceof TRPCError && e.code === "BAD_REQUEST") {
      redirect("/user/workouts/active");
    }
  }

  if (!session) {
    redirect("/user/workouts")
  }
    

  return (
    <div>
      {session.workout.name}
    </div>
  )
}