import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SignInForm from './_components/sign-in-form';
import { providerMap } from '@/auth.config';
import Link from 'next/link';
import { Small } from '@/components/typography/small';
 
export default async function LoginForm() {
  return (
    <section className='min-h-screen w-full flex items-center justify-center'>
      <Card className='md:min-w-96'>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>And get questing right away!</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm providers={providerMap} />
        </CardContent>
        <CardFooter>
          <div className='flex gap-2 items-center mt-10'>
            <Small text="Don't have an account?" className='text-muted-foreground' />
            <Link href="/signup" className='flex items-center hover:text-accent-foreground text-primary'>
              <Small text="Sign up." className='font-bold' />
            </Link>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}