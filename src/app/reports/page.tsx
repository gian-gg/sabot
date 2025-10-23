// Server wrapper: serializes Date fields and renders the client container.
import type { Report } from '@/types/report';
import { mockReports } from '@/lib/mock-data/reports';
import { ReportsPageClient, type ReportDTO } from '@/app/reports/client';

export default function ReportsPage() {
  // Convert Dates to ISO strings for the RSC boundary
  const reports = (mockReports as Report[]).map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  })) as ReportDTO[];

  return <ReportsPageClient reports={reports} />;
}
