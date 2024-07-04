'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { ArrowLeft, Loader2Icon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Status = 'verifying-token' | 'error-verifying-token' | 
              'signing-in' | 'error-signing-in' | 'error' | 'idle'

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const email = searchParams.get('e')
  const router = useRouter()
  const { mutateAsync } = api.user.verifyEmail.useMutation()
  const [status, setStatus] = useState<Status>('idle')
  const [token, setToken] = useState<string>('')

  const handleSubmitTokenManually = async () => {
    if (!token || !email) return router.replace('/signup?redirect=true')
      
    let res: { email: string, password: string } | undefined;
    try {
      setStatus('verifying-token')
      res = await mutateAsync({
        email,
        token
      })
    } catch (e) {
      setStatus('error-verifying-token')
      return
    }

    if (!res) {
      setStatus('error')
      return
    }
    
    try {
      setStatus('signing-in')
      await signIn('credentials', {
        redirect: false,
        ...res
      })

      router.replace('/user')
    } catch (e) {
      setStatus('error-signing-in')
    }
  }

  useEffect(() => {
    if (!email) router.replace('/signup?redirect=true')
  }, [email, router])

  return (
    <section className="min-h-screen w-full flex justify-center items-center">
      <Card className="w-96">
        <CardHeader>
          <Button 
            variant='link'
            className="group w-fit ps-0"
            onClick={() => router.push('/signup')}
          >
            <ArrowLeft className="mr-2 size-4" /> Return to sign up 
          </Button>
          <CardTitle>Verify your email.</CardTitle>
          <CardDescription>
            We sent an email to {email ? email : 'your email'}. Please follow the instructions in the email.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-2">
          <div className="space-y-4">
            <Input 
              placeholder="Paste token here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button 
              onClick={handleSubmitTokenManually} 
              className="w-full flex items-center"
            >
              {status === 'idle' && (
                <>Submit token</>
              )} 

              {status === 'error-verifying-token' && (
                <>Verifying <Loader2Icon className="ms-2 size-4 animate-spin" /></>
              )}
              {status === 'error-verifying-token' && (
                <>Token has expired.</>
              )}

              {status === 'signing-in' && (
                <>Signing in <Loader2Icon className="ms-2 size-6 animate-spin" /></>
              )}
              {status === 'error-signing-in' && (
                <>Could not sign in. Please try again.</>
              )}

              {status === 'error' && (
                <>Something went wrong. Try again.</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}