"use client"

import * as React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const MessageScrollerContext = React.createContext({ autoScroll: false })

type MessageScrollerProviderProps = React.PropsWithChildren<{
  autoScroll?: boolean
}>

function MessageScrollerProvider({
  autoScroll = false,
  children,
}: MessageScrollerProviderProps) {
  return (
    <MessageScrollerContext.Provider value={{ autoScroll }}>
      {children}
    </MessageScrollerContext.Provider>
  )
}

const MessageScroller = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex min-h-0 flex-1 flex-col", className)}
    {...props}
  />
))
MessageScroller.displayName = "MessageScroller"

const MessageScrollerViewport = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ScrollArea>
>(({ className, children, ...props }, ref) => (
  <ScrollArea ref={ref} className={cn("min-h-0 flex-1", className)} {...props}>
    {children}
  </ScrollArea>
))
MessageScrollerViewport.displayName = "MessageScrollerViewport"

const MessageScrollerContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, forwardedRef) => {
  const { autoScroll } = React.useContext(MessageScrollerContext)
  const endRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!autoScroll) return

    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [autoScroll, children])

  return (
    <div
      ref={forwardedRef}
      className={cn("flex flex-col gap-3 p-4", className)}
      {...props}
    >
      {children}
      <div ref={endRef} aria-hidden="true" />
    </div>
  )
})
MessageScrollerContent.displayName = "MessageScrollerContent"

const MessageScrollerItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    messageId?: string
    scrollAnchor?: boolean
  }
>(({ className, messageId, scrollAnchor, ...props }, ref) => (
  <div
    ref={ref}
    data-message-id={messageId}
    data-scroll-anchor={scrollAnchor ? "true" : undefined}
    className={cn("w-full", className)}
    {...props}
  />
))
MessageScrollerItem.displayName = "MessageScrollerItem"

const MessageScrollerButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      "absolute bottom-3 right-3 rounded-full border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted",
      className,
    )}
    {...props}
  />
))
MessageScrollerButton.displayName = "MessageScrollerButton"

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
}
