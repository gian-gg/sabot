import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Scan } from 'lucide-react';
import type { AnalysisStepNavProps } from '@/types/analysis';

interface NoAnalysesProps extends AnalysisStepNavProps {
  isAnalyzing: boolean;
}

export function NoAnalyses({ onStartAnalysis, isAnalyzing }: NoAnalysesProps) {
  return (
    <Card>
      <CardContent className="py-6 text-center">
        <MessageSquare className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <p className="text-muted-foreground mb-4">
          AI analysis of conversation screenshots will appear here
        </p>
        <Button onClick={onStartAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Scan className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>Start Analysis</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
