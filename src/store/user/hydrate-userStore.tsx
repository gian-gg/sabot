'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/user/userStore';
import type { VerificationStatus } from '@/types/user';

export function HydrateUser({
  user,
  verificationStatus,
}: {
  user?: AuthUser | null;
  verificationStatus?: VerificationStatus;
}) {
  const { setId, setEmail, setImage, setName, setVerificationStatus } =
    useUserStore();

  useEffect(() => {
    if (user) {
      setId(user.id);
      setEmail(user.user_metadata.email);
      setImage(user.user_metadata.avatar_url);
      setName(user.user_metadata.full_name);
    }
    setVerificationStatus(verificationStatus ?? 'not-started');
  }, [
    user,
    verificationStatus,
    setId,
    setEmail,
    setImage,
    setName,
    setVerificationStatus,
  ]);

  return null; // nothing visible, just hydrates the store
}
