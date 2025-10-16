'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/user/userStore';

export function HydrateUser({
  user,
  isVerified,
}: {
  user?: AuthUser | null;
  isVerified?: boolean;
}) {
  const setUser = useUserStore();

  useEffect(() => {
    if (user) {
      setUser.setId(user.id);
      setUser.setEmail(user.user_metadata.email);
      setUser.setImage(user.user_metadata.avatar_url);
      setUser.setName(user.user_metadata.full_name);
    }
    setUser.setIsVerified(isVerified ?? false);
  }, [user, isVerified]);

  return null; // nothing visible, just hydrates the store
}
