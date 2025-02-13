"use client"

import { Button } from "@/components/ui/button";
import { H3 } from "@/components/typography/h3";
import { SquarePlus } from "lucide-react";
import Link from "next/link";
import DisplayExercises from "./_components/display-exercises";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks"

export default function ExercisesPage () {
  const [searchValue, setSearchValue] = useState("")
  const debouncedSearchValue = useDebounce(searchValue, 200)

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center justify-center">
          <H3 text="Exercises" />
          <Input 
            className="h-8"
            value={searchValue}
            placeholder="Search..."
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="h-8" asChild>
            <Link href="/user/exercises/create">
              <SquarePlus />
                  Create
            </Link>
          </Button>
        </div>
      </div>

      <DisplayExercises search={debouncedSearchValue} />
    </>
  )
}