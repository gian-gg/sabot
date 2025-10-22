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
  user_id: string;
  platform: 'whatsapp' | 'telegram' | 'messenger' | 'other';
  itemDescription?: string;
  transactionType: 'meetup' | 'online' | 'other';
  productType: string;
  productModel: string;
  productCondition: string;
  proposedPrice?: number;
  currency?: string;
  meetingLocation?: string;
  meetingTime?: string;
  riskFlags?: string[];
  confidence?: number;
  extractedText?: string;
  screenshot_url: string;
}

export interface AnalysisState {
  step: AnalysisStep;
  analyses: AnalysisData[];
  error?: string;
  isAnalyzing: boolean;
}
