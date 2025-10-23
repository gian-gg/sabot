import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Scan } from 'lucide-react';

export function AnalysisInProgress() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <Scan className="text-primary mb-4 h-12 w-12 animate-pulse" />
        <Loader2 className="mb-4 h-6 w-6 animate-spin" />
        <p className="text-muted-foreground text-center">
          AI is analyzing your conversation screenshots...
        </p>
        <p className="text-muted-foreground mt-2 text-center text-sm">
          This may take a few moments
        </p>
      </CardContent>
    </Card>
  );
}
