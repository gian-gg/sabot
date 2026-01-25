'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/user/userStore';
import type { UserVerificationData } from '@/types/user';
import type { AuthUser } from '@/types';

export function HydrateUser({
  user,
  userVerificationData,
}: {
  user?: AuthUser | null;
  userVerificationData?: UserVerificationData;
}) {
  const {
    setId,
    setEmail,
    setImage,
    setName,
    setVerificationStatus,
    setUserRole,
  } = useUserStore();

  useEffect(() => {
    if (user) {
      setId(user.id);
      setEmail(user.user_metadata.email);
      setImage(user.user_metadata.avatar_url);
      setName(user.user_metadata.full_name);
    }
    setVerificationStatus(
      userVerificationData?.verification_status ?? 'not-started'
    );
    setUserRole(userVerificationData?.role ?? 'user');
  }, [
    user,
    userVerificationData,
    setId,
    setEmail,
    setImage,
    setName,
    setVerificationStatus,
    setUserRole,
  ]);

  return null; // nothing visible, just hydrates the store
}
