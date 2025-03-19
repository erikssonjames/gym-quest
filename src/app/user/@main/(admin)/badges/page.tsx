"use client"

import { api } from "@/trpc/react"
import CreateBadgeDialog from "../_components/create-badge-dialog"
import { BADGE_GROUPS, type BadgeGroupName, type BadgeLiteral } from "@/variables/badges"
import { BadgeComponent } from "@/components/ui/badge/badge"
import { Pencil, Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Badge } from "@/server/db/schema/badges"
import EditBadgeDialog from "../_components/edit-badge-dialog"
import ConfirmDeleteBadgeDialog from "../_components/confirm-delete-badge-dialog"

export default function BadgesPage () {
  const { data: badges } = api.badges.getBadges.useQuery()

  return (
    <div className="space-y-4 pb-10">
      {BADGE_GROUPS.map(badgeGroup => (
        <div className="border p-4 rounded-md" key={badgeGroup.id}>
          <p className="pb-4 text-lg font-bold">{badgeGroup.id}</p>

          <div className="space-y-2">
            {badgeGroup.badges.map(badge => {
              const foundBadge = badges?.find(b => b.id === badge.id)

              if (!foundBadge) {
                return <MissingBadge badgeGroupName={badgeGroup.id} badge={badge} key={badge.id} />
              }

              return (
                <ExistingBadge 
                  key={foundBadge.id}
                  badge={badge}
                  foundBadge={foundBadge}
                  badgeGroupName={badgeGroup.id}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function MissingBadge ({ badge, badgeGroupName }: { badge: BadgeLiteral, badgeGroupName: BadgeGroupName }) {
  return (
    <div className="flex gap-2 items-center">
      <p>Missing badge</p>
      <p className="py-2 px-4 text-sm font-semibold rounded-full bg-slate-400/20">{badge.id}</p>

      <div className="ml-10">
        <CreateBadgeDialog
          badgeGroupName={badgeGroupName}
          badge={badge}
          button={(
            <Button size="sm">
              <Plus />
              Create
            </Button>
          )}
        />
      </div>
    </div>
  )
}

function ExistingBadge (
  { badge, badgeGroupName, foundBadge }: { badge: BadgeLiteral, badgeGroupName: BadgeGroupName, foundBadge: Badge }
) {
  return (
    <div className="flex gap-2 items-center">
      <div className="w-40">
        <BadgeComponent 
          key={badge.id}
          badge={badge}
        />
      </div>

      <p>{foundBadge.valueName}</p>
      <p>{foundBadge.valueDescription}</p>
      <p>{foundBadge.valueToComplete}</p>

      <div className="flex gap-2 items-center ml-10">
        <EditBadgeDialog
          button={(
            <Button size="sm">
              <Pencil />
               Edit
            </Button>
          )}
          currentBadge={foundBadge}
        />
        <ConfirmDeleteBadgeDialog
          badge={badge}
          badgeGroupName={badgeGroupName}
          button={(
            <Button size="sm" variant="destructive">
              <Trash />
              Delete
            </Button>
          )}
        />
      </div>
    </div>
  )
}