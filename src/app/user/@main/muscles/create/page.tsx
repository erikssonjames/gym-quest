import { H3 } from "@/components/typography/h3";
import CreateMuscleForm from "./_components/create-muscle-form";

export default function MusclesCreatePage () {
  return (
    <div className="md:px-4 flex flex-col gap-10 h-full">
      <H3 text="Add Muscle" />
      <CreateMuscleForm />
    </div>
  )
}