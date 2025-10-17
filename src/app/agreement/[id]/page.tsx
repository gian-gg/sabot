'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PartiesInfo } from '@/components/agreement/id/parties-info';
import { Clock, FileText } from 'lucide-react';

export default function AgreementProgressPage() {
  const params = useParams();
  const agreementId = params.id as string;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Agreement Progress</h1>
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-600"
            >
              <Clock className="mr-1 h-3 w-3" />
              In Progress
            </Badge>
          </div>
          <p className="text-muted-foreground">Agreement ID: {agreementId}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Parties Involved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PartiesInfo />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h2>Partnership Agreement</h2>
                <p className="text-muted-foreground">
                  This agreement is currently being drafted by both parties. The
                  collaborative editor is active and changes are being made in
                  real-time.
                </p>
                <div className="bg-muted mt-4 rounded-lg p-4">
                  <p className="text-muted-foreground text-sm">
                    <strong>Status:</strong> Both parties are actively working
                    on the document. You can view the live editing session or
                    wait for the parties to finalize the agreement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
