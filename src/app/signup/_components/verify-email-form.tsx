"use client"

import { TRPCClientError } from "@trpc/client"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { ArrowLeft, Loader2Icon } from "lucide-react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import type { SignInData } from "../page"

export default function VerifyEmailForm({
  data,
  onBack,
}: {
  data: SignInData
  onBack: () => void
}) {
  const [code, setCode] = useState("")
  const [isPending, setIsPending] = useState(false)
  const { mutateAsync: verifyEmail } = api.user.verifyEmail.useMutation()
  const router = useRouter()

  const onInputComplete = async (value: string) => {
    setIsPending(true)

    try {
      await verifyEmail({ code: value, email: data.email })

      const response = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (!response || response.error) {
        toast.error("Your email is verified", {
          description: "Your account is ready. Please sign in to continue.",
        })
        router.push("/signin")
        return
      }

      router.push("/user")
    } catch (error) {
      const description =
        error instanceof TRPCClientError || error instanceof Error
          ? error.message
          : "The code could not be verified. Please try again."

      toast.error("Could not verify your email", { description })
      setCode("")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm leading-6 text-muted-foreground">
          Check your inbox for a six-digit code. It was sent to{" "}
          <span className="font-medium text-foreground">{data.email}</span>.
        </p>
        <p className="text-sm text-muted-foreground">
          The code is valid for 24 hours.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="verification-code" className="sr-only">
          Verification code
        </Label>
        <div className="flex justify-center">
          <InputOTP
            id="verification-code"
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={code}
            onChange={setCode}
            onComplete={onInputComplete}
            disabled={isPending}
            aria-label="Six-digit verification code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        {isPending && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <Loader2Icon className="animate-spin" aria-hidden="true" />
            Verifying your code...
          </div>
        )}
      </div>

      <Button type="button" variant="ghost" className="w-full" onClick={onBack} disabled={isPending}>
        <ArrowLeft data-icon="inline-start" aria-hidden="true" />
        Use a different email
      </Button>
    </div>
  )
}
