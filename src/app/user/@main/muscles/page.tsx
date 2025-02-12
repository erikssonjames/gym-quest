import { Button } from "@/components/ui/button";
import { H3 } from "@/components/typography/h3";
import { SquarePlus } from "lucide-react";
import DynamicLayout from "../_components/dynamic-layout";
import Link from "next/link";
import DisplayMuscles from "./_components/display-muscles";

export default function MusclesPage () {
  return (
    <DynamicLayout>
      <div className="px-10 md:pt-6 pt-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <H3 text="Muscles" />

          <div className="flex gap-2">
            <Button size="sm" className="h-8" asChild>
              <Link href="/user/muscles/create">
                <SquarePlus />
                Create
              </Link>
            </Button>
          </div>
        </div>

        <DisplayMuscles />
      </div>
    </DynamicLayout>
  )
}