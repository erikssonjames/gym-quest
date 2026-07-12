"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Bot,
  Check,
  Dumbbell,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import type { CreateWorkoutInput } from "@/server/db/schema/workout"
import { api } from "@/trpc/react"
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
    content:
      "Let’s build this together. What is the main goal for the workout, and how much time do you have?",
  },
]

export default function AiWorkoutChat({
  onApplyDraft,
  onExit,
}: {
  onApplyDraft: (draft: CreateWorkoutInput) => void
  onExit: () => void
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")
  const [draft, setDraft] = useState<CreateWorkoutInput | null>(null)
  const [view, setView] = useState<"conversation" | "suggestion">("conversation")
  const { data: exercises } = api.exercise.getExercises.useQuery()
  const exerciseNames = useMemo(
    () => new Map(exercises?.map((exercise) => [exercise.id, exercise.name]) ?? []),
    [exercises],
  )

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

      if (response.draft) {
        setDraft(response.draft)
        setView("suggestion")
      }
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const sendMessage = () => {
    const content = input.trim()
    if (!content || isPending) return

    const nextMessages = [
      ...messages,
      { id: `${Date.now()}-user`, role: "user" as const, content },
    ]
    setMessages(nextMessages)
    setInput("")
    mutate({
      messages: nextMessages.map(({ role, content: messageContent }) => ({
        role,
        content: messageContent,
      })),
    })
  }

  if (view === "suggestion" && draft) {
    const exerciseCount = draft.workoutSets.reduce(
      (count, set) => count + set.workoutSetCollections.length,
      0,
    )

    return (
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="size-10 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  <Sparkles />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl">Your workout is ready</CardTitle>
                <CardDescription>
                  Review the suggested plan before adding it to the manual builder.
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary">
              <Check />
              Suggestion ready
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-5 p-5 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{draft.category || "Custom"}</Badge>
              <Badge variant="outline">
                {draft.workoutSets.length} training group{draft.workoutSets.length === 1 ? "" : "s"}
              </Badge>
              <Badge variant="outline">
                {exerciseCount} exercise{exerciseCount === 1 ? "" : "s"}
              </Badge>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{draft.name}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {draft.description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {draft.workoutSets.map((set, index) => (
              <Card key={set.id ?? `suggested-set-${index}`} className="shadow-none">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-sm">Training group {index + 1}</CardTitle>
                    <Badge variant="secondary">
                      {set.workoutSetCollections.length} exercise{set.workoutSetCollections.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 p-4 pt-0">
                  {set.workoutSetCollections.map((collection, collectionIndex) => {
                    const setCount = collection.reps.length
                    const reps = new Set(collection.reps).size === 1
                      ? `${collection.reps[0] ?? 0} reps`
                      : "varied reps"
                    const duration = new Set(collection.duration).size === 1
                      ? `${collection.duration[0] ?? 0}s work`
                      : "varied duration"
                    const rest = new Set(collection.restTime).size === 1
                      ? `${collection.restTime[0] ?? 0}s rest`
                      : "varied rest"
                    const workTarget = collection.reps.some((value) => value > 0) ? reps : duration

                    return (
                      <div
                        key={collection.id ?? `${collection.exerciseId}-${collectionIndex}`}
                        className="flex items-start justify-between gap-3 rounded-lg border bg-muted/20 p-3"
                      >
                        <div className="flex min-w-0 items-start gap-2">
                          <Dumbbell />
                          <div className="flex min-w-0 flex-col gap-1">
                            <p className="truncate text-sm font-medium">
                              {exerciseNames.get(collection.exerciseId) ?? "Exercise"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {workTarget} · {rest}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {setCount} set{setCount === 1 ? "" : "s"}
                        </Badge>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col-reverse gap-2 border-t bg-muted/20 p-4 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => setView("conversation")}>
            <MessageSquare data-icon="inline-start" />
            Keep talking
          </Button>
          <Button type="button" onClick={() => onApplyDraft(draft)}>
            <Check data-icon="inline-start" />
            Use this workout
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="flex min-h-[34rem] flex-col overflow-hidden shadow-sm">
      <CardHeader className="border-b bg-muted/30 p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="size-10 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                <Bot />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg">Plan with GymQuest AI</CardTitle>
              <CardDescription>
                Talk through your goal and constraints. A workout appears only when the plan is agreed.
              </CardDescription>
            </div>
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={onExit}>
            <ArrowLeft data-icon="inline-start" />
            Manual builder
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <MessageScrollerProvider autoScroll>
          <MessageScroller className="min-h-[22rem] flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto w-full max-w-3xl gap-5 px-4 py-6 md:px-6">
                {messages.map((message) => (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={message.role === "user"}
                  >
                    <Message align={message.role === "user" ? "end" : "start"}>
                      {message.role === "assistant" && (
                        <MessageAvatar>
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-muted">
                              <Bot />
                            </AvatarFallback>
                          </Avatar>
                        </MessageAvatar>
                      )}
                      <MessageContent>
                        <MessageHeader>{message.role === "user" ? "You" : "GymQuest AI"}</MessageHeader>
                        <Bubble variant={message.role === "user" ? "default" : "muted"}>
                          <BubbleContent>{message.content}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}

                {isPending && (
                  <MessageScrollerItem messageId="ai-thinking">
                    <Message align="start">
                      <MessageAvatar>
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-muted">
                            <Sparkles />
                          </AvatarFallback>
                        </Avatar>
                      </MessageAvatar>
                      <MessageContent>
                        <MessageHeader>GymQuest AI is thinking</MessageHeader>
                        <Bubble variant="muted">
                          <BubbleContent className="flex w-48 flex-col gap-2 py-1">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-4/5" />
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>
      </CardContent>

      <CardFooter className="border-t bg-background p-3 md:p-4">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
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
              placeholder="Describe your goal, available time, equipment, or preferences…"
              className="min-h-20 resize-none"
              aria-label="Message the workout assistant"
              disabled={isPending}
            />
            <Button
              type="button"
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isPending}
              aria-label="Send message"
            >
              <Send />
            </Button>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Enter to send · Shift + Enter for a new line</span>
            {draft && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setView("suggestion")}>
                <RotateCcw data-icon="inline-start" />
                View suggestion
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
