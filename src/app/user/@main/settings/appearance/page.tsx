'use client'

import { H4 } from "@/components/typography/h4";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { 
    type COLOR_THEMES, 
    COLOR_THEMES_ARRAY, 
    BORDER_RADIUS_ARRAY, 
    type BORDER_RADIUS 
} from "@/variables/settings";
import { useUserSettings } from "../../_components/user-settings-provider";
import { Button } from "@/components/ui/button";

function UIColorExample ({ onClick }: { onClick: () => void }) {
    return (
        <button
            className="flex flex-col bg-background border rounded-md w-full p-3 gap-2"
            onClick={onClick}
        >
            <div className="flex gap-2">
                <div className="w-20 h-3 bg-secondary rounded-md" />
                <div className="w-10 h-3 bg-primary rounded-lg"></div>
            </div>
            <div className="flex gap-2">
                <div className="w-10 h-3 bg-secondary-foreground rounded-md" />
                <div className="w-10 h-3 bg-primary rounded-lg"></div>
                <div className="w-10 h-3 bg-secondary rounded-md" />
            </div>
            <div className="flex gap-2">
                <div className="w-1/2 h-3 bg-muted rounded-md" />
                <div className="w-1/2 h-3 bg-muted-foreground rounded-md" />
            </div>
            <div className="flex gap-2">
                <div className="w-full h-3 bg-primary rounded-lg"></div>
            </div>
        </button>
    )
}

function BorderRadiusExample (
    { radiusClass, onClick, isActive }: 
    { radiusClass: BORDER_RADIUS, onClick: () => void, isActive: boolean }
) {
    const radiusName = () => {
        switch (radiusClass) {
            case 'zero_radius': return '0'
            case 'small_radius': return '0.3'
            case 'medium_radius': return '0.5'
            case "large_radius": return '0.75'
            case "xl_radius": return 1
        }
    }

    return (
        <Button 
            size="sm" 
            onClick={onClick} 
            variant="outline"
            isActive={isActive}
        >
            {radiusName()}
        </Button>
    )
}

export default function AppearanceSettings () {
    const { colorTheme, borderRadius, updateUserSettings } = useUserSettings()

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Color theme</CardTitle>
                    <CardDescription>Choose a color palette.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup 
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
                        value={colorTheme ?? 'standard'}
                        onValueChange={(val) => updateUserSettings({
                            colorTheme: val as COLOR_THEMES
                        })}
                    >
                        {COLOR_THEMES_ARRAY.map(theme => (
                            <div 
                                key={`color-palette-${theme}`} 
                                className={cn(
                                    "flex flex-col",
                                    theme
                                )}
                            >
                                <div className="flex justify-between items-center px-2 py-1">
                                    <H4 text={theme} className="capitalize" />
                                    <RadioGroupItem
                                        value={theme} 
                                        id={`pallete-item-${theme}`}
                                    />
                                </div>
                                <UIColorExample onClick={() => updateUserSettings({
                                    colorTheme: theme
                                })} />
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>
            <div className="flex flex-wrap gap-4">
                <Card className="flex-grow">
                    <CardHeader>
                        <CardTitle>Border Radius</CardTitle>
                        <CardDescription>Customize the border radius to your liking.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                            {BORDER_RADIUS_ARRAY.map(radius => (
                                <BorderRadiusExample
                                    key={`border-radius-example-${radius}`}
                                    onClick={() => updateUserSettings({
                                        borderRadius: radius
                                    })}
                                    isActive={
                                        borderRadius ?
                                            radius === borderRadius
                                            :
                                            radius === 'medium_radius'
                                    }
                                    radiusClass={radius}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="flex-grow">
                    <CardHeader>
                        <CardTitle>Border Radius</CardTitle>
                        <CardDescription>Customize the border radius to your liking.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}