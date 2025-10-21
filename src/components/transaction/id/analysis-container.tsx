import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan } from 'lucide-react';
import { FetchingAnalyses } from './analysis-steps/fetching-analyses';
import { NoAnalyses } from './analysis-steps/no-analyses';
import { AnalysisInProgress } from './analysis-steps/analysis-in-progress';
import { AnalysisComplete } from './analysis-steps/analysis-complete';
import { AnalysisError } from './analysis-steps/analysis-error';
import type { AnalysisStep, AnalysisData } from '@/types/analysis';

interface AnalysisContainerProps {
  step: AnalysisStep;
  analyses: AnalysisData[];
  error?: string;
  isAnalyzing: boolean;
  onStartAnalysis: () => void;
  onRetry: () => void;
}

export function AnalysisContainer({
  step,
  analyses,
  error,
  isAnalyzing,
  onStartAnalysis,
  onRetry,
}: AnalysisContainerProps) {
  const renderStep = () => {
    switch (step) {
      case 'FETCHING_ANALYSES':
        return <FetchingAnalyses />;

      case 'NO_ANALYSES':
        return (
          <NoAnalyses
            onStartAnalysis={onStartAnalysis}
            isAnalyzing={isAnalyzing}
          />
        );

      case 'ANALYSIS_IN_PROGRESS':
        return <AnalysisInProgress />;

      case 'ANALYSIS_COMPLETE':
        return <AnalysisComplete analyses={analyses} />;

      case 'ANALYSIS_ERROR':
        return (
          <AnalysisError
            error={error || 'An unknown error occurred'}
            onRetry={onRetry}
          />
        );

      default:
        return <FetchingAnalyses />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Conversation Analysis
          </CardTitle>
        </CardHeader>
        {renderStep()}
      </Card>
    </div>
  );
}
