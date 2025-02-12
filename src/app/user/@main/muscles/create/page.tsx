import { H3 } from "@/components/typography/h3";
import DynamicLayout from "../../_components/dynamic-layout";
import CreateMuscleForm from "./_components/create-muscle-form";

export default function MusclesCreatePage () {
  return (
    <DynamicLayout>
      <div className="md:pt-6 pt-4 h-full">
        <div className="h-full flex flex-col max-w-6xl mx-auto">
          <H3 text="Add Muscle" />

          <div className="bg-black border-slate-100 border border-opacity-5 rounded-md bg-opacity-10 flex-grow md:my-8 my-4 px-6 py-4">
            <CreateMuscleForm />
          </div>
        </div>
      </div>
    </DynamicLayout>
  )
}