"use client"

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { H3 } from "@/components/typography/h3";
import { useRouter } from "next/navigation";
import CreateWorkoutForm from "./_components/workout-form";

export default function CreateWorkoutPage () {
  const router = useRouter()

  return (
    <>
      <div className="flex flex-col items-start md:px-8">
        <Button
          onClick={() => router.replace("/user/workouts/manage")}
          size="sm" 
          variant="ghost" 
          className="px-0 h-4 text-muted-foreground hover:text-current"
        >
          <ChevronLeft />
          Go Back
        </Button>
        <H3 text="Create workout" />
      </div>

      <div className="flex-grow md:mb-8 my-4 mx-4 py-4 min-h-0">
        <CreateWorkoutForm />
      </div>
    </>
  )
}