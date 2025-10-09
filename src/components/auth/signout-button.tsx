'use client';
import { LogOut } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { ROUTES } from '@/constants/routes';

const SignOut = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  function handleSignOut() {
    setIsPending(true);
    toast.promise(signOut(), {
      loading: 'Signing out...',
      success: () => {
        router.push(ROUTES.ROOT);
        return 'Signed out successfully!';
      },
      error: (error: Error) => {
        setIsPending(false);
        return error.message || 'Sign out failed';
      },
    });
  }
  return (
    <Button onClick={handleSignOut} disabled={isPending}>
      <LogOut /> Sign Out
    </Button>
  );
};

export default SignOut;
