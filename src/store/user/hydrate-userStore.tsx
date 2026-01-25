'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/user/userStore';
import type { UserVerificationData } from '@/types/user';

interface AuthUser {
  id: string;
  user_metadata: {
    avatar_url: string;
    full_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
}

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
