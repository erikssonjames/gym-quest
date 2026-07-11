'use client'

import { Check, Loader2Icon } from "lucide-react"
import { useDebounce } from "@uidotdev/usehooks"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { AuthShell } from "@/app/_components/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/trpc/react"

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

export default function Create() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const normalizedUsername = username.trim()
  const debouncedUsername = useDebounce(normalizedUsername, 500)

  const { mutateAsync: createUser, isPending: creatingUser } = api.user.createUser.useMutation()
  const {
    mutate: checkUsername,
    isPending: checkingUsername,
    data: usernameCheck,
  } = api.user.checkIfUsernameIsAvailable.useMutation()

  useEffect(() => {
    if (
      debouncedUsername.length < 3 ||
      !USERNAME_PATTERN.test(debouncedUsername)
    ) {
      return
    }

    checkUsername(debouncedUsername)
  }, [checkUsername, debouncedUsername])

  const usernameError =
    normalizedUsername.length > 0 && normalizedUsername.length < 3
      ? "Use at least 3 characters."
      : normalizedUsername.length > 0 && !USERNAME_PATTERN.test(normalizedUsername)
        ? "Use only letters, numbers, and underscores."
        : usernameCheck?.username === normalizedUsername && !usernameCheck.available
          ? "That username is already taken."
          : null

  const usernameIsAvailable =
    normalizedUsername.length >= 3 &&
    USERNAME_PATTERN.test(normalizedUsername) &&
    usernameCheck?.username === normalizedUsername &&
    usernameCheck.available

  const onCreateUser = async () => {
    if (!usernameIsAvailable || creatingUser) return

    try {
      await createUser({ username: normalizedUsername })
      toast.success("Your profile is ready", {
        description: "Welcome to GymQuest. Let's get your first quest moving.",
      })
      router.replace("/user")
      router.refresh()
    } catch (error) {
      toast.error("Could not create your profile", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
    }
  }

  return (
    <AuthShell
      eyebrow="First step"
      title="Choose your quest name."
      description="This is how people in GymQuest will recognize you. Pick something that feels like you."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          You can update your profile details later in settings.
        </p>
      }
    >
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault()
          void onCreateUser()
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="username">Username</Label>
            <span className="text-xs text-muted-foreground">3-20 characters</span>
          </div>
          <div className="relative">
            <Input
              id="username"
              autoComplete="username"
              placeholder="GymQuester"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              aria-invalid={Boolean(usernameError)}
              className="pe-10"
              disabled={creatingUser}
            />
            {checkingUsername && (
              <Loader2Icon
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary"
                aria-label="Checking username availability"
              />
            )}
            {!checkingUsername && usernameIsAvailable && (
              <Check
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
                aria-label="Username is available"
              />
            )}
          </div>
          <div className="min-h-5" aria-live="polite">
            {usernameError ? (
              <p className="text-sm text-destructive">{usernameError}</p>
            ) : usernameIsAvailable ? (
              <p className="text-sm text-primary">That username is available.</p>
            ) : normalizedUsername.length > 0 && !checkingUsername ? (
              <p className="text-sm text-muted-foreground">
                We&apos;ll check availability as you type.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/30 p-4">
          <p className="text-sm font-medium">Make it yours</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Your username appears on posts, milestones, and your profile. Keep it
            easy for your training circle to remember.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!usernameIsAvailable || checkingUsername || creatingUser}
        >
          {creatingUser ? (
            <>
              <Loader2Icon data-icon="inline-start" className="animate-spin" aria-hidden="true" />
              Setting up your profile...
            </>
          ) : (
            "Continue to GymQuest"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
