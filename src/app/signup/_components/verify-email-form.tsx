"use client"

import { H3 } from "@/components/typography/h3"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { api } from "@/trpc/react"
import type { SignInData } from "../page"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export default function VerifyEmailForm ({ data }: { data: SignInData }) {
  const [isPending, setIsPending] = useState(false)
  const { mutateAsync: verifyEmail } = api.user.verifyEmail.useMutation()

  const router = useRouter()

  const onInputComplete = async (args: unknown) => {
    setIsPending(true)
    const code = String(args)
    const { email, password } = data

    try {
      await verifyEmail({ code, email })
      await signIn("credentials", {
        redirect: false,
        email,
        password
      })
      router.push("/user")
    } catch (error) {
      console.error(error)
    }
    setIsPending(false)
  };
  

  return (
    <div className="">
      <div className='mb-10'>
        <H3 text='Verification Email sent!' />
        <p className='text-muted-foreground text-sm'>
          Please enter the code sent to #{data.email}.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative">
          <InputOTP 
            maxLength={6} 
            pattern={REGEXP_ONLY_DIGITS}
            onComplete={onInputComplete}
            disabled={isPending}
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
          {isPending && (
            <div className="absolute -right-10 top-0 h-full flex items-center">
              <Loader2 className="animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}