"use client"

import { Button } from "@/components/ui/button";
import { H3 } from "@/components/typography/h3";
import { SquarePlus } from "lucide-react";
import DynamicLayout from "../_components/dynamic-layout";
import Link from "next/link";
import DisplayExercises from "./_components/display-exercises";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debounce";
import { useState } from "react";

export default function ExercisesPage () {
  const [searchValue, setSearchValue] = useState("")
  const debouncedSearchValue = useDebounce(searchValue, 200)

  return (
    <DynamicLayout>
      <div className="md:pt-6 pt-4 h-full">
        <div className="h-full flex flex-col max-w-6xl mx-auto">
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
        </div>
      </div>
    </DynamicLayout>
  )
}