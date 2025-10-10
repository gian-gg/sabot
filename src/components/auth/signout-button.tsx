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
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isPending}
      className="text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
};

export default SignOut;
