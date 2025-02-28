import { Skeleton } from "@/components/ui/skeleton"

export default function BodySkeleton () {
  return (
    <div className="w-full flex-grow">
      <div className="grid grid-cols-3 grid-rows-4 h-full w-full p-20 gap-4">
        <div className="col-span-2 row-span-4 grid grid-rows-4 gap-4">
          <Skeleton className="row-span-3" />
          <Skeleton className="row-span-1" />
        </div>
        <div className="row-span-4">
          <Skeleton className="h-full" />
        </div>
      </div>
    </div>
  )
}