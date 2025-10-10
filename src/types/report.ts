export type ReportStatus = 'pending' | 'under-review' | 'resolved';

export type ReportReason =
  | 'defective-goods'
  | 'unmet-conditions'
  | 'fraudulent-behavior'
  | 'safety-concern'
  | 'other';

export interface Report {
  id: string;
  transactionId: string;
  reportedBy: string;
  reportedByName: string;
  reason: ReportReason;
  notes: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  resolution?: string;
}
