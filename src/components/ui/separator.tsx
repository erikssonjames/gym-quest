"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

interface ExtraProps {
  inFlex?: boolean;
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & ExtraProps
>(
  (
    { 
      className, 
      orientation = "horizontal", 
      decorative = true,
      inFlex = false,
      ...props 
  },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? 
          `h-[1px] ${inFlex ? 'flex-grow' : 'w-full'}` : 
          `${inFlex ? 'flex-grow' : 'h-full'} w-[1px]`,
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
