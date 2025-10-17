'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Play } from 'lucide-react';

export default function AgreementHomePage() {
  const router = useRouter();

  const handleStartAgreement = () => {
    // Redirect to the invite page (create flow)
    router.push('/agreement/invite');
  };

  return (
    <div className="bg-background min-h-screen pt-16 pb-4">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight">
            Collaborative Agreement Drafting
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
            Create, collaborate, and finalize legal agreements with AI
            assistance in real-time.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Start New Agreement</CardTitle>
              <CardDescription>
                Create a collaborative agreement with AI-powered assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center">
              <Button
                className="w-full"
                size="lg"
                onClick={handleStartAgreement}
              >
                <Play className="mr-2 h-4 w-4" />
                Create Agreement
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Video Walkthrough</CardTitle>
              <CardDescription>
                Watch a 3-minute overview of Sabot&apos;s key features
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
    </div>
  );
}
