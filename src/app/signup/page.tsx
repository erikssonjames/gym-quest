"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Small } from '@/components/typography/small';
import SignUpForm from './_components/sign-up-form';
import { useState } from 'react';
import VerifyEmailForm from './_components/verify-email-form';

export type SignUpPage = "sign-up-form" | "code-input"
export type SignInData = { email: string; password: string }

export default function SignupPage() {
  const [currentPage, setCurrentPage] = useState<SignUpPage>("sign-up-form")
  const [signInData, setSignInData] = useState<SignInData>()

  const onSuccessfulSignUpForm = (data: SignInData) => {
    setCurrentPage("code-input")
    setSignInData(data)
  }

  return (
    <section className='min-h-screen w-full flex items-center justify-center'>
      {currentPage === "sign-up-form" && (
        <Card className='md:min-w-96 border-none'>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Get started on your questing journey!</CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm
              onSuccessfulSignUpForm={onSuccessfulSignUpForm}
            />
          </CardContent>
          <CardFooter>
            <div className='flex gap-1 items-center mt-10'>
              <Small text="Already have an account?" className='text-muted-foreground' />
              <Link href="/signin" className='flex items-center hover:text-accent-foreground text-primary'>
                <Small text="Sign in." className='font-bold' />
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}

      {currentPage === "code-input" && signInData && (
        <VerifyEmailForm data={signInData} />
      )}
    </section>
  );
};
