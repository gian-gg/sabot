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

interface AgreementLinkProps {
  link: string;
}

export function AgreementLink({ link }: AgreementLinkProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: 'Link copied!',
      description: 'Share this link with your collaborator',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Agreement Created!</CardTitle>
        <CardDescription>
          Share this link with your collaborator to get started
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
                Enter the email address of your collaborator
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="collaborator@example.com"
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

        <div className="border-t pt-4">
          <Link href={`/agreement/${link.split('=')[1]}`}>
            <Button className="w-full" size="lg">
              Continue to Agreement Setup
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
