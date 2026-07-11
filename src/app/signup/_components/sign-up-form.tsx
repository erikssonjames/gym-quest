'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { TRPCClientError } from "@trpc/client"
import { Eye, EyeOff, Loader2Icon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import type { SignInData } from "../page"

const formSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(8, "Use at least 8 characters."),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords do not match.",
        path: ["confirmPassword"],
      })
    }
  })

export default function SignUpForm({
  onSuccessfulSignUpForm,
}: {
  onSuccessfulSignUpForm: (data: SignInData) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { mutateAsync, isPending } = api.user.signUp.useMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const email = values.email.trim().toLowerCase()

    try {
      await mutateAsync({ email, password: values.password })
      onSuccessfulSignUpForm({ email, password: values.password })
    } catch (error) {
      const description =
        error instanceof TRPCClientError || error instanceof Error
          ? error.message
          : "GymQuest is not available right now. Please try again."

      toast.error("Could not create your account", {
        description,
        closeButton: true,
      })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-6 text-muted-foreground">
        We&apos;ll send a quick verification code before your account goes live.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="email"
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
                      autoComplete="new-password"
                      className="pe-10"
                      placeholder="At least 8 characters"
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      autoComplete="new-password"
                      className="pe-10"
                      placeholder="Repeat your password"
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  {field.value.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
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
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
