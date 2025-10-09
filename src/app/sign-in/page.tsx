import AuthLayout from '@/components/auth/auth-layout';
import { SignInForm } from '@/components/auth/signin-form';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <AuthLayout title="Welcome back" description="Sign in to your account">
      <SignInForm />
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Dont&apos;t have an account?{' '}
        <Link className="text-primary underline" href="/sign-up">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}
