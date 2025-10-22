'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ImageIcon } from 'lucide-react';

interface Screenshot {
  id: string;
  file_path: string;
  user_id: string;
  created_at: string;
  screenshot_url: string;
}

interface RawScreenshotsProps {
  transactionId: string;
}

export function RawScreenshots({ transactionId }: RawScreenshotsProps) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScreenshots = useCallback(async () => {
    try {
      // Fetch from the analyses endpoint which includes screenshot_url
      const response = await fetch(
        `/api/transaction/${transactionId}/analyses`
      );

      if (response.ok) {
        const data = (await response.json()) as {
          analyses?: Array<{
            screenshot_id: string;
            transaction_screenshots: { file_path: string };
            user_id: string;
            created_at: string;
            screenshot_url: string;
          }>;
        };
        // Extract unique screenshots from analyses
        const uniqueScreenshots = Array.from(
          new Map(
            data.analyses?.map((analysis) => [
              analysis.screenshot_id,
              {
                id: analysis.screenshot_id,
                file_path: analysis.transaction_screenshots.file_path,
                user_id: analysis.user_id,
                created_at: analysis.created_at,
                screenshot_url: analysis.screenshot_url,
              },
            ]) || []
          ).values()
        );
        setScreenshots(uniqueScreenshots);
      }
    } catch (error) {
      console.error('Failed to fetch screenshots:', error);
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    fetchScreenshots();
  }, [fetchScreenshots]);

  if (loading) {
    return (
      <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          <span className="ml-2 text-neutral-400">Loading screenshots...</span>
        </CardContent>
      </Card>
    );
  }

  if (screenshots.length === 0) {
    return (
      <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ImageIcon className="h-5 w-5" />
            Uploaded Screenshots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <ImageIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-neutral-400">No screenshots uploaded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ImageIcon className="h-5 w-5" />
          Uploaded Screenshots
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {screenshots.map((screenshot) => (
            <div key={screenshot.id} className="space-y-2">
              <div className="overflow-hidden rounded-lg border border-neutral-700 bg-black/40">
                <img
                  src={screenshot.screenshot_url}
                  alt="Transaction screenshot"
                  className="h-auto w-full object-cover"
                  style={{ maxHeight: '300px' }}
                />
              </div>
              <div className="text-xs text-neutral-500">
                <p>
                  {new Date(screenshot.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
