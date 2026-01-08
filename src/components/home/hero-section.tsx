import { Card } from '@/components/ui/card';
import { useUserStore } from '@/store/user/userStore';
import { useEffect, useRef } from 'react';
import HeroAction from './hero-action';

export function HeroSection() {
  const user = useUserStore();

  // Create dropdown state & click-outside handler
  const createRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDoc() {
      if (!createRef.current) return;
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  // Removed goToEscrowNew - escrow is now part of agreement finalization

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left side - Description and CTA */}
      <div className="flex flex-col justify-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-foreground text-4xl leading-tight font-bold text-balance lg:text-5xl">
            Hello,{' '}
            <span className="from-primary to-accent bg-linear-to-r bg-clip-text text-transparent">
              {user.name.split(' ')[0]}
            </span>
          </h1>
          <p className="text-muted-foreground w-lg text-base leading-relaxed text-pretty">
            Sabot provides third-party security verification for online
            transactions, leveraging advanced AI to detect fraud, monitor
            suspicious activity, and ensure every transaction is protected with
            enterprise-grade security protocols.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* existing verify/account actions */}
          <HeroAction />
        </div>
      </div>

      {/* Right side - YouTube Video */}
      <Card className="relative overflow-hidden p-0">
        <div className="aspect-video">
          <iframe
            src="https://www.youtube.com/embed/C1Waaw8ZgMU?si=YourOptionalSiParam&rel=0&modestbranding=1&showinfo=0"
            title="Welcome to Sabot"
            className="h-full w-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </Card>
    </div>
  );
}
