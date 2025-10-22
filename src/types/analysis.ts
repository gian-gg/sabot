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
  id?: string;
  buyerName?: string;
  sellerName?: string;
  user_id: string;
  platform: string;
  screenshot_url: string;
  itemDescription?: string;
  proposedPrice?: number;
  agreedPrice?: number; // Add this field
  currency?: string;
  meetingLocation?: string;
  meetingTime?: string;
  extractedText?: string;
  riskFlags?: string[];
  confidence?: number;
}

export interface AnalysisState {
  step: AnalysisStep;
  analyses: AnalysisData[];
  error?: string;
  isAnalyzing: boolean;
}
