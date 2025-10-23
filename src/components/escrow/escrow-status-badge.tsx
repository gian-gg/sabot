import { Badge } from '@/components/ui/badge';
import type { EscrowStatus } from '@/types/escrow';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Shield,
  HourglassIcon,
} from 'lucide-react';

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Returns the appropriate badge variant for an escrow status
 */
function getStatusVariant(
  status: EscrowStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'active':
    case 'awaiting_confirmation':
      return 'secondary';
    case 'disputed':
    case 'arbiter_review':
      return 'destructive';
    case 'pending':
      return 'outline';
    case 'cancelled':
    case 'expired':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Returns the appropriate icon for an escrow status
 */
function getStatusIcon(status: EscrowStatus) {
  const iconClass = 'h-3 w-3';

  switch (status) {
    case 'completed':
      return <CheckCircle2 className={iconClass} />;
    case 'active':
      return <Clock className={iconClass} />;
    case 'awaiting_confirmation':
      return <HourglassIcon className={iconClass} />;
    case 'disputed':
    case 'arbiter_review':
      return <AlertCircle className={iconClass} />;
    case 'pending':
      return <Clock className={iconClass} />;
    case 'cancelled':
    case 'expired':
      return <XCircle className={iconClass} />;
    default:
      return <Shield className={iconClass} />;
  }
}

/**
 * Returns human-readable label for an escrow status
 */
function getStatusLabel(status: EscrowStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'active':
      return 'Active';
    case 'awaiting_confirmation':
      return 'Awaiting Confirmation';
    case 'completed':
      return 'Completed';
    case 'disputed':
      return 'Disputed';
    case 'arbiter_review':
      return 'Arbiter Review';
    case 'cancelled':
      return 'Cancelled';
    case 'expired':
      return 'Expired';
    default:
      return 'Unknown';
  }
}

/**
 * EscrowStatusBadge Component
 *
 * Displays a styled badge with icon indicating the current escrow status.
 * Follows Sabot design system with consistent colors and icons.
 *
 * @param status - The current escrow status
 * @param size - Badge size (sm, md, lg)
 */
export function EscrowStatusBadge({
  status,
  size = 'md',
}: EscrowStatusBadgeProps) {
  const variant = getStatusVariant(status);
  const icon = getStatusIcon(status);
  const label = getStatusLabel(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <Badge
      variant={variant}
      className={`flex items-center gap-1.5 ${sizeClasses[size]}`}
    >
      {icon}
      <span>{label}</span>
    </Badge>
  );
}
