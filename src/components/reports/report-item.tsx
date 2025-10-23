'use client';

// Single report row as a clickable card; focuses on a11y and clear status visuals.
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Report, ReportStatus } from '@/types/report';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const STATUS_META: Record<
  ReportStatus,
  // Presentation map for status chips (label, icon, and badge variant)
  {
    label: string;
    icon: React.ReactNode;
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="h-3.5 w-3.5" />,
    badgeVariant: 'secondary',
  },
  'under-review': {
    label: 'Under Review',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    badgeVariant: 'outline',
  },
  resolved: {
    label: 'Resolved',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    badgeVariant: 'default',
  },
};

export function statusAccentBg(status: ReportStatus) {
  // Left edge accent color by status for quick scanning
  switch (status) {
    case 'resolved':
      return 'bg-primary';
    case 'under-review':
      return 'bg-accent';
    case 'pending':
    default:
      return 'bg-muted';
  }
}

export function formatDateTime(value: Date): string {
  // Lightweight datetime formatter with a safe fallback
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
}

export const ReportItem = React.memo(function ReportItem({
  report,
  onOpen,
}: {
  report: Report;
  onOpen: (txId: string) => void;
}) {
  const statusMeta = STATUS_META[report.status];
  return (
    <button
      type="button"
      className={cn(
        'group border-border bg-card/60 hover:bg-accent/30 focus-visible:ring-ring/50 relative block w-full overflow-hidden rounded-xl border p-4 text-left transition-colors outline-none focus-visible:ring-[3px]'
      )}
      // Describe the action for screen readers
      aria-label={`Open ${report.id} (${statusMeta.label}) for transaction ${report.transactionId}`}
      onClick={() => onOpen(report.transactionId)}
    >
      <div
        className={cn(
          'absolute top-0 left-0 h-full w-1',
          statusAccentBg(report.status)
        )}
        aria-hidden
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-lg font-semibold">Report</span>
          <Badge variant={statusMeta.badgeVariant} className="gap-1">
            {statusMeta.icon}
            {statusMeta.label}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {report.reason.replace(/-/g, ' ')}
          </Badge>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-foreground/80">Tx:</span>
            <span className="text-primary underline-offset-4 group-hover:underline">
              {report.transactionId}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-foreground/80">By:</span>
            <span className="text-foreground">{report.reportedByName}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-foreground/80">At:</span>
            <span className="text-foreground">
              {formatDateTime(report.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Collapsible notes when present */}
      {report.notes && <NotesBlock text={report.notes} />}

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
    </button>
  );
});

// Inline, toggleable block for long notes
function NotesBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 160;
  const needsClamp = text.length > limit;
  const shown = expanded || !needsClamp ? text : text.slice(0, limit) + '…';

  return (
    <div className="bg-secondary/40 mt-3 rounded-md p-3">
      <div className="text-foreground/90 text-sm font-medium">
        Additional Notes
      </div>
      <div className="text-foreground/90 text-sm">
        {shown}{' '}
        {needsClamp && (
          <Button
            variant="link"
            size="sm"
            className="px-1 py-0 text-xs"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </Button>
        )}
      </div>
    </div>
  );
}
