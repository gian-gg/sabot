'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GoogleButton from './google-button';
import ForgotPassword from './forgot-password';
import { toast } from 'sonner';

import { signIn } from '@/lib/auth/client';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    if (typeof email !== 'string' || email.length === 0) {
      toast.error('Email is required');
      return;
    }

    if (typeof password !== 'string' || password.length === 0) {
      toast.error('Password is required');
      return;
    }

    setIsPending(true);

    toast.promise(signIn(email, password), {
      loading: 'Loading...',
      success: () => {
        router.push('/dashboard');
        return 'Sign in successful';
      },
      error: (error: Error) => {
        setIsPending(false);
        return error.message || 'Sign in failed';
      },
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <GoogleButton />
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <ForgotPassword />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  Login
                </Button>
              </div>
              <div className="text-destructive bg-destructive/10 border-destructive rounded-md border-2 border-dashed p-4 text-center text-xs">
                App still under development. Sign ups are disabled.
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Made with ♥ by{' '}
        <a
          href="https://github.com/gian-gg/sabot"
          target="_blank"
          rel="noreferrer"
        >
          untitled
        </a>
      </div>
    </div>
  );
}
