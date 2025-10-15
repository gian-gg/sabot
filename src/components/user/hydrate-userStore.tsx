'use client';

import { useEffect } from 'react';
import { populateUser } from '@/store/userStore';

export function HydrateUser({ user }: { user: AuthUser | null }) {
  useEffect(() => {
    if (user) {
      populateUser(
        user.id,
        user.user_metadata.email,
        user.user_metadata.avatar_url,
        user.user_metadata.full_name
      );
    }
  }, [user]);

  return null; // nothing visible, just hydrates the store
}
