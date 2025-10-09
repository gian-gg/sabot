'use client';

import { createAuthClient } from 'better-auth/react';
import { ROUTES } from '@/constants/routes';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!,
});

export const signInWithGoogle = async () => {
  await authClient.signIn.social({
    provider: 'google',
    callbackURL: ROUTES.HOME.ROOT,
    errorCallbackURL: ROUTES.ERROR,
  });
};

export const { signOut } = createAuthClient();
