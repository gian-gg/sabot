'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ReviewTransactionInvitation } from '@/components/transaction/invite/review-invitation';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { toast } from 'sonner';

interface AcceptTransactionPageProps {
  transactionId: string;
}

// Mock inviter data - replace with actual data fetching
const mockInviter = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: undefined,
  trustScore: 92,
  isVerified: true,
  completedTransactions: 15,
};

export function AcceptTransactionPage({
  transactionId,
}: AcceptTransactionPageProps) {
  const router = useRouter();

  const { status } = useTransactionStatus(transactionId);

  // Navigate to upload page when both users join
  useEffect(() => {
    if (
      status?.is_ready_for_next_step &&
      status.transaction.status === 'both_joined'
    ) {
      console.log('Invitee - Both joined! Navigating to upload page...');
      toast.success('Both joined! Proceeding to upload...');
      setTimeout(() => {
        router.push(`${ROUTES.TRANSACTION.UPLOAD}?id=${transactionId}`);
      }, 1500);
    }
  }, [status, transactionId, router]);

  const handleAcceptInvite = async () => {
    try {
      const response = await fetch('/api/transaction/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to join transaction');
      }

      toast.success('Successfully joined transaction!');
      // Wait for status update via real-time hook
    } catch (error) {
      console.error('Error joining transaction:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to join transaction'
      );
    }
  };

  const handleDecline = () => {
    router.push(ROUTES.HOME.ROOT);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Transaction Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to a verified transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewTransactionInvitation
            inviter={mockInviter}
            onAccept={handleAcceptInvite}
            onDecline={handleDecline}
          />
        </CardContent>
      </Card>
    </div>
  );
}
