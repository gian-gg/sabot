'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Shield, Info } from 'lucide-react';

interface Inviter {
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
}

export function ReviewTransactionInvitation({
  inviter,
  onAccept,
  onDecline,
}: ReviewTransactionInvitationProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="space-y-6">
          <button
            onClick={() => setDialogOpen(true)}
            className="bg-muted/50 hover:bg-muted/70 group flex w-full items-center gap-4 rounded-lg p-8 py-6 text-left transition-colors"
          >
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
          </button>

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
                <span>
                  AI will analyze the conversation for safety concerns
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Both parties must verify identity before proceeding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  Transaction details will be recorded on the public ledger
                </span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1 bg-transparent"
            >
              Decline
            </Button>
            <Button onClick={onAccept} className="flex-1">
              Accept Invitation
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Trust Profile</DialogTitle>
            <DialogDescription>
              Detailed information about {inviter.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="ring-primary/20 h-20 w-20 ring-2">
                <AvatarImage
                  src={inviter.avatar || '/placeholder.svg'}
                  alt={inviter.name}
                />
                <AvatarFallback className="text-2xl">
                  {inviter.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{inviter.name}</h3>
                  {inviter.isVerified && (
                    <CheckCircle2 className="text-primary h-6 w-6" />
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{inviter.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-primary/10 border-primary/30 flex items-center gap-3 rounded-lg border p-4">
                <Shield className="text-primary h-8 w-8 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Trust Score</p>
                  <p className="text-2xl font-bold">{inviter.trustScore}%</p>
                </div>
              </div>

              <div className="bg-muted/50 grid gap-4 rounded-lg p-4">
                <div>
                  <p className="text-muted-foreground text-xs">
                    Completed Transactions
                  </p>
                  <p className="text-lg font-semibold">
                    {inviter.completedTransactions}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    Verification Status
                  </p>
                  <p className="flex items-center gap-2 text-lg font-semibold">
                    {inviter.isVerified ? (
                      <>
                        <CheckCircle2 className="text-primary h-5 w-5" />
                        Verified
                      </>
                    ) : (
                      'Unverified'
                    )}
                  </p>
                </div>
              </div>

              <div className="border-primary/30 bg-primary/5 rounded-lg border p-4">
                <p className="text-primary text-sm">
                  <strong>Safety Note:</strong> This user has completed{' '}
                  {inviter.completedTransactions} verified transactions with a{' '}
                  {inviter.trustScore}% trust score. All transactions are
                  monitored for safety.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
