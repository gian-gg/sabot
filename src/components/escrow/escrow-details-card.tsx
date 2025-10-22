import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EscrowStatusBadge } from './escrow-status-badge';
import { UserAvatar } from '@/components/user/user-avatar';
import { VerificationBadge } from '@/components/user/verification-badge';
import type { EscrowWithParticipants } from '@/types/escrow';
import {
  Calendar,
  DollarSign,
  Package,
  Clock,
  Shield,
  User,
  CheckCircle2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EscrowDetailsCardProps {
  escrow: EscrowWithParticipants;
  currentUserRole?: 'initiator' | 'participant';
}

/**
 * Formats currency amount
 */
function formatCurrency(
  amount: number | undefined,
  currency: string = 'USD'
): string {
  if (amount === undefined || amount === null) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Formats date to relative time
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';

  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
}

/**
 * EscrowDetailsCard Component
 *
 * Displays comprehensive details about an escrow transaction including:
 * - Status and basic info
 * - Party information (initiator and participant)
 * - Transaction details (amount, deliverables)
 * - Timeline information
 * - Confirmation status
 *
 * @param escrow - The escrow transaction with participant details
 * @param currentUserRole - The current user's role in the transaction
 */
export function EscrowDetailsCard({ escrow }: EscrowDetailsCardProps) {
  const isInitiatorConfirmed = escrow.initiator_confirmation === 'confirmed';
  const isParticipantConfirmed =
    escrow.participant_confirmation === 'confirmed';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{escrow.title}</CardTitle>
            <CardDescription>{escrow.description}</CardDescription>
          </div>
          <EscrowStatusBadge status={escrow.status} size="md" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Transaction Details */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Package className="h-4 w-4" />
            Transaction Details
          </h3>
          <div className="bg-muted/50 grid gap-3 rounded-lg p-4">
            {escrow.amount && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  Amount
                </span>
                <span className="font-medium">
                  {formatCurrency(escrow.amount, escrow.currency)}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between">
              <span className="text-muted-foreground flex items-center gap-2 text-sm">
                <Package className="h-4 w-4" />
                Deliverable
              </span>
              <span className="max-w-xs text-right text-sm font-medium">
                {escrow.deliverable_description}
              </span>
            </div>
            {escrow.expected_completion_date && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Expected Completion
                </span>
                <span className="text-sm font-medium">
                  {new Date(
                    escrow.expected_completion_date
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Parties Information */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4" />
            Parties
          </h3>
          <div className="space-y-3">
            {/* Initiator */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={escrow.initiator.name}
                  avatar={escrow.initiator.avatar}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{escrow.initiator.name}</p>
                    <VerificationBadge
                      isVerified={escrow.initiator.isVerified}
                      size="sm"
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">Initiator</p>
                </div>
              </div>
              {isInitiatorConfirmed && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </div>

            {/* Participant */}
            {escrow.participant ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={escrow.participant.name}
                    avatar={escrow.participant.avatar}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{escrow.participant.name}</p>
                      <VerificationBadge
                        isVerified={escrow.participant.isVerified}
                        size="sm"
                      />
                    </div>
                    <p className="text-muted-foreground text-xs">Participant</p>
                  </div>
                </div>
                {isParticipantConfirmed && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-3">
                <p className="text-muted-foreground text-center text-sm">
                  Waiting for participant to join
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Arbiter Information */}
        {escrow.arbiter_requested && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-600">
              <Shield className="h-4 w-4" />
              Arbiter Requested
            </h3>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
              {escrow.arbiter ? (
                <div className="flex items-center gap-3">
                  <UserAvatar name={escrow.arbiter.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{escrow.arbiter.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Reviewing dispute
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Waiting for arbiter assignment
                </p>
              )}
              {escrow.arbiter_decision &&
                escrow.arbiter_decision !== 'pending' && (
                  <div className="mt-2 border-t border-amber-200 pt-2 dark:border-amber-900">
                    <p className="text-xs font-medium">
                      Decision: {escrow.arbiter_decision}
                    </p>
                    {escrow.arbiter_notes && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {escrow.arbiter_notes}
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4" />
            Timeline
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {formatDate(escrow.created_at)}
              </span>
            </div>
            {escrow.initiator_confirmed_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Initiator confirmed
                </span>
                <span className="font-medium">
                  {formatDate(escrow.initiator_confirmed_at)}
                </span>
              </div>
            )}
            {escrow.participant_confirmed_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Participant confirmed
                </span>
                <span className="font-medium">
                  {formatDate(escrow.participant_confirmed_at)}
                </span>
              </div>
            )}
            {escrow.completed_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">
                  {formatDate(escrow.completed_at)}
                </span>
              </div>
            )}
            {escrow.expires_at && escrow.status !== 'completed' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-medium">
                  {formatDate(escrow.expires_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Required Notice */}
        {escrow.verification_required && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <Shield className="mr-2 inline-block h-4 w-4" />
              This escrow requires identity verification for both parties
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
