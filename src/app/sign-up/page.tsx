import AuthLayout from '@/components/auth/auth-layout';
import { SignUpForm } from '@/components/auth/signup-form';
import Link from 'next/link';

export default function SignUpPage() {
  return (
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
  );
}
