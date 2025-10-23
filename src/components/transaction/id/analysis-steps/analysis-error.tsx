import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { AnalysisStepNavProps } from '@/types/analysis';

interface AnalysisErrorProps extends AnalysisStepNavProps {
  error: string;
}

export function AnalysisError({ error, onRetry }: AnalysisErrorProps) {
  return (
    <Card>
      <CardContent className="py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="mb-4">
              <p className="font-medium">Analysis Failed</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
