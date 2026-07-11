'use client'

import { TRPCClientError } from "@trpc/client"
import { motion } from "framer-motion"
import { ArrowUpRight, Check, LoaderCircle, SendHorizontal, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/trpc/react"

export default function WelcomeText() {
  const [email, setEmail] = useState("")
  const { mutateAsync, variables, isPending, isSuccess } = api.user.joinWaitlist.useMutation()

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const onWaitlistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValidEmail(email)) return

    try {
      await mutateAsync({ email })
      toast.success("You are on the list", {
        description: "We will let you know when GymQuest is ready for your next session.",
      })
    } catch (error) {
      toast.error("Could not join the waitlist", {
        description:
          error instanceof TRPCClientError || error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      })
    }
  }

  const joinedWaitlist = isSuccess && variables?.email === email

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
        <Sparkles className="size-3" aria-hidden="true" />
        A better way to train, together
      </Badge>

      <div>
        <h1 className="text-5xl font-semibold tracking-tight text-primary sm:text-7xl">
          Working out,
        </h1>
        <motion.div
          transition={{
            delay: 1,
            type: "spring",
            bounce: 0.7,
            duration: 1,
          }}
          initial={{ y: 50, opacity: 0 }}
          animate={{
            opacity: 100,
            y: [null, -5, 20, 0],
          }}
        >
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            But with a{" "}
            <motion.span
              className="relative inline-block origin-top-right translate-x-4 overflow-hidden"
              transition={{
                delay: 1.05,
                duration: 0.3,
                ease: [0, 0.71, 0.2, 1.01],
                damping: 5,
                stiffness: 100,
                restDelta: 0.001,
                type: "spring",
              }}
              initial={{ rotate: 0, translateX: 16 }}
              animate={{ rotate: -10, translateX: 16 }}
            >
              twist.
              <motion.div
                className="absolute bottom-0 block w-full border-b-4 border-primary"
                transition={{
                  duration: 0.3,
                  delay: 1.5,
                  damping: 5,
                  stiffness: 100,
                  restDelta: 0.001,
                  type: "spring",
                }}
                initial={{ x: 150 }}
                animate={{ x: 0 }}
              />
            </motion.span>
          </h1>
        </motion.div>
      </div>

      <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
        GymQuest turns your training routine into a living quest log, so every
        session has a little more direction and every milestone has somewhere to land.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/signup">
            Join the quest
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="#how-it-works">See how it works</Link>
        </Button>
      </div>

      <Card className="max-w-lg border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="gap-2 p-5 sm:p-6">
          <CardTitle className="text-base">Not ready to commit?</CardTitle>
          <CardDescription>
            Join the early list and be first to know when the next quest opens.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <form onSubmit={onWaitlistSubmit} className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="waitlist-email" className="sr-only">
                Email address
              </Label>
              <Input
                id="waitlist-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!isValidEmail(email) || isPending}
              aria-label={joinedWaitlist ? "Joined waitlist" : "Join waitlist"}
            >
              {isPending ? (
                <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
              ) : joinedWaitlist ? (
                <Check data-icon="inline-start" aria-hidden="true" />
              ) : (
                <SendHorizontal data-icon="inline-start" aria-hidden="true" />
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="p-5 pt-0 sm:p-6 sm:pt-0">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {joinedWaitlist ? "You are on the list." : "No noise. Just the occasional useful update."}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
