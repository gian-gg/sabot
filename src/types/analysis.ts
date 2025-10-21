export type AnalysisStep =
  | 'FETCHING_ANALYSES'
  | 'NO_ANALYSES'
  | 'ANALYSIS_IN_PROGRESS'
  | 'ANALYSIS_COMPLETE'
  | 'ANALYSIS_ERROR';

export interface AnalysisStepNavProps {
  onRetry?: () => void;
  onStartAnalysis?: () => void;
}

export interface AnalysisData {
  id: string;
  platform: string;
  buyerName?: string;
  sellerName?: string;
  itemDescription?: string;
  agreedPrice?: number;
  currency?: string;
  meetingLocation?: string;
  meetingTime?: string;
  riskFlags: string[];
  confidence: number;
  extractedText: string;
  screenshot_url: string;
}

export interface AnalysisState {
  step: AnalysisStep;
  analyses: AnalysisData[];
  error?: string;
  isAnalyzing: boolean;
}
