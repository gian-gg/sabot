'use client';

import React, { useMemo, useState, useDeferredValue, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BackButton } from '@/components/core/back-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search as SearchIcon,
} from 'lucide-react';
import type { Report, ReportStatus } from '@/types/report';
import { SummaryCard } from '@/components/reports/summary-card';
import { ReportItem } from '@/components/reports/report-item';

// Defer loading the modal (no SSR) to keep the initial bundle smaller
const TransactionReportsModal = dynamic(
  () =>
    import('@/components/reports/transaction-reports-modal').then(
      (m) => m.TransactionReportsModal
    ),
  { ssr: false }
);

// Serialized shape passed across the server->client boundary
export type ReportDTO = Omit<Report, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export function ReportsPageClient({
  reports: reportsDTO,
}: {
  reports: ReportDTO[];
}) {
  // Hydrate ISO date strings back into Date objects for client-side logic
  const reports = useMemo<Report[]>(
    () =>
      reportsDTO.map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      })),
    [reportsDTO]
  );

  const [activeTab, setActiveTab] = useState<'all' | ReportStatus>('all');
  const [query, setQuery] = useState('');
  // Smooth typing by deferring filter work until input settles
  const deferredQuery = useDeferredValue(query);
  const [sort, setSort] = useState<'newest' | 'oldest' | 'status'>('newest');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  // Totals used by summary cards and tab badges
  const counts = useMemo(
    () =>
      reports.reduce(
        (acc, r) => {
          acc.total += 1;
          acc[r.status] += 1 as number;
          return acc;
        },
        { total: 0, pending: 0, 'under-review': 0, resolved: 0 } as Record<
          'total' | ReportStatus,
          number
        >
      ),
    [reports]
  );

  const filteredReports = useMemo(() => {
    let res = reports;
    // Filter by active status tab
    if (activeTab !== 'all') res = res.filter((r) => r.status === activeTab);

    // Text search across transaction ID, reporter name, and reason label
    const q = deferredQuery.trim().toLowerCase();
    if (q) {
      res = res.filter(
        (r) =>
          r.transactionId.toLowerCase().includes(q) ||
          r.reportedByName.toLowerCase().includes(q) ||
          r.reason.replace(/-/g, ' ').toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'newest':
        // Recent reports first
        return [...res].sort((a, b) => +b.createdAt - +a.createdAt);
      case 'oldest':
        // Historical first
        return [...res].sort((a, b) => +a.createdAt - +b.createdAt);
      case 'status':
        // Group by lifecycle
        const order: ReportStatus[] = ['pending', 'under-review', 'resolved'];
        return [...res].sort(
          (a, b) => order.indexOf(a.status) - order.indexOf(b.status)
        );
      default:
        return res;
    }
  }, [reports, activeTab, deferredQuery, sort]);

  // Open dialog for selected transaction id
  const handleOpen = useCallback((txId: string) => {
    setSelectedTxId(txId);
    setModalOpen(true);
  }, []);

  return (
    <div className="mb-20 pt-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <BackButton fallbackUrl="/" label="Back" />
          <div className="text-right">
            <h1 className="text-2xl leading-tight font-bold sm:text-3xl lg:text-4xl">
              Reports
            </h1>
            <p className="text-muted-foreground text-sm">
              View, filter, and track all transaction reports.
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title="Pending"
            value={counts.pending}
            icon={<Clock className="h-5 w-5" />}
            tone="muted"
          />
          <SummaryCard
            title="Under Review"
            value={counts['under-review']}
            icon={<AlertTriangle className="h-5 w-5" />}
            tone="accent"
          />
          <SummaryCard
            title="Resolved"
            value={counts.resolved}
            icon={<CheckCircle2 className="h-5 w-5" />}
            tone="positive"
          />
        </div>

        <Card className="glass rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>All Reports</CardTitle>
                <CardDescription>
                  Click a report to view its transaction.
                </CardDescription>
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search by Tx ID, reporter, reason"
                    className="pl-8"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search reports"
                  />
                </div>
                <select
                  aria-label="Sort reports"
                  className="bg-input border-border text-foreground focus-visible:ring-ring/50 rounded-md border px-3 py-2 text-sm focus-visible:ring-[3px]"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <Tabs
              className="mb-4"
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            >
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  <span>All</span>
                  <Badge variant="secondary" className="ml-0">
                    {counts.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Pending</span>
                  <Badge variant="secondary" className="ml-0">
                    {counts.pending}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="under-review" className="gap-2">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Under Review</span>
                  <Badge variant="secondary" className="ml-0">
                    {counts['under-review']}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="resolved" className="gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Resolved</span>
                  <Badge variant="secondary" className="ml-0">
                    {counts.resolved}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {filteredReports.length === 0 ? (
              <EmptyState
                onReset={() => {
                  setQuery('');
                  setActiveTab('all');
                  setSort('newest');
                }}
              />
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <ReportItem
                    key={report.id}
                    report={report}
                    onOpen={handleOpen}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogHeader className="sr-only">
            <DialogTitle>Transaction Reports</DialogTitle>
            <DialogDescription>
              View all reports related to this transaction.
            </DialogDescription>
          </DialogHeader>
          <DialogContent className="sm:max-w-3xl">
            {selectedTxId ? (
              <TransactionReportsModal txId={selectedTxId} />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Shared empty-state block for when filters yield no results
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="bg-muted/40 text-foreground/80 flex size-14 items-center justify-center rounded-full">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div>
        <p className="text-base font-medium">No reports found</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Try adjusting filters or clearing your search.
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={onReset}>
        <Filter className="mr-1 h-4 w-4" /> Reset filters
      </Button>
    </div>
  );
}
