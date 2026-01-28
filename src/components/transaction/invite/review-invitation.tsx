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

interface ReviewTransactionInvitationProps {
  inviter: Inviter;
  onAccept: () => void;
  onDecline: () => void;
  accepting?: boolean;
  disabled?: boolean;
}

export function ReviewTransactionInvitation({
  inviter,
  onAccept,
  onDecline,
  accepting = false,
  disabled = false,
}: ReviewTransactionInvitationProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
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

        <div className="space-y-3">
          <h4 className="font-semibold">What happens next?</h4>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                You&apos;ll upload a screenshot of your conversation with the
                seller
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>AI will analyze the conversation for safety concerns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Transaction details will be recorded on the public ledger
              </span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onDecline}
            className="flex-1 bg-transparent"
            disabled={accepting || disabled}
          >
            Decline
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1"
            disabled={accepting || disabled}
          >
            {accepting ? (
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
