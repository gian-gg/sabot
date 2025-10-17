'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Play, Plus } from 'lucide-react';

export default function AgreementHomePage() {
  const router = useRouter(); // Initialize the router

  const handleStartTransaction = () => {
    // Redirect to the invite page (create flow)
    router.replace('/transaction/invite');
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
          <Link href="/agreement/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create New Agreement
            </Button>
          </Link>
        </div>

        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">See Pactly in Action</h2>
          <p className="text-muted-foreground mb-6">
            Watch how teams collaborate on legal documents in real-time with AI
            assistance.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Interactive Demo</CardTitle>
              <CardDescription>
                Try out the editor with sample content and AI suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center">
              {/* Removed Link component and added onClick to the Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleStartTransaction} // Call the redirect function on click
              >
                <Play className="mr-2 h-4 w-4" />
                Start Transaction
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
