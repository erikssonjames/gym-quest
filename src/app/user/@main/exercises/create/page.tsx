import { H3 } from "@/components/typography/h3";
import DynamicLayout from "../../_components/dynamic-layout";

export default function ExercisesCreatePage () {
  return (
    <DynamicLayout>
      <div className="px-10">
        <div className="flex justify-between items-center">
          <H3 text="Create Exercise" />
        </div>
      </div>
    </DynamicLayout>
  )
}