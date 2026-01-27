'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function VerifyCallback() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsAnimating(true), 100);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirect timer
    const redirectTimer = setTimeout(() => {
      router.push('/user');
    }, 3000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4">
      <div className="bg-grid-white/[0.02] absolute inset-0" />

      <div className="relative z-10">
        <Card
          className={`relative w-full max-w-md overflow-hidden border-neutral-800 bg-black/40 p-8 text-center backdrop-blur-xl transition-all duration-700 ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent" />

          <div className="relative z-10 space-y-6">
            {/* Animated checkmark */}
            <div className="flex justify-center">
              <div
                className={`relative transition-all duration-500 ${
                  isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-45'
                }`}
              >
                <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20" />
                <div className="relative flex size-20 items-center justify-center rounded-full bg-green-500/10 ring-2 ring-green-500/20">
                  <CheckCircle2 className="size-12 text-green-500" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Verification Submitted!
              </h1>
              <p className="text-sm leading-relaxed text-neutral-400">
                We&apos;ve received your verification details. Your submission
                is now pending admin review.
              </p>
            </div>

            {/* Divider */}
            <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

            {/* Redirect info */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                <Loader2 className="size-4 animate-spin" />
                <span>Redirecting to your profile...</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-neutral-800/50 text-sm font-semibold text-neutral-400">
                  {countdown}
                </div>
                <span className="text-xs text-neutral-500">
                  {countdown === 1 ? 'second' : 'seconds'}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-1.5 overflow-hidden rounded-full bg-neutral-800/50">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-linear"
                style={{
                  width: `${((3 - countdown) / 3) * 100}%`,
                }}
              />
            </div>
          </div>
        </Card>

        {/* Background decoration */}
        <div className="absolute -top-32 -left-32 size-64 rounded-full bg-green-500/5 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 size-64 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>
    </div>
  );
}
