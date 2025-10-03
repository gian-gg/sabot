import React from 'react';
import SignOut from '@/components/auth/sign-out';
export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      Hello, World!
      <SignOut />
    </div>
  );
}
