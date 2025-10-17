'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export function VerificationStep() {
  return (
    <Card>
      <CardContent className="space-y-8 pt-4 pb-8">
        <div className="space-y-6 text-center">
          <div className="relative inline-block">
            <Sparkles className="h-16 w-16 animate-pulse text-purple-400" />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-semibold text-white">
              Verifying Transaction
            </h3>
            <p className="text-sm text-neutral-400">
              AI is cross-referencing both screenshots...
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="mx-auto max-w-sm space-y-2">
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <CheckCircle2 className="text-primary h-4 w-4 flex-shrink-0" />
              <span>Screenshots uploaded successfully</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <CheckCircle2 className="text-primary h-4 w-4 flex-shrink-0" />
              <span>Detecting message authenticity</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <CheckCircle2 className="text-primary h-4 w-4 flex-shrink-0" />
              <span>Cross-referencing conversation data</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="border-primary h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
              <span>Generating transaction summary</span>
            </div>
          </div>
          <div className="mx-auto flex max-w-md items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
            <AlertCircle className="text-primary h-4 w-4 flex-shrink-0" />
            <p className="text-xs text-green-300">
              No inconsistencies detected. Preparing your transaction...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
