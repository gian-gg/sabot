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
  const { setId, setEmail, setImage, setName, setIsVerified } = useUserStore();

  useEffect(() => {
    if (user) {
      setId(user.id);
      setEmail(user.user_metadata.email);
      setImage(user.user_metadata.avatar_url);
      setName(user.user_metadata.full_name);
    }
    setIsVerified(isVerified ?? false);
  }, [user, isVerified, setId, setEmail, setImage, setName, setIsVerified]);

  return null; // nothing visible, just hydrates the store
}
