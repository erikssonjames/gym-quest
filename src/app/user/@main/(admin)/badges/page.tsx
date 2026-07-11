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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageShell } from "@/app/user/@main/_components/page-shell"

export default function BadgesPage () {
  const { data: badges } = api.badges.getBadges.useQuery()

  return (
    <PageShell eyebrow="Admin" title="Badge studio" description="Create, tune, and preview the milestones users see in their achievement gallery." actions={<CreateBadgeDialog badgeGroupName="weight_lifting" badge={BADGE_GROUPS[0]!.badges[0]!} button={<Button><Plus />Create badge</Button>} />}>
      {BADGE_GROUPS.map(badgeGroup => (
        <Card key={badgeGroup.id}>
          <CardHeader><CardTitle className="capitalize">{badgeGroup.id.replaceAll("_", " ")}</CardTitle></CardHeader>

          <CardContent className="space-y-2">
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
          </CardContent>
        </Card>
      ))}
    </PageShell>
  )
}

function MissingBadge ({ badge, badgeGroupName }: { badge: BadgeLiteral, badgeGroupName: BadgeGroupName }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-3">
      <p className="text-sm text-muted-foreground">Missing badge definition</p>
      <p className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">{badge.id}</p>

      <div className="ms-auto">
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
    <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
      <div className="w-40">
        <BadgeComponent 
          key={badge.id}
          badge={badge}
        />
      </div>

      <div className="min-w-32"><p className="text-xs text-muted-foreground">Requirement</p><p className="text-sm">{foundBadge.valueToComplete} {foundBadge.valueName}</p></div>
      <p className="min-w-48 flex-1 text-sm text-muted-foreground">{foundBadge.valueDescription}</p>

      <div className="ms-auto flex items-center gap-2">
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
