import * as React from "react"

import { cn } from "@/lib/utils"

const Marker = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "separator" | "note" }
>(({ className, variant = "note", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2 text-xs text-muted-foreground",
      variant === "separator" && "before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border",
      className
    )}
    {...props}
  />
))
Marker.displayName = "Marker"

const MarkerIcon = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("shrink-0", className)} {...props} />
))
MarkerIcon.displayName = "MarkerIcon"

const MarkerContent = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("shrink-0", className)} {...props} />
))
MarkerContent.displayName = "MarkerContent"

export { Marker, MarkerIcon, MarkerContent }
