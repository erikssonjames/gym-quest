'use client'

import { AuthError, CredentialsSignin } from "next-auth"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { type PROVIDER } from "@/variables/auth"

const formSchema = z.object({
  usernameOrEmail: z.string().min(3, {
    message: "Enter your email or username.",
  }),
  password: z.string().min(1, {
    message: "Enter your password.",
  }),
})

export default function SignInForm({
  providers,
}: {
  providers: { id: PROVIDER; name: string }[]
}) {
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      usernameOrEmail: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true)

    try {
      const response = await signIn("credentials", {
        email: values.usernameOrEmail,
        username: values.usernameOrEmail,
        password: values.password,
        redirect: false,
      })

      if (!response || response.error) {
        toast.error("Invalid login details.")
        form.setError("usernameOrEmail", {
          type: "server",
          message: "Check your email or username.",
        })
        form.setError("password", {
          type: "server",
          message: "Check your password.",
        })
        return
      }

      router.push("/user")
    } catch (error) {
      let description = "GymQuest is not available right now. Please try again."

      if (error instanceof AuthError || error instanceof CredentialsSignin) {
        description = error.message
      }

      toast.error("Something went wrong", { description })
    } finally {
      setIsPending(false)
    }
  }

  const providerIcon = (id: string) => {
    if (id !== "discord") return null

    return (
      <svg
        aria-hidden="true"
        className="size-5"
        fill="currentColor"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
      </svg>
    )
  }

  const onProviderSignIn = async (id: string) => {
    setIsPending(true)

    try {
      const response = await signIn(id, {
        callbackUrl: "/user",
        redirect: false,
      })

      if (!response || response.error) {
        toast.error("Could not connect your account.")
        return
      }

      if (response.url) {
        window.location.assign(response.url)
      }
    } catch (error) {
      toast.error("Could not connect your account", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setIsPending(false)
    }
  }

  const externalProviders = providers.filter((provider) => provider.id !== "credentials")

  return (
    <div className="flex flex-col gap-7">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="usernameOrEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or username</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="username"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      autoComplete="current-password"
                      className="pe-10"
                      placeholder="Your password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  {field.value.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2Icon data-icon="inline-start" className="animate-spin" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>

      {externalProviders.length > 0 && (
        <>
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Or continue with
            </span>
            <Separator className="flex-1" />
          </div>
          <div className="flex justify-center gap-3">
            {externalProviders.map((provider) => (
              <Button
                key={provider.id}
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onProviderSignIn(provider.id)}
                disabled={isPending}
                aria-label={`Continue with ${provider.name}`}
              >
                {providerIcon(provider.id)}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
