'use client'

import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";

import { AuthError, CredentialsSignin } from "next-auth";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import type { SignInData } from "../page";

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

export default function SignUpForm(
  { onSuccessfulSignUpForm }:
  { onSuccessfulSignUpForm: (data: SignInData) => void }
) {
  const utils = api.useUtils()
  const { mutateAsync, isPending } = api.user.signUp.useMutation({
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
      onSuccessfulSignUpForm({ email, password })
    } catch(error) {
      const title = 'Something went wrong!'
      let description = ''
      if (error instanceof AuthError) {
        description = error.message
      } else if (error instanceof CredentialsSignin) {
        description = error.message
      } else if (error instanceof TRPCClientError) {
        description = error.message
      } else {
        console.error(error)
        description = 'Oops, looks like GymQuest is not working as intended at the moment.'
      }

      toast.error(title, { description, closeButton: true, duration: 1000 * 20 })
    }
  }


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
                  <Input placeholder='zyzz@legend.com' {...field} />
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
          <Button type="submit" className="w-full" disabled={isPending}>
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