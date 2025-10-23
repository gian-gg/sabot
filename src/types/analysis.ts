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
  quantity?: number;
  meetingLocation?: string;
  meetingSchedule?: string; // Renamed from meetingTime, format: YYYY-MM-DDTHH:mm for datetime-local input
  deliveryAddress?: string;
  deliveryMethod?: string;
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
