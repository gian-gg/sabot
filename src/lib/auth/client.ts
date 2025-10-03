'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!,
});

export const signIn = async (email: string, password: string) => {
  try {
    const response = await authClient.signIn.email({
      email,
      password,
    });

    if (!response.data) {
      throw new Error(response.error.message);
    }

    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Sign in failed');
  }
};

export const { signOut } = createAuthClient();
