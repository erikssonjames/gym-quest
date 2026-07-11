import { providerMap } from '@/auth.config';
import { AuthShell } from '@/app/_components/auth-shell';
import Link from 'next/link';
import SignInForm from './_components/sign-in-form';

export default async function SignInPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in and get questing."
      description="Pick up where you left off and keep your next milestone in sight."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      <SignInForm providers={providerMap} />
    </AuthShell>
  );
}
