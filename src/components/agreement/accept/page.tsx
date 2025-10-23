'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReviewAgreementInvitation } from '@/components/agreement/invite/review-invitation';
import { toast } from 'sonner';
import { AgreementWithParticipants } from '@/types/agreement';

interface AcceptAgreementPageProps {
  agreementId: string;
}

export function AcceptAgreementPage({ agreementId }: AcceptAgreementPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [agreement, setAgreement] = useState<AgreementWithParticipants | null>(
    null
  );
  interface Inviter {
    name: string;
    email: string;
    avatar?: string;
    trustScore: number;
    isVerified: boolean;
    completedTransactions: number;
  }

  const [inviter, setInviter] = useState<Inviter | null>(null);

  // Fetch agreement data on mount
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/agreement/${agreementId}/status`);

        if (!response.ok) {
          toast.error('Agreement not found');
          router.push(ROUTES.HOME.ROOT);
          return;
        }

        const data = await response.json();
        setAgreement(data.agreement);

        // Get creator details as inviter
        if (data.participants.length > 0) {
          const creator = data.participants.find(
            (p: { role: string }) => p.role === 'creator'
          );
          if (creator) {
            setInviter({
              name: creator.name || 'Agreement Creator',
              email: creator.email || 'unknown@example.com',
              avatar: creator.avatar,
              trustScore: 85, // TODO: Fetch from user profile
              isVerified: true, // TODO: Fetch from user profile
              completedTransactions: 0, // TODO: Fetch from user profile
            });
          }
        }
      } catch (error) {
        console.error('Error fetching agreement:', error);
        toast.error('Failed to load agreement');
        router.push(ROUTES.HOME.ROOT);
      } finally {
        setLoading(false);
      }
    };

    fetchAgreement();
  }, [agreementId, router]);

  const handleAcceptInvite = async () => {
    try {
      setAccepting(true);
      const response = await fetch('/api/agreement/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreement_id: agreementId }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to join agreement');
        return;
      }

      toast.success('You have accepted the invitation!');
      // Navigate to configure step
      router.push(`/agreement/configure?id=${agreementId}`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    router.push(ROUTES.HOME.ROOT);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading agreement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agreement || !inviter) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12">
            <p className="text-muted-foreground text-center">
              Agreement not found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">Agreement Invitation</CardTitle>
              <CardDescription>
                You&apos;ve been invited to collaborate on an agreement
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary"
            >
              Step 1/1
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ReviewAgreementInvitation
            inviter={inviter}
            onAccept={handleAcceptInvite}
            onDecline={handleDecline}
            loading={accepting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
