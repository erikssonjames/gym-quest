import type { ReactNode } from "react"

interface PostContainerProps {
  children: ReactNode
}

export default function PostContainer ({ children }: PostContainerProps) {
  return (
    <div className="bg-card border rounded-3xl p-8">
      {children}
    </div>
  )
}