'use client';

import { Coins } from 'lucide-react';
import { useSabotBalance } from '@/hooks/useSabotBalance';
import { cn } from '@/lib/utils';

interface WalletBalanceProps {
  variant?: 'default' | 'large';
  showLabel?: boolean;
  className?: string;
}

export function WalletBalance({
  variant = 'default',
  showLabel = true,
  className,
}: WalletBalanceProps) {
  const { balance, isLoading } = useSabotBalance();

  const balanceClasses = cn(
    'flex items-center gap-2',
    variant === 'large' && 'text-3xl font-bold',
    variant === 'default' && 'text-lg',
    className
  );

  if (isLoading) {
    return (
      <div className={balanceClasses}>
        <Coins className="h-5 w-5" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className={balanceClasses}>
      <Coins className="h-5 w-5" />
      <span>{balance} $SBT</span>
      {showLabel && (
        <span className="text-muted-foreground text-sm">(Sabot Tokens)</span>
      )}
    </div>
  );
}
