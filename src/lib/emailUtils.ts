import { env } from '@/env'
import { Resend } from 'resend'
import { SignUpConfirmEmail } from '@/components/email/verify-email'

const resend = new Resend(env.RESEND_API_KEY)

interface sendVerifyEmailParams {
  email: string
  code: string
}
export default async function sendVerifyEmail({ code, email }: sendVerifyEmailParams) {
  return await resend.emails.send({
    from: 'GymQuest <onboarding@gymquest.net>',
    to: [email],
    subject: 'Verify Email',
    text: '?',
    react: SignUpConfirmEmail({ code })
  })
}