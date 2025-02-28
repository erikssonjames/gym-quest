import { Skeleton } from "@/components/ui/skeleton";

export default function HeaderSkeleton () {
  return (
    <div className="w-full h-72 border-b bg-card/20 flex items-center">
      <div className="flex items-end ml-10 gap-7">
        <Skeleton className="size-40 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-60" />
        </div>
      </div>
    </div>
  )
}