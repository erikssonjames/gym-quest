import { H3 } from "@/components/typography/h3";
import DynamicLayout from "../../_components/dynamic-layout";
import CreateMuscleForm from "./_components/create-muscle-form";

export default function MusclesCreatePage () {
  return (
    <DynamicLayout>
      <div className="px-10 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <H3 text="Add Muscle" />
        </div>

        <CreateMuscleForm />
      </div>
    </DynamicLayout>
  )
}