// Modal content showing transaction overview and all related reports.
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getReportsByTransactionId } from '@/lib/mock-data/reports';
import type { ReportStatus } from '@/types/report';
import { STATUS_META, statusAccentBg, formatDateTime } from './report-item';
import { ROUTES } from '@/constants/routes';

export function TransactionReportsModal({ txId }: { txId: string }) {
  // Pull all reports for the transaction id (mocked data for now)
  const txReports = useMemo(() => getReportsByTransactionId(txId), [txId]);
  const total = txReports.length;
  // Derived timestamps for quick context
  const firstCreated = txReports
    .map((r) => r.createdAt)
    .sort((a, b) => +a - +b)[0];
  const lastUpdated = txReports
    .map((r) => r.updatedAt ?? r.createdAt)
    .sort((a, b) => +b - +a)[0];
  // Aggregate report counts by status
  const counts = txReports.reduce(
    (acc, r) => {
      acc[r.status] += 1 as number;
      return acc;
    },
    { pending: 0, 'under-review': 0, resolved: 0 } as Record<
      ReportStatus,
      number
    >
  );
  // Unique reporter names for the overview
  const reporters = Array.from(new Set(txReports.map((r) => r.reportedByName)));

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between gap-2">
          <span>Transaction {txId}</span>
          <Badge variant="outline" className="ml-2">
            {total} {total === 1 ? 'report' : 'reports'}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Overview and detailed reports for this transaction.
        </DialogDescription>
      </DialogHeader>

      {/* Overview metrics */}
      <div className="border-border bg-card/60 rounded-lg border p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="First report" value={formatDateTime(firstCreated)} />
          <Info label="Last updated" value={formatDateTime(lastUpdated)} />
          <Info label="Reporters" value={reporters.join(', ')} />
          <Info label="Pending" value={String(counts.pending)} />
          <Info label="Under Review" value={String(counts['under-review'])} />
          <Info label="Resolved" value={String(counts.resolved)} />
        </div>
      </div>

      {/* Related reports list */}
      <div className="space-y-3">
        {txReports
          .slice()
          .sort((a, b) => +b.createdAt - +a.createdAt)
          .map((report) => {
            const meta = STATUS_META[report.status];
            return (
              <div
                key={report.id}
                className="border-border bg-card/60 relative overflow-hidden rounded-lg border p-4"
              >
                <div
                  className={cn(
                    'absolute top-0 left-0 h-full w-1',
                    statusAccentBg(report.status)
                  )}
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={meta.badgeVariant} className="gap-1">
                      {meta.icon}
                      {meta.label}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {report.reason.replace(/-/g, ' ')}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                    <span className="text-foreground/80">By</span>
                    <span className="text-foreground">
                      {report.reportedByName}
                    </span>
                    <span className="text-foreground/60 hidden sm:inline">
                      •
                    </span>
                    <span className="text-foreground/80">At</span>
                    <span className="text-foreground">
                      {formatDateTime(report.createdAt)}
                    </span>
                  </div>
                </div>
                {report.notes && (
                  <div className="bg-secondary/40 mt-3 rounded-md p-3">
                    <div className="text-foreground/90 text-sm font-medium">
                      Additional Notes
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {report.notes}
                    </div>
                  </div>
                )}
                {report.status === 'resolved' && report.resolution && (
                  <div className="border-border mt-3 rounded-md border p-3">
                    <div className="text-foreground/90 text-sm font-medium">
                      Resolution
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {report.resolution}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <DialogFooter className="mt-2">
        <Link href={ROUTES.TRANSACTION.VIEW(txId)}>
          <Button variant="outline">Open full transaction</Button>
        </Link>
      </DialogFooter>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
