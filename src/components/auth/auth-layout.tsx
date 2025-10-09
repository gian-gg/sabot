import React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getSession } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
  title,
  description,
  className,
  ...props
}: {
  title: string;
  description: string;
  className?: string;
} & React.ComponentProps<'div'>) {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <Card className={cn('flex w-full max-w-sm gap-6', className)}>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{props.children}</CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By continuing, you agree to our{' '}
        <a href="#" rel="noreferrer">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" rel="noreferrer">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
