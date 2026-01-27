import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type VerificationStatus } from '@/types/user';
import { AlertCircle, ArrowRight, Clock, Shield } from 'lucide-react';
import { useState } from 'react';

interface IdentityVerificationRequiredProps {
  userId: string;
  status?: VerificationStatus;
}

export function IdentityVerificationRequired({
  userId,
  status,
}: IdentityVerificationRequiredProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Explicitly handle all status cases
  const isRejected = status === 'rejected';
  const isPending = status === 'pending';
  // Default case: undefined, null, 'not-started', or any other value shows verify prompt
  const shouldShowVerify =
    !status || status === 'not-started' || (!isRejected && !isPending);

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/verify/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        throw new Error('Failed to create verification session');
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url; // Redirect to Didit's hosted verification
      }
    } catch (error) {
      console.error('Verification error:', error);
      // Ideally show a toast error here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <Card
        className={`group relative w-full overflow-hidden border-neutral-800 bg-black/40 p-0 transition-colors ${
          isRejected
            ? 'hover:border-red-900/50'
            : isPending
              ? 'hover:border-blue-900/50'
              : 'hover:border-neutral-700'
        }`}
      >
        <div className="bg-grid-white/[0.02] absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div
          className={`absolute inset-0 bg-gradient-to-r opacity-50 ${
            isRejected
              ? 'from-red-500/10 via-transparent to-transparent'
              : isPending
                ? 'from-blue-500/10 via-transparent to-transparent'
                : 'from-amber-500/5 via-transparent to-transparent'
          }`}
        />

        <div className="relative z-10 flex flex-col items-center justify-between gap-6 p-6 sm:flex-row sm:p-8">
          <div className="flex flex-1 flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="shrink-0 pt-1">
              <div
                className={`flex size-14 items-center justify-center rounded-xl border shadow-[0_0_15px_-3px] ${
                  isRejected
                    ? 'border-red-500/20 bg-red-500/10 shadow-red-500/20'
                    : isPending
                      ? 'border-blue-500/20 bg-blue-500/10 shadow-blue-500/20'
                      : 'border-amber-500/20 bg-amber-500/10 shadow-amber-500/20'
                }`}
              >
                {isRejected ? (
                  <AlertCircle className="size-7 text-red-500" />
                ) : isPending ? (
                  <Clock className="size-7 text-blue-500" />
                ) : (
                  <Shield className="size-7 text-amber-500" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight text-white">
                {isRejected
                  ? 'Verification Rejected'
                  : isPending
                    ? 'Verification Pending'
                    : 'Identity Verification Required'}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-neutral-400">
                {isRejected
                  ? 'Your previous verification attempt was not successful. Please review your details and try again to unlock full platform capabilities.'
                  : isPending
                    ? 'Your verification is currently under review. This usually takes a few minutes. We will notify you once it is complete.'
                    : 'Unlock full platform capabilities including higher limits, trust badges, and premium features by verifying your identity.'}
              </p>
            </div>
          </div>

          {!isPending && (
            <Button
              variant={isRejected ? 'destructive' : 'default'}
              className={`h-10 w-full shrink-0 px-6 font-medium shadow-[0_0_20px_-5px] transition-all sm:w-auto ${
                isRejected
                  ? 'bg-red-600 shadow-red-500/30 hover:bg-red-700'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30'
              }`}
              onClick={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Verify Identity'}
              {!isLoading && <ArrowRight className="ml-2 size-4" />}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
