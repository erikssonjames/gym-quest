import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const bubbleVariants = cva("w-fit max-w-full rounded-2xl px-3 py-2 text-sm leading-6", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      muted: "bg-muted text-foreground",
      tinted: "border border-primary/20 bg-primary/10 text-foreground",
      outline: "border bg-background text-foreground",
      ghost: "text-foreground",
      destructive: "bg-destructive text-destructive-foreground",
    },
  },
  defaultVariants: {
    variant: "muted",
  },
})

const Bubble = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof bubbleVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(bubbleVariants({ variant }), className)} {...props} />
))
Bubble.displayName = "Bubble"

const BubbleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("whitespace-pre-wrap", className)} {...props} />
))
BubbleContent.displayName = "BubbleContent"

export { Bubble, BubbleContent, bubbleVariants }
