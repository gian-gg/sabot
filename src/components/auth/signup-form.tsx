'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GoogleButton from './google-button';

export function SignUpForm({}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    toast.info('Sign up is not implemented yet.');
  };

  return (
    <form onSubmit={handleSignUp}>
      <div className="grid gap-6">
        <div className="flex flex-col gap-4">
          <GoogleButton />
        </div>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card text-muted-foreground relative z-10 px-2">
            OR
          </span>
        </div>
        <div className="grid gap-4">
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
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" required />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              name="confirm-password"
              required
            />
          </div>
          <Button type="submit" className="mt-4 w-full" disabled={isPending}>
            Sign Up
          </Button>
        </div>
      </div>
    </form>
  );
}
