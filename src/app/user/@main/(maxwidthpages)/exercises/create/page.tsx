"use client"

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { H3 } from "@/components/typography/h3";
import { useRouter } from "next/navigation";
import CreateExerciseForm from "./_components/exercise-form";

export default function CreateExercisePage () {
  const router = useRouter()

  return (
    <div className="md:pt-6 pt-4 h-full">
      <div className="h-full flex flex-col max-w-6xl mx-auto">
        <div className="flex flex-col items-start md:mx-8 px-4">
          <Button
            onClick={() => router.back()}
            size="sm" 
            variant="ghost" 
            className="px-0 h-4 text-muted-foreground hover:text-current"
          >
            <ChevronLeft />
              Go Back
          </Button>
          <H3 text="Create exercise" />
        </div>

        <div className="flex-grow md:mx-12 md:my-8 my-4 mx-4">
          <CreateExerciseForm />
        </div>
      </div>
    </div>
  )
}