import * as React from "react"

import { Input } from "./input"
import { Label } from "./label"
import { cn } from "@/lib/utils"

const FloatingLabelInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> &  { text: string }>(
  ({ className, text, type, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          type={type}
          className={cn(
            "pt-8 pb-4 peer",
            className,
          )}
          {...props}
          ref={ref}
          placeholder=""
        />
        <Label className="absolute left-3 top-4 transform -translate-y-1/2 transition-all peer-focus:top-4 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base text-xs peer-focus:text-xs text-muted-foreground pointer-events-none select-none">
          {text}
        </Label>
      </div>
    )
  })
FloatingLabelInput.displayName = "FloatingLabelInput"

export { FloatingLabelInput }
