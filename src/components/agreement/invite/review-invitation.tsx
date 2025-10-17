'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Shield } from 'lucide-react';
import type { User } from '@/lib/mock-data/agreements';

interface ReviewInvitationProps {
  inviter: User;
  onAccept: () => void;
}

export function ReviewInvitation({ inviter, onAccept }: ReviewInvitationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">You&apos;ve Been Invited!</CardTitle>
        <CardDescription>
          Review the invitation details before accepting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 flex items-center gap-4 rounded-lg p-4">
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
            <div className="mt-2 flex items-center gap-2">
              <Shield className="text-primary h-4 w-4" />
              <span className="text-sm font-medium">
                Trust Score: {inviter.trustScore}%
              </span>
            </div>
          </div>
        </div>

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

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1 bg-transparent">
            Decline
          </Button>
          <Button onClick={onAccept} className="flex-1">
            Accept Invitation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
