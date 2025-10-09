import AuthLayout from '@/components/auth/auth-layout';
import { SignUpForm } from '@/components/auth/signup-form';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <AuthLayout
          title="Create an account"
          description="Let's get started. Fill in the details below to create your account."
        >
          <SignUpForm />
          <p className="text-muted-foreground mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link className="text-primary underline" href="/sign-in">
              Sign In
            </Link>
          </p>
        </AuthLayout>
      </div>
    </div>
  );
}
