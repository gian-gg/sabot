'use client';

import { useEffect } from 'react';
import { populateUser } from '@/store/userStore';

export function HydrateUser({ user }: { user: User | null }) {
  useEffect(() => {
    if (user) {
      populateUser(user);
    }
  }, [user]);

  return null; // nothing visible, just hydrates the store
}
