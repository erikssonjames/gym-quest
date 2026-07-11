import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PostContainerProps {
  children: ReactNode
  className?: string
}

export default function PostContainer ({ children, className }: PostContainerProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {children}
    </Card>
  )
}
