import { Button } from "@/components/ui/button";
import { H3 } from "@/components/typography/h3";
import { SquarePlus } from "lucide-react";
import DynamicLayout from "../_components/dynamic-layout";

export default function MusclesPage () {
  return (
    <DynamicLayout>
      <div className="px-10">
        <div className="flex justify-between items-center">
          <H3 text="Muscles" />

          <div className="flex gap-2">
            <Button size="sm" className="h-8">
              <SquarePlus />
              Create
            </Button>
          </div>
        </div>
      </div>
    </DynamicLayout>
  )
}