import { env } from '@/env'
import { Resend } from 'resend'
import { SignUpConfirmEmail } from '@/components/email/verify-email'

const resend = new Resend(env.RESEND_API_KEY)

interface sendVerifyEmailParams {
  email: string
  code: string
}
export default async function sendVerifyEmail({ code, email }: sendVerifyEmailParams) {
  if (env.EMAIL_DELIVERY_MODE === "console") {
    console.info(`[development email] Verification code for ${email}: ${code}`)
    return {
      data: { id: "console-delivery" },
      error: null,
    }
  }

  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject: 'Verify Email',
    text: `Your Gym Quest verification code is ${code}.`,
    react: SignUpConfirmEmail({ code })
  })
}
