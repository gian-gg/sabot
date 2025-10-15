import React from 'react';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/core/page-header';
import { mockReports, getReportCountByStatus } from '@/lib/mock-data/reports';
import { ReportStatus } from '@/types/report';

function getStatusBadgeVariant(
  status: ReportStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'resolved':
      return 'default';
    case 'under-review':
      return 'secondary';
    case 'pending':
      return 'outline';
    default:
      return 'default';
  }
}

function getStatusIcon(status: ReportStatus) {
  switch (status) {
    case 'resolved':
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'under-review':
      return <Clock className="h-4 w-4 text-blue-400" />;
    case 'pending':
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    default:
      return <FileText className="h-4 w-4 text-neutral-400" />;
  }
}

export default function ReportsPage() {
  const pendingCount = getReportCountByStatus('pending');
  const reviewingCount = getReportCountByStatus('under-review');
  const resolvedCount = getReportCountByStatus('resolved');

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      <PageHeader />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] space-y-6 px-8 py-8">
          {/* Page Header */}
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">
              Reports Dashboard
            </h1>
            <p className="text-neutral-400">
              Monitor and manage transaction reports
            </p>
          </div>

          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-neutral-800/60 bg-gradient-to-b from-yellow-900/20 to-yellow-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-neutral-400">Pending</p>
                    <p className="text-3xl font-bold text-white">
                      {pendingCount}
                    </p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-800/60 bg-gradient-to-b from-blue-900/20 to-blue-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-neutral-400">
                      Under Review
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {reviewingCount}
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-800/60 bg-gradient-to-b from-green-900/20 to-green-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-neutral-400">Resolved</p>
                    <p className="text-3xl font-bold text-white">
                      {resolvedCount}
                    </p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Reports Card */}
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardHeader>
              <CardTitle className="text-white">All Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {mockReports.length > 0 ? (
                <div className="space-y-3">
                  {mockReports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-lg border border-neutral-800/50 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-1 items-start gap-3">
                          <div className="mt-1">
                            {getStatusIcon(report.status)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-neutral-500">
                                {report.id}
                              </span>
                              <span className="text-neutral-600">•</span>
                              <span className="text-sm text-neutral-400">
                                {report.reason.replace('-', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-white">{report.notes}</p>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <span>Reported by {report.reportedByName}</span>
                              <span>•</span>
                              <span>
                                {report.createdAt.toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <Link
                                href={ROUTES.TRANSACTION.VIEW(
                                  report.transactionId
                                )}
                                className="text-blue-400 hover:underline"
                              >
                                View Transaction
                              </Link>
                            </div>
                            {report.resolution && (
                              <div className="mt-2 rounded border border-green-500/30 bg-green-500/10 p-2">
                                <p className="text-xs text-green-300">
                                  Resolution: {report.resolution}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={getStatusBadgeVariant(report.status)}
                          className="whitespace-nowrap"
                        >
                          {report.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-neutral-400">
                  No reports yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
