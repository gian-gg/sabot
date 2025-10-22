/* eslint-disable */
// @ts-nocheck

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, Info } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface EnableEscrowButtonProps {
  transactionId?: string;
  agreementId?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * EnableEscrowButton Component
 *
 * Button that allows users to enable escrow protection for a transaction or agreement.
 * Opens a dialog to explain escrow benefits and redirects to escrow creation with context.
 *
 * @param transactionId - Optional transaction ID to link escrow to
 * @param agreementId - Optional agreement ID to link escrow to
 * @param variant - Button variant
 * @param size - Button size
 * @param className - Additional CSS classes
 */
export function EnableEscrowButton({
  transactionId,
  agreementId,
  variant = 'outline',
  size = 'default',
  className = '',
}: EnableEscrowButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleEnableEscrow = () => {
    setIsCreating(true);

    // Build query params for context
    const params = new URLSearchParams();
    if (transactionId) params.set('transaction_id', transactionId);
    if (agreementId) params.set('agreement_id', agreementId);

    const url = params.toString()
      ? `${ROUTES.ESCROW.NEW}?${params.toString()}`
      : ROUTES.ESCROW.NEW;

    router.push(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Shield className="mr-2 h-4 w-4" />
          Enable Escrow Protection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Enable Escrow Protection
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to this transaction with escrow
            protection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Escrow ensures both parties fulfill their obligations before funds
              or items are released.
            </AlertDescription>
          </Alert>

          {/* Benefits List */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Benefits of Escrow:</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>
                  <strong>Secure Holding:</strong> Items or funds are held
                  securely until both parties confirm completion
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>
                  <strong>Dispute Resolution:</strong> Independent arbiters
                  available to resolve disagreements
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>
                  <strong>Transparent Timeline:</strong> All actions are logged
                  with timestamps for accountability
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>
                  <strong>Verified Parties:</strong> Option to require identity
                  verification for all participants
                </span>
              </li>
            </ul>
          </div>

          {/* Context Info */}
          {(transactionId || agreementId) && (
            <div className="bg-muted/50 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">
                This will create an escrow linked to your{' '}
                {transactionId ? 'transaction' : 'agreement'}, preserving all
                existing details.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleEnableEscrow} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Create Escrow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
