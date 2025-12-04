'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, Mail } from 'lucide-react';
import Link from 'next/link';

interface InvitationLinkProps {
  link: string;
  type: 'agreement' | 'transaction';
  showContinueButton?: boolean;
}

export function InvitationLink({
  link,
  type,
  showContinueButton = true,
}: InvitationLinkProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const isAgreement = type === 'agreement';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: 'Link copied!',
      description: `Share this link with your ${isAgreement ? 'collaborator' : 'counterparty'}`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    // Mock email sending
    toast({
      title: 'Invitation sent!',
      description: `Email sent to ${email}`,
    });
    setEmail('');
  };

  // Extract ID from link (handles both ?id=xyz and direct paths)
  const extractId = () => {
    if (link.includes('?id=')) {
      return link.split('=')[1];
    }
    return 'demo-id';
  };

  const continueUrl = isAgreement
    ? `/agreement/${extractId()}`
    : `/transaction/${extractId()}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {isAgreement ? 'Agreement' : 'Transaction'} Created!
        </CardTitle>
        <CardDescription>
          Share this link with your{' '}
          {isAgreement ? 'collaborator' : 'counterparty'} to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Shareable Link</Label>
          <div className="flex gap-2">
            <Input value={link} readOnly className="font-mono text-sm" />
            <Button onClick={handleCopy} variant="outline" size="icon">
              {copied ? (
                <Check className="text-primary h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full bg-transparent">
              <Mail className="mr-2 h-4 w-4" />
              Send via Email
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Invitation Email</DialogTitle>
              <DialogDescription>
                Enter the email address of your{' '}
                {isAgreement ? 'collaborator' : 'counterparty'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={`${isAgreement ? 'collaborator' : 'counterparty'}@example.com`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendEmail}
                disabled={!email}
                className="w-full"
              >
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {showContinueButton && (
          <div className="border-t pt-4">
            <Button asChild className="w-full" size="lg">
              <Link href={continueUrl}>
                Continue to {isAgreement ? 'Agreement' : 'Transaction'} Setup
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
