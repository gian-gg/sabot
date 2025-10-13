import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { useUserStore } from '@/store/user/userStore';
import HeroAction from './hero-action';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export function HeroSection() {
  const user = useUserStore();
  const router = useRouter();

  // Create dropdown state & click-outside handler
  const [createOpen, setCreateOpen] = useState(false);
  const createRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!createRef.current) return;
      if (!createRef.current.contains(e.target as Node)) {
        setCreateOpen(false);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  function goToTransactionNew() {
    setCreateOpen(false);
    router.push(ROUTES.TRANSACTION.INVITE);
  }

  function goToAgreementNew() {
    setCreateOpen(false);
    router.push(ROUTES.AGREEMENT.INVITE);
  }

  // Removed goToEscrowNew - escrow is now part of agreement finalization

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left side - Description and CTA */}
      <div className="flex flex-col justify-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-foreground text-4xl leading-tight font-bold text-balance lg:text-5xl">
            Hello,{' '}
            <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
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

      {/* Right side - Video placeholder */}
      <Card className="bg-secondary/50 relative flex items-center justify-center overflow-hidden p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-primary/20 flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-sm">
            <Play className="fill-primary text-primary h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-foreground text-xl font-semibold">
              Welcome to Sabot
            </h3>
            <p className="text-muted-foreground text-sm">
              Start your secure transaction journey today
            </p>
          </div>
        </div>
        <div className="from-primary/10 to-accent/10 absolute inset-0 bg-gradient-to-br via-transparent" />
      </Card>
    </div>
  );
}
