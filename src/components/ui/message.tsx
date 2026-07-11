import * as React from "react"

import { cn } from "@/lib/utils"

type MessageAlign = "start" | "end"

const Message = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: MessageAlign }
>(({ className, align = "start", ...props }, ref) => (
  <div
    ref={ref}
    data-align={align}
    className={cn(
      "flex w-full gap-2",
      align === "end" ? "flex-row-reverse" : "flex-row",
      className
    )}
    {...props}
  />
))
Message.displayName = "Message"

const MessageAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("shrink-0 pt-1", className)} {...props} />
))
MessageAvatar.displayName = "MessageAvatar"

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex min-w-0 max-w-[85%] flex-col gap-1", className)} {...props} />
))
MessageContent.displayName = "MessageContent"

const MessageHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-xs font-medium text-muted-foreground", className)} {...props} />
))
MessageHeader.displayName = "MessageHeader"

const MessageFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-[11px] text-muted-foreground", className)} {...props} />
))
MessageFooter.displayName = "MessageFooter"

export { Message, MessageAvatar, MessageContent, MessageHeader, MessageFooter }
