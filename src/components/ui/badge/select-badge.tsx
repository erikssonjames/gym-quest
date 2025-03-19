import { api } from "@/trpc/react"
import { Skeleton } from "../skeleton"
import { BadgeComponent } from "./badge"
import type { BadgeGroupName, BadgeLiteral } from "@/variables/badges"
import { useState, type ReactNode } from "react"
import { 
  Drawer, 
  DrawerContent, 
  DrawerDescription, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "../drawer"
import { getBadgeGroupName } from "./utils"
import type { BadgeWithProgressOutput } from "@/server/api/types/output"
import { toast } from "sonner"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SelectBadge () {
  const { data, isPending } = api.user.getMe.useQuery()

  if (isPending) {
    return (
      <Skeleton
        className="rounded-full px-2 py-1 w-fit text-xs"
      >
        <span className="invisible">~~~~~~~~~~~~</span>
      </Skeleton>
    )
  }

  if (!data) {
    return (
      <button 
        className="text-xs font-bold rounded-full px-2 py-1 w-fit border-2 overflow-hidden relative cursor-pointer text-muted-foreground hover:bg-accent"
      >
        <span className="text-destructive">Error</span>
      </button>
    )
  }

  const badge = data.userProfile?.badge

  return (
    <SelectBadgeDrawer
      currentActiveBadge={badge?.id}
      button={(
        badge ? (
          <button>
            <BadgeComponent
              cursor="pointer"
              unlocked
              badge={{
                id: badge.id,
                weighting: badge.groupWeighting
              } as BadgeLiteral}
            />
          </button>
        ) : (
          <button 
            className="text-xs font-bold rounded-full px-2 py-1 w-fit border-2 overflow-hidden relative cursor-pointer text-muted-foreground hover:bg-accent"
          >
            Select Badge
          </button>
        )
      )}
    />
  )
}

function SelectBadgeDrawer ({ button, currentActiveBadge }: { button: ReactNode, currentActiveBadge?: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const utils = api.useUtils()
  const { data: badges } = api.badges.getBadgesWithProgress.useQuery()
  const { mutate } = api.badges.setActiveBadge.useMutation({
    onSuccess: () => {
      void utils.user.getMe.invalidate()
      setDrawerOpen(false)
      toast.success("Updated your visible badge!")
    }
  })

  if (!badges) return button

  const groupedByGroup = badges.reduce<Record<string, BadgeWithProgressOutput[number][]>>((acc, curr) => {
    if (!(curr.badge.group in acc)) {
      acc[curr.badge.group] = []
    }
    acc[curr.badge.group]!.push(curr)
    return acc
  }, {})
  const arrayOfGroups = Object.entries(groupedByGroup).map(([group, badges]) => {
    return {
      groupName: group,
      badges: badges.sort((a, b) => a.badge.groupWeighting - b.badge.groupWeighting)
    }
  })

  const onSelectActiveBadge = (id: string) => {
    const newId = currentActiveBadge === id
      ? undefined
      : id
    mutate(newId)
  }

  return (
    <Drawer open={drawerOpen} onOpenChange={(o) => setDrawerOpen(o)}>
      <DrawerTrigger asChild>
        {button}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Select badge</DrawerTitle>
            <DrawerDescription>This badge is visible to your friends and other users.</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            {arrayOfGroups.map(group => {
              const { badges, groupName } = group

              return (
                <div key={groupName} className="border p-4 rounded-md">
                  <p className="font-bold pb-4">{getBadgeGroupName(groupName as BadgeGroupName)}</p>

                  <div className="flex gap-2 flex-wrap">
                    {badges.map((({ badge, badgeProgress }) => (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => onSelectActiveBadge(badge.id)}
                        className={cn(
                          "flex gap-2 items-center p-2 rounded-lg",
                          currentActiveBadge === badge.id && "border border-green-600"
                        )}
                      >
                        <BadgeComponent
                          cursor="pointer"
                          unlocked={badgeProgress?.completed ?? false}
                          badge={{
                            id: badge.id,
                            weighting: badge.groupWeighting
                          } as BadgeLiteral}
                        />
                        {currentActiveBadge === badge.id && <Check size={16} />}
                      </button>
                    )))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}