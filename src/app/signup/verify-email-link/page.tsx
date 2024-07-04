'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function VerifyEmailLink() {
  const searchParams = useSearchParams()
  const email = searchParams.get('e')
  const token = searchParams.get('t')
  const router = useRouter()
  const { mutateAsync, isPending, isSuccess, isError } = api.user.verifyEmail.useMutation()
  const [errorMessage, setErrorMesssage] = useState('')

  const hasMadeRequestRef = useRef<boolean>(false)

  const handleVerifyEmail = useCallback(async () => {
    if (hasMadeRequestRef.current) return

    hasMadeRequestRef.current = true

    if (!email || !token) return router.replace('/signup?redirect=true')
    try {
      const res = await mutateAsync({
        email,
        token
      })

      await signIn('credentials', {
        redirect: false,
        ...res
      })

      router.replace('/user')

      // if (res instanceof TRPCError) throw res
    } catch (e) {
      setErrorMesssage('Invalid token')
    }
  }, [email, token, router, mutateAsync])

  useEffect(() => {
    if (!email || !token) router.replace('/signup?redirect=true')
    
    if (token && email && !hasMadeRequestRef.current) {
      console.log('request')
      void handleVerifyEmail()
    }
  }, [email, token, router, handleVerifyEmail])

  return (
    <section className="min-h-screen w-full flex justify-center items-center">
      <Card className="min-w-80">
        <CardHeader>
          <CardTitle>
            {(isSuccess && !isPending) && 'Verified!'}
            {(isPending || (!isSuccess && !isError)) && 'Verifying...'}
            {isError && !isPending && 'Error.'}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-2" onClick={handleVerifyEmail}>
          <div className="w-full flex items-center justify-center">
            {(isSuccess && !isPending) && 'Verified!'}
            {(isPending || (!isSuccess && !isError)) && <Loader2 className="size-10 animate-spin" />}
            {isError && !isPending && errorMessage}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}