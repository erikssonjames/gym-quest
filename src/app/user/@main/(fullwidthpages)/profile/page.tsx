import { redirect } from "next/navigation";
import BodySkeleton from "./_components/body-skeleton";
import HeaderSkeleton from "./_components/header-skeleton";

export default async function ProfilePage () {
  redirect("/user/profile/@me")

  return (
    <div className="flex h-full flex-col">
      <HeaderSkeleton />
      <BodySkeleton />
    </div>
  )
}