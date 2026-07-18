"use client"

import { SmilePlus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ALL_EMOJI_GROUPS } from "@/variables/emojis"

const QUICK_REACTIONS = ["💪", "🔥", "👏", "❤️", "🎉", "😮"]

export function EmojiReactionPicker({
  value,
  disabled,
  onChange,
}: {
  value: string | null
  disabled?: boolean
  onChange: (emoji: string) => void
}) {
  const [open, setOpen] = useState(false)
  const choose = (emoji: string) => {
    onChange(emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button aria-label="Choose an emoji reaction" disabled={disabled} size="sm" type="button" variant="ghost">
          <SmilePlus data-icon="inline-start" />
          React
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <Command>
          <div className="border-b p-2">
            <ToggleGroup
              aria-label="Quick reactions"
              className="grid grid-cols-6"
              onValueChange={(emoji) => {
                if (emoji) choose(emoji)
                else if (value) choose(value)
              }}
              type="single"
              value={value ?? ""}
            >
              {QUICK_REACTIONS.map((emoji) => (
                <ToggleGroupItem aria-label={`React with ${emoji}`} key={emoji} value={emoji}>
                  {emoji}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <CommandInput placeholder="Search reactions..." />
          <CommandList>
            <CommandEmpty>No emoji found.</CommandEmpty>
            {ALL_EMOJI_GROUPS.map((group) => (
              <CommandGroup
                className="[&_[cmdk-group-items]]:grid [&_[cmdk-group-items]]:grid-cols-6"
                heading={group.groupName}
                key={group.groupName}
              >
                {group.emojis.map((emoji) => (
                  <CommandItem
                    aria-label={emoji.name}
                    className="justify-center text-lg"
                    key={`${emoji.unicode}:${emoji.name}`}
                    onSelect={() => choose(emoji.emoji)}
                    value={`${emoji.name} ${emoji.emoji}`}
                  >
                    {emoji.emoji}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
