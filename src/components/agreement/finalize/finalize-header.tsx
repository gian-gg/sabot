'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Party {
  id: string;
  name: string;
  color: string;
  hasConfirmed: boolean;
}

interface FinalizeHeaderProps {
  documentId: string;
  agreementTitle?: string;
  parties?: Party[];
}

export function FinalizeHeader({
  documentId,
  agreementTitle = 'Agreement',
  parties = [],
}: FinalizeHeaderProps) {
  const [mouseX, setMouseX] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <header className="glass fixed top-0 right-0 left-0 z-50 w-full border-none">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Back button and title */}
        <div className="flex items-center gap-4">
          <Link
            href={`/agreement/${documentId}/active`}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Back to editor"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-foreground text-base font-semibold">
            {agreementTitle}
          </h1>
        </div>

        {/* Right: Party avatars with confirmation status */}
        <div className="flex items-center gap-3">
          {parties.map((party) => (
            <div key={party.id} className="flex items-center gap-2">
              <Avatar
                className={cn(
                  'h-8 w-8 border-2',
                  party.hasConfirmed ? 'border-primary' : 'border-border'
                )}
              >
                <AvatarFallback style={{ backgroundColor: party.color }}>
                  {party.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              {party.hasConfirmed && <Check className="text-primary h-4 w-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Mouse-Reactive Border */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg,
            rgba(255,255,255,0.1) 0%,
            rgba(255,255,255,0.1) ${Math.max(0, mouseX - 150)}px,
            rgba(255,255,255,0.6) ${Math.max(0, mouseX - 50)}px,
            rgba(255,255,255,1) ${mouseX}px,
            rgba(255,255,255,0.6) ${mouseX + 50}px,
            rgba(255,255,255,0.1) ${mouseX + 150}px,
            rgba(255,255,255,0.1) 100%
          )`,
          transition: 'background 100ms ease-out',
        }}
      />
    </header>
  );
}
