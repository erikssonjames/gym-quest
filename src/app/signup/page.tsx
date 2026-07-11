"use client"

import Link from 'next/link';
import SignUpForm from './_components/sign-up-form';
import { useState } from 'react';
import VerifyEmailForm from './_components/verify-email-form';
import { AuthShell } from '@/app/_components/auth-shell';

export type SignUpPage = "sign-up-form" | "code-input"
export type SignInData = { email: string; password: string }

export default function SignupPage() {
  const [currentPage, setCurrentPage] = useState<SignUpPage>("sign-up-form")
  const [signInData, setSignInData] = useState<SignInData>()

  const onSuccessfulSignUpForm = (data: SignInData) => {
    setCurrentPage("code-input")
    setSignInData(data)
  }

  const onBackToSignUp = () => {
    setCurrentPage("sign-up-form")
    setSignInData(undefined)
  }

  const isVerificationPage = currentPage === "code-input"

  return (
    <AuthShell
      eyebrow={isVerificationPage ? "Step 2 of 2" : "Start your quest"}
      title={isVerificationPage ? "Confirm your email." : "Create your account."}
      description={
        isVerificationPage
          ? `Enter the six-digit code we sent to ${signInData?.email ?? "your inbox"}.`
          : "Build a training rhythm that is easier to track, share, and keep."
      }
      footer={
        !isVerificationPage ? (
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        ) : undefined
      }
    >
      {currentPage === "sign-up-form" && (
        <SignUpForm onSuccessfulSignUpForm={onSuccessfulSignUpForm} />
      )}

      {currentPage === "code-input" && signInData && (
        <VerifyEmailForm data={signInData} onBack={onBackToSignUp} />
      )}
    </AuthShell>
  );
};
