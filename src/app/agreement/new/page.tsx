'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReviewInvitation } from '@/components/agreement/invite/review-invitation';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { mockInviter } from '@/lib/mock-data/agreements';

type Step = 'review' | 'demo';

export default function InvitePage() {
  const searchParams = useSearchParams();
  const agreementId = searchParams.get('id') || 'demo-doc';
  const [step, setStep] = useState<Step>('review');

  const handleAcceptInvite = () => {
    setStep('demo');
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
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
              Step {step === 'review' ? '1' : '2'}/2
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'review' && (
            <ReviewInvitation
              inviter={mockInviter}
              onAccept={handleAcceptInvite}
            />
          )}

          {step === 'demo' && (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-semibold">See Pactly in Action</h3>
                <p className="text-muted-foreground">
                  Watch how teams collaborate on legal documents in real-time
                  with AI assistance.
                </p>
              </div>

              <div className="grid gap-4">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Interactive Demo</CardTitle>
                    <CardDescription>
                      Try out the editor with sample content and AI suggestions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/agreement/${agreementId}/active`}>
                      <Button className="w-full" size="lg">
                        <Play className="mr-2 h-4 w-4" />
                        Launch Demo Editor
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Video Walkthrough</CardTitle>
                    <CardDescription>
                      Watch a 3-minute overview of Pactly&apos;s key features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted hover:bg-muted/80 flex aspect-video cursor-pointer items-center justify-center rounded-lg transition-colors">
                      <Play className="text-muted-foreground h-12 w-12" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
