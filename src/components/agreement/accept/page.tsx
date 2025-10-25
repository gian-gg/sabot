'use client';

import { ReviewAgreementInvitation } from '@/components/agreement/invite/review-invitation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AcceptAgreementPageProps {
  agreementId: string;
}

interface Inviter {
  name: string;
  email: string;
  avatar?: string;
  trustScore: number;
  isVerified: boolean;
  completedTransactions: number;
}

interface AgreementData {
  id: string;
  creator_id: string;
  title?: string;
  status: string;
  agreement_type?: string;
  created_at: string;
}

export function AcceptAgreementPage({ agreementId }: AcceptAgreementPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSelfInvite, setIsSelfInvite] = useState(false);
  const [agreement, setAgreement] = useState<AgreementData | null>(null);
  const [inviter, setInviter] = useState<Inviter | null>(null);

  // Fetch agreement data on mount
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import dynamically to get fresh instance
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError('You must be logged in to accept an invitation');
          setLoading(false);
          return;
        }

        console.log('Fetching agreement:', agreementId, 'for user:', user.id);

        const response = await fetch(`/api/agreement/${agreementId}/status`);

        if (!response.ok) {
          if (response.status === 401) {
            setError('You must be logged in to accept this invitation');
          } else if (response.status === 404) {
            setError('Agreement not found or has been deleted');
          } else {
            setError('Failed to load agreement details');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('📋 Agreement data received:', data);

        const agreementData = data.agreement as AgreementData;
        setAgreement(agreementData);

        // Check if current user is the creator (self-invite)
        if (user.id === agreementData.creator_id) {
          setIsSelfInvite(true);
          setLoading(false);
          return;
        }

        // Get creator details as inviter
        // Try to find creator in participants, otherwise create from agreement data
        let creatorInviter: Inviter | null = null;

        if (data.participants && data.participants.length > 0) {
          const creator = data.participants.find(
            (p: { role: string }) => p.role === 'creator'
          );
          if (creator) {
            creatorInviter = {
              name: creator.name || 'Agreement Creator',
              email: creator.email || 'unknown@example.com',
              avatar: creator.avatar || undefined, // Use the avatar from enriched participant data
              trustScore: 85,
              isVerified: true,
              completedTransactions: 0,
            };
          }
        }

        // Fallback if no participant data (should not happen with the API update)
        if (!creatorInviter) {
          creatorInviter = {
            name: 'Agreement Creator',
            email: 'unknown@example.com',
            avatar: undefined,
            trustScore: 85,
            isVerified: true,
            completedTransactions: 0,
          };
        }

        setInviter(creatorInviter);

        console.log('✅ Inviter set:', creatorInviter);
      } catch (err) {
        console.error('Error fetching agreement:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load agreement'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAgreement();
  }, [agreementId]);

  const handleAcceptInvite = async () => {
    if (accepting) return; // Prevent double-click

    try {
      setAccepting(true);
      const response = await fetch('/api/agreement/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreement_id: agreementId }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));

        // Handle specific errors
        if (errorData.error?.includes('already joined')) {
          toast.info('You have already joined this agreement');
          // Still redirect them to the agreement
          setTimeout(() => {
            router.push(`/agreement/configure?id=${agreementId}`);
          }, 800);
          return;
        }

        if (
          errorData.error?.includes('cannot accept your own') ||
          errorData.error?.includes('own invitation')
        ) {
          toast.error('You cannot accept your own invitation link');
          setTimeout(() => {
            router.push(ROUTES.HOME.ROOT);
          }, 1500);
          return;
        }

        throw new Error(errorData.error || 'Failed to join agreement');
      }

      const data = await response.json();

      if (data.already_joined) {
        toast.info('You have already joined this agreement');
      } else {
        toast.success('Successfully joined agreement!');
      }

      // Redirect to configure page
      setTimeout(() => {
        router.push(`/agreement/configure?id=${agreementId}`);
      }, 800);
    } catch (error) {
      console.error('Error joining agreement:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to join agreement'
      );
      setAccepting(false); // Re-enable button on error
    }
  };

  const handleDecline = () => {
    router.push(ROUTES.HOME.ROOT);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
            <p className="text-muted-foreground">
              Loading agreement details...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show self-invite error
  if (isSelfInvite) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Invalid Invitation</CardTitle>
            <CardDescription>
              You cannot accept your own invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Self-Invitation Not Allowed</AlertTitle>
              <AlertDescription>
                This is your own agreement invitation link. You cannot join an
                agreement that you created. Please share this link with the
                other party instead.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push(ROUTES.HOME.ROOT)}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !agreement || !inviter) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Error</CardTitle>
            <CardDescription>Failed to load invitation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || 'Unable to load agreement details. Please try again.'}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push(ROUTES.HOME.ROOT)}
              className="w-full"
            >
              Return to Home
            </Button>
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
