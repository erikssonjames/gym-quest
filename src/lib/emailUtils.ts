import { env } from '@/env'
import { Resend } from 'resend'
import { VerifyEmailTemplate } from '@/components/email/verify-email'

const resend = new Resend(env.RESEND_API_KEY)

interface sendVerifyEmailParams {
  email: string
  token: string
}
export default async function sendVerifyEmail({ token, email }: sendVerifyEmailParams) {
  return await resend.emails.send({
    from: 'GymQuest <onboarding@gymquest.net>',
    to: [email],
    subject: 'Verify Email',
    text: '?',
    react: VerifyEmailTemplate({ validationCode: token, email })
  })
}