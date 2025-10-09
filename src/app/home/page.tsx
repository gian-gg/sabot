import React from 'react';
import SignOut from '@/components/auth/signout-button';
import { ROUTES } from '@/constants/routes';
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
  CardFooter,
  CardAction,
} from '@/components/ui/card';

import { getSession } from '@/lib/auth/server';

export default async function Home() {
  const session = await getSession();

  if (!session || !session.user) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <Card className="w-lg">
        <CardHeader>
          <CardTitle>Halo, {session.user.name}!</CardTitle>
          <CardDescription>{session.user.email}</CardDescription>
          <CardAction>
            <SignOut />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-2">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ut magnam
          reiciendis sequi, in nihil architecto voluptas provident commodi iusto
          dolor.
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-muted-foreground text-sm">
            Lorem ipsum dolor sit amet.
          </p>
        </CardFooter>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Made with ♥ by{' '}
        <a href={ROUTES.SOCIALS.GITHUB} target="_blank" rel="noreferrer">
          untitled
        </a>
      </div>
    </div>
  );
}
