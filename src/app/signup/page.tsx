import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Small } from '@/components/typography/small';
import SignUpForm from './_components/sign-up-form';

export default async function SignupPage() {
  return (
    <section className='min-h-screen w-full flex items-center justify-center'>
      <Card className='md:min-w-96'>
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Get started on your questing journey!</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
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
    </section>
  );
};
