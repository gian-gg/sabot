'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Scan,
  User,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import type { ConversationData } from '@/lib/gemini/conversation';

interface AnalysisWithScreenshot extends ConversationData {
  screenshot_url: string;
}

interface ScreenshotAnalysisProps {
  transactionId: string;
}

export function ScreenshotAnalysis({ transactionId }: ScreenshotAnalysisProps) {
  const [analyses, setAnalyses] = useState<AnalysisWithScreenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchAnalyses = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/transaction/${transactionId}/analyses`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const startAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(
        `/api/transaction/${transactionId}/analyze-screenshots`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        await fetchAnalyses(); // Refresh data
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading analysis...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Conversation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <div className="py-6 text-center">
              <MessageSquare className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground mb-4">
                AI analysis of conversation screenshots will appear here
              </p>
              <Button onClick={startAnalysis} disabled={analyzing}>
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Scan className="mr-2 h-4 w-4" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {analyses.map((analysis, index) => (
                <div key={index} className="rounded-lg border p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <User className="text-muted-foreground h-5 w-5" />
                    <span className="font-medium">
                      {analysis.buyerName || analysis.sellerName || 'Party'}
                      &apos;s Conversation
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {analysis.platform}
                    </Badge>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Screenshot Image */}
                    <div className="space-y-2">
                      <h4 className="text-muted-foreground text-sm font-medium">
                        Screenshot
                      </h4>
                      <div className="bg-muted/50 overflow-hidden rounded-lg border">
                        <img
                          src={analysis.screenshot_url}
                          alt="Conversation screenshot"
                          className="h-auto w-full object-contain"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                    </div>

                    {/* Analysis Data */}
                    <div className="space-y-4">
                      <h4 className="text-muted-foreground text-sm font-medium">
                        Extracted Information
                      </h4>

                      <div className="space-y-3">
                        {analysis.itemDescription && (
                          <div className="bg-muted/50 rounded-md p-3">
                            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Item
                            </span>
                            <p className="mt-1 text-sm font-medium">
                              {analysis.itemDescription}
                            </p>
                          </div>
                        )}

                        {analysis.agreedPrice && (
                          <div className="bg-muted/50 rounded-md p-3">
                            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Price
                            </span>
                            <p className="mt-1 text-lg font-bold text-green-600">
                              {analysis.currency}{' '}
                              {analysis.agreedPrice.toLocaleString()}
                            </p>
                          </div>
                        )}

                        {analysis.meetingLocation && (
                          <div className="bg-muted/50 rounded-md p-3">
                            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Location
                            </span>
                            <p className="mt-1 text-sm font-medium">
                              {analysis.meetingLocation}
                            </p>
                          </div>
                        )}

                        {analysis.meetingTime && (
                          <div className="bg-muted/50 rounded-md p-3">
                            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Time
                            </span>
                            <p className="mt-1 text-sm font-medium">
                              {analysis.meetingTime}
                            </p>
                          </div>
                        )}

                        {analysis.extractedText && (
                          <div className="bg-muted/50 rounded-md p-3">
                            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Full Conversation
                            </span>
                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                              {analysis.extractedText}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {analysis.riskFlags.length > 0 && (
                    <Alert className="mt-6">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="mb-2 font-medium">
                          Potential Concerns Detected:
                        </div>
                        <ul className="list-inside list-disc space-y-1 text-sm">
                          {analysis.riskFlags.map((flag, i) => (
                            <li key={i}>{flag}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground text-sm">
                        Analysis Complete
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {Math.round(analysis.confidence * 100)}% confidence
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
