import { Report } from '@/types/report';

// Mock data for demonstration - will be replaced with real database queries
export const mockReports: Report[] = [
  {
    id: 'RPT-001',
    transactionId: 'TX-2024-001240',
    reportedBy: 'user-9',
    reportedByName: 'Marco A.',
    reason: 'defective-goods',
    notes:
      'The motorcycle had undisclosed engine issues. It stopped working after 2 days.',
    status: 'under-review',
    createdAt: new Date('2024-03-16T10:30:00'),
    updatedAt: new Date('2024-03-16T14:20:00'),
  },
  {
    id: 'RPT-002',
    transactionId: 'TX-2024-001238',
    reportedBy: 'user-9',
    reportedByName: 'Luis G.',
    reason: 'unmet-conditions',
    notes: 'Seller promised original charger but provided a third-party one.',
    status: 'pending',
    createdAt: new Date('2024-03-17T09:15:00'),
    updatedAt: new Date('2024-03-17T09:15:00'),
  },
  {
    id: 'RPT-003',
    transactionId: 'TX-2024-001235',
    reportedBy: 'user-3',
    reportedByName: 'Carlos M.',
    reason: 'fraudulent-behavior',
    notes:
      'The item received was a fake. Seller advertised as authentic designer bag.',
    status: 'resolved',
    createdAt: new Date('2024-03-15T16:45:00'),
    updatedAt: new Date('2024-03-16T11:30:00'),
    resolution: 'Full refund issued. Seller account flagged for review.',
  },
  {
    id: 'RPT-004',
    transactionId: 'TX-2024-001234',
    reportedBy: 'user-1',
    reportedByName: 'Juan D.',
    reason: 'safety-concern',
    notes: 'Seller became aggressive during the meetup. Felt unsafe.',
    status: 'resolved',
    createdAt: new Date('2024-03-15T15:00:00'),
    updatedAt: new Date('2024-03-15T18:30:00'),
    resolution:
      'Incident documented. Emergency contact was notified. Transaction completed successfully.',
  },
];

// Helper function to get reports by transaction ID
export function getReportsByTransactionId(transactionId: string): Report[] {
  return mockReports.filter((report) => report.transactionId === transactionId);
}

// Helper function to get reports by status
export function getReportsByStatus(status: Report['status']): Report[] {
  return mockReports.filter((report) => report.status === status);
}

// Helper function to count reports by status
export function getReportCountByStatus(status: Report['status']): number {
  return getReportsByStatus(status).length;
}
