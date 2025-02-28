'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { 
  type COLOR_THEMES, 
  COLOR_THEMES_ARRAY, 
} from "@/variables/settings";
import { useUserSettings } from "@/app/user/@main/_components/user-settings-provider";
import { useSidebar } from "@/components/ui/sidebar";

function UIColorExample ({ onClick, theme }: { onClick: () => void, theme: COLOR_THEMES }) {
  return (
    <button
      className={cn(
        "w-full pt-5 ps-5 h-32 overflow-hidden",
        theme
      )}
      onClick={onClick}
    >
      <div className="w-full min-w-60 h-full flex flex-col">
        <div className="w-full bg-black/40 h-6 rounded-t-md border-b">
          <div className="flex gap-1 items-center h-full ps-2">
            <div className="bg-red-400 size-2 rounded-full" />
            <div className="bg-yellow-400 size-2 rounded-full" />
            <div className="bg-green-400 size-2 rounded-full" />
          </div>
        </div>
        <div className="flex h-full">
          <div className="w-14 self-stretch bg-sidebar px-1 py-2 border-r">
            <div className="bg-primary rounded-sm w-full h-2" />
            <div className="bg-accent rounded-sm w-full h-2 mt-3" />
            <div className="bg-accent rounded-sm w-full h-2 mt-1" />
            <div className="bg-accent rounded-sm w-full h-2 mt-1" />
          </div>

          <div className="flex-grow bg-background flex gap-2 p-2">
            <div className="flex-grow bg-card rounded-sm flex flex-col">
              <div className="flex-grow p-1">
                <div className="bg-accent w-full h-full rounded-md" />
              </div>
              <div className="flex gap-1 justify-end p-1">
                <div className="bg-secondary h-2 w-6 rounded-sm" />
                <div className="bg-primary h-2 w-6 rounded-sm" />
              </div>
            </div>
            <div className="w-10 bg-card border rounded-sm">

            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function AppearanceSettings () {
  const { colorTheme, updateUserSettings } = useUserSettings()
  const { open } = useSidebar()

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card>
        <CardHeader>
          <CardTitle>Color theme</CardTitle>
          <CardDescription>Choose a color palette.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
              open ? "grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            )} 
            value={colorTheme ?? 'standard'}
            onValueChange={(val) => updateUserSettings({
              colorTheme: val as COLOR_THEMES
            })}
          >
            {COLOR_THEMES_ARRAY.map(theme => (
              <div 
                key={`color-palette-${theme}`} 
                className={cn(
                  "flex flex-col rounded-lg border shadow-md bg-gray-800/20",
                  colorTheme === theme && "border-primary"
                )}
              >
                <UIColorExample 
                  onClick={() => updateUserSettings({
                    colorTheme: theme
                  })}
                  theme={theme}
                />
                <div className="flex justify-between items-center px-3 py-2 border-t">
                  <p className="capitalize text-sm">{theme}</p>
                  <RadioGroupItem
                    value={theme} 
                    id={`pallete-item-${theme}`}
                  />
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}