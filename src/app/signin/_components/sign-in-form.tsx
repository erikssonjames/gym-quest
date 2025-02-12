'use client'

import { H4 } from "@/components/typography/h4";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "next-auth/react";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { type PROVIDER } from "@/variables/auth";
import { toast } from "sonner";

const formSchema = z.object({
  usernameOrEmail: z.string().min(3, {
    message: 'Must provide your email or usesrname.'
  }),
  password: z.string()
})

export default function SignInForm({ providers }: { providers: { id: PROVIDER, name: string }[] }) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      usernameOrEmail: ''
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { password, usernameOrEmail } = values

    try {
      const res = await signIn('credentials', {
        email: usernameOrEmail,
        username: usernameOrEmail,
        password,
        redirect: false
      })
      
      if (res?.error) {
        toast.error('Error', {
          description: 'Something went wrong!',
        })
      } else {
        router.push('/user')
      }
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

      toast.error(title, { description })
    }
  }

  const providerIcon = (id: string) => {
    switch (id) {
    case 'discord': {
      return (
      // <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Discord</title><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
        <svg fill="#5865F2" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Discord</title><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
      )
    }
    }
      
  }

  const onProviderSignIn = async (id: string) => {
    try {
      await signIn(id, {
        redirect: false
      })
    } catch (e) {
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='usernameOrEmail'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username/Email</FormLabel>
                <FormControl>
                  <Input placeholder='GymQuester305' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passsword</FormLabel>
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
          <Button className="w-full">Sign In</Button>
        </form>
      </Form>
      <div className='my-8 flex items-center'>
        <Separator className="w-fit flex-grow" />
        <H4 className='px-4' text='or' />
        <Separator className="w-fit flex-grow" />
      </div>
      <div className="flex w-full items-center justify-center">
        {providers.filter(p => p.id !== 'credentials').map((provider) => (
          <Button 
            key={provider.id} variant='outline'
            onClick={() => onProviderSignIn(provider.id)}
          >
            <span className="size-6 flex items-center justify-center">
              {providerIcon(provider.id)}
            </span>
          </Button>
        ))}
      </div>
    </>
  )
}