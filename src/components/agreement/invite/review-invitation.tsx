'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Info, Loader2 } from 'lucide-react';

interface Inviter {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  trustScore: number;
  isVerified: boolean;
  completedTransactions: number;
}

interface ReviewAgreementInvitationProps {
  inviter: Inviter;
  onAccept: () => void;
  onDecline: () => void;
  loading?: boolean;
}

export function ReviewAgreementInvitation({
  inviter,
  onAccept,
  onDecline,
  loading = false,
}: ReviewAgreementInvitationProps) {
  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Header section (clickable link to user profile) */}
        <Link
          href={`/user/${inviter.id}`}
          target="_blank"
          rel="noopener noreferrer"
          title="View Profile"
        >
          <div className="bg-muted/50 hover:bg-muted/70 group flex w-full items-center gap-4 rounded-lg p-8 py-6 text-left transition-colors">
            <Avatar className="ring-primary/20 h-16 w-16 ring-2">
              <AvatarImage
                src={inviter.avatar || '/placeholder.svg'}
                alt={inviter.name}
              />
              <AvatarFallback>{inviter.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{inviter.name}</h3>
                {inviter.isVerified && (
                  <CheckCircle2 className="text-primary h-5 w-5" />
                )}
              </div>
              <p className="text-muted-foreground text-sm">{inviter.email}</p>
            </div>

            <Info className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors" />
          </div>
        </Link>

        {/* "What happens next" section */}
        <div className="space-y-3">
          <h4 className="font-semibold">What happens next?</h4>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                You&apos;ll select an agreement template that fits your needs
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Collaborate in real-time with AI-assisted drafting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Both parties must confirm before finalizing</span>
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={loading}
            className="flex-1 bg-transparent"
          >
            Decline
          </Button>
          <Button onClick={onAccept} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
