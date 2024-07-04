'use client'

import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { type ToasterToast, useToast } from "@/components/ui/use-toast";

import { AuthError, CredentialsSignin } from "next-auth";

import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";
import { ToastAction } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
}).superRefine(({ confirmPassword, password }, ctx) => {
  if (confirmPassword !== password) {
    ctx.addIssue({
      code: 'custom',
      message: 'The passwords did not match',
      path: ['confirmPassword']
    })
  }
})

interface Toast {
  id: string;
  dismiss: () => void;
  update: (props: ToasterToast) => void;
}

export default function SignUpForm() {
	const router = useRouter()
  const { toast } = useToast()

  const utils = api.useUtils()
  const { mutateAsync, isPending } = api.user.signup.useMutation({
      async onSuccess() {
          await utils.user.getMe.invalidate()
      }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      email: '',
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { password, email } = values

    try {
      await mutateAsync({ email, password })
      router.push(`/signup/verify-email?e=${email}`)
    } catch(error) {
      const title = 'Something went wrong!'
      let description = ''
      if (error instanceof AuthError) {
        description = error.message
      } else if (error instanceof CredentialsSignin) {
        description = error.message
      } else {
        description = 'Oops, looks like GymQuest is not working as intended at the moment.'
      }

      toast({
        title,
        description,
        variant: 'destructive'
      })
    }
  }

  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const toastRef = useRef<Toast | null>(null)
  useEffect(() => {
    if (error) {
      if (toastRef.current) {
        toastRef.current.update({
          description: error,
          id: toastRef.current.id
        })
      } else {
        setTimeout(() => {
          toastRef.current = toast({
            title: 'Error',
            description: 'Something went wrong logging in',
            variant: 'destructive',
            duration: Infinity,
            action: (
              <ToastAction
                altText="Contact us"
                onClick={() => console.log('#TODO')}
              >
                Contact us
              </ToastAction>
            )
          })
        }, 500)
      }
    } else if (toastRef.current) {
      toastRef.current.dismiss()
      toastRef.current = null
    }
  }, [error, toast])

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='James@GymQuester.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder='*********' {...field}
                    type='password'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder='*********' {...field}
                    type='password'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            {isPending ? (
              <Loader2Icon className="size-6 animate-spin" />
            ) : (
              <>Sign Up</>
            )}
          </Button>
        </form>
      </Form>
    </>
  )
}