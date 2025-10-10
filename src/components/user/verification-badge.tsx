import React from 'react';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function VerificationBadge({
  isVerified,
  size = 'md',
}: VerificationBadgeProps) {
  if (isVerified) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-green-500/30 bg-green-500/10 text-green-400"
      >
        <ShieldCheck className={iconSizes[size]} />
        Verified
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1 border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
    >
      <ShieldX className={iconSizes[size]} />
      Unverified
    </Badge>
  );
}
