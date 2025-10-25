'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnalysisContainer } from './analysis-container';
import type { AnalysisStep, AnalysisData } from '@/types/analysis';

interface ApiAnalysisResponse {
  id?: string;
  screenshot_id?: string;
  extracted_data: AnalysisData;
}

interface AnalysisWithSource extends AnalysisData {
  source: string;
  screenshotId: string;
}

interface ScreenshotAnalysisProps {
  transactionId: string;
  onAnalysisComplete?: (data: AnalysisData | AnalysisWithSource[]) => void;
}

export function ScreenshotAnalysis({
  transactionId,
  onAnalysisComplete,
}: ScreenshotAnalysisProps) {
  const [step, setStep] = useState<AnalysisStep>('FETCHING_ANALYSES');
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [error, setError] = useState<string>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Use ref to avoid re-creating fetchAnalyses when onAnalysisComplete changes
  const onAnalysisCompleteRef = useRef(onAnalysisComplete);

  // Keep ref up to date
  useEffect(() => {
    onAnalysisCompleteRef.current = onAnalysisComplete;
  }, [onAnalysisComplete]);

  const fetchAnalyses = useCallback(async () => {
    try {
      setStep('FETCHING_ANALYSES');
      setError(undefined);

      const response = await fetch(
        `/api/transaction/${transactionId}/analyses`
      );

      if (response.ok) {
        const data = await response.json();
        const fetchedAnalyses = data.analyses || [];
        setAnalyses(fetchedAnalyses);

        if (fetchedAnalyses.length === 0) {
          setStep('NO_ANALYSES');
        } else {
          setStep('ANALYSIS_COMPLETE');

          // Call the callback with analysis data
          if (onAnalysisCompleteRef.current && fetchedAnalyses.length > 0) {
            if (fetchedAnalyses.length === 1) {
              // Single analysis - pass the extracted data directly
              const analysis = fetchedAnalyses[0];
              if (analysis.extracted_data) {
                onAnalysisCompleteRef.current(analysis.extracted_data);
              }
            } else {
              // Multiple analyses - pass all with source information
              const analysesWithSource = fetchedAnalyses.map(
                (analysis: ApiAnalysisResponse, idx: number) => ({
                  ...analysis.extracted_data,
                  source: idx === 0 ? 'screenshot1' : 'screenshot2',
                  screenshotId: analysis.screenshot_id || analysis.id,
                })
              );
              onAnalysisCompleteRef.current(analysesWithSource);
            }
          }
        }
      } else {
        throw new Error(`Failed to fetch analyses: ${response.status}`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch analyses';
      setError(errorMessage);
      setStep('ANALYSIS_ERROR');
    }
  }, [transactionId]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const startAnalysis = async () => {
    console.log('🚀 Starting analysis for transaction:', transactionId);
    setIsAnalyzing(true);
    setStep('ANALYSIS_IN_PROGRESS');
    setError(undefined);

    try {
      const response = await fetch(
        `/api/transaction/${transactionId}/analyze-screenshots`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        console.log('✅ Analysis completed successfully');
        await fetchAnalyses(); // Refresh data (which will trigger the callback)
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Analysis failed: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Analysis failed';
      console.error('💥 Analysis error:', errorMessage);
      setError(errorMessage);
      setStep('ANALYSIS_ERROR');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetry = () => {
    if (step === 'ANALYSIS_ERROR') {
      // Retry the failed operation
      if (analyses.length === 0) {
        setStep('NO_ANALYSES');
      } else {
        fetchAnalyses();
      }
    } else {
      fetchAnalyses();
    }
  };

  return (
    <AnalysisContainer
      step={step}
      analyses={analyses}
      error={error}
      isAnalyzing={isAnalyzing}
      onStartAnalysis={startAnalysis}
      onRetry={handleRetry}
      transactionId={transactionId}
    />
  );
}
