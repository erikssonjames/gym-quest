"use client"

import { useState } from "react"
import { Bot, Loader2, Send, Sparkles } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Marker, MarkerContent } from "@/components/ui/marker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/trpc/react"
import type { CreateWorkoutInput } from "@/server/db/schema/workout"
import { toast } from "sonner"

type ChatMessage = {
  id: string
  role: "assistant" | "user"
  content: string
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "I will clarify the plan before I draft it. What is the main goal for this workout, and how much time do you have?",
  },
]

export default function AiWorkoutChat ({ onApplyDraft }: { onApplyDraft: (draft: CreateWorkoutInput) => void }) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")
  const [draft, setDraft] = useState<CreateWorkoutInput | null>(null)
  const { mutate, isPending } = api.workout.aiChat.useMutation({
    onSuccess: (response) => {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: response.assistantMessage,
        },
      ])
      if (response.draft) setDraft(response.draft)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const sendMessage = () => {
    const content = input.trim()
    if (!content || isPending) return

    const nextMessages = [...messages, { id: `${Date.now()}-user`, role: "user" as const, content }]
    setMessages(nextMessages)
    setInput("")
    mutate({
      messages: nextMessages.map(({ role: messageRole, content: messageContent }) => ({
        role: messageRole,
        content: messageContent,
      })),
    })
  }

  return (
    <Card className="border-primary/20 bg-primary/[0.03] shadow-sm">
      <CardHeader className="gap-3 border-b p-4">
          <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Avatar className="size-9 rounded-xl bg-primary/10">
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
                <Bot className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-base">Workout co-pilot</CardTitle>
              <CardDescription>
                Clarify first. Draft second. You stay in control of the final workout.
              </CardDescription>
          </div>
          {draft && (
            <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-medium">Draft ready for review</p><p className="text-xs text-muted-foreground">{draft.name} · {draft.workoutSets.length} group{draft.workoutSets.length === 1 ? "" : "s"}</p></div>
              <Button type="button" size="sm" onClick={() => { onApplyDraft(draft); setDraft(null) }}><Sparkles className="size-4" />Apply draft & review</Button>
            </div>
          )}
        </div>
          <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
            <Sparkles className="size-3" />
            AI mode
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <MessageScrollerProvider autoScroll>
          <MessageScroller className="h-[22rem] flex-none">
            <MessageScrollerViewport>
              <MessageScrollerContent>
                <MessageScrollerItem messageId="clarification-note">
                  <Marker variant="separator">
                    <MarkerContent>Clarification-first brief</MarkerContent>
                  </Marker>
                </MessageScrollerItem>
                {messages.map((message) => (
                  <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === "user"}>
                    <Message align={message.role === "user" ? "end" : "start"}>
                      {message.role === "assistant" && (
                        <MessageAvatar>
                          <Avatar className="size-7 rounded-lg">
                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                              <Bot className="size-3.5" />
                            </AvatarFallback>
                          </Avatar>
                        </MessageAvatar>
                      )}
                      <MessageContent>
                        <MessageHeader>{message.role === "user" ? "You" : "GymQuest AI"}</MessageHeader>
                        <Bubble variant={message.role === "user" ? "default" : "muted"}>
                          <BubbleContent>{message.content}</BubbleContent>
                        </Bubble>
                        <MessageFooter>{message.role === "user" ? "Instruction received" : "Drafting boundary"}</MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>

        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Tell the co-pilot what you want to train..."
              className="min-h-20 resize-none bg-background"
              aria-label="Message the workout co-pilot"
            />
            <Button type="button" size="icon" onClick={sendMessage} disabled={!input.trim() || isPending} aria-label="Send message">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {isPending ? "GymQuest AI is clarifying your requirements..." : "The assistant will not write to your workout until you review and apply a structured draft."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
