import { Button } from "@/components/ui/button";
import DynamicLayout from "../../_components/dynamic-layout";
import { H3 } from "@/components/typography/h3";
import { Grid2X2, SquarePlus } from "lucide-react";

export default function ManagePage () {
  return (
    <DynamicLayout>
      <div className="px-10">
        <div className="flex justify-between items-center">
          <H3 text="Your workouts" />

          <div className="flex gap-2">
            <Button size="sm" className="h-8">
              <Grid2X2 />
              Browse
            </Button>
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