'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowUpDown,
  CheckCircle2,
  DollarSign,
  Filter,
  Inbox,
  Loader2,
  Search,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import AreaChartComponent from './area-chart-component';
import { FilterDialog, type TransactionFilters } from './filter-dialog';
import { Pagination } from './pagination';
import StatsCard from './stats-card';
import { TransactionDetailsModal } from './transaction-details-modal';
import TransactionItem from './transaction-item';
import { TransactionItemSkeleton } from './transaction-item-skeleton';

import type {
  TransactionDetails,
  TransactionQueryParams,
} from '@/types/transaction';

interface TransactionsSectionProps {
  transactions: TransactionDetails[];
  totalCount: number;
  isLoading?: boolean;
  queryParams: TransactionQueryParams;
  onQueryChange: (params: TransactionQueryParams) => void;
  onTransactionUpdate?: () => void;
  readOnly?: boolean;
}

export default function TransactionsSection({
  transactions,
  totalCount,
  isLoading = false,
  queryParams,
  onQueryChange,
  onTransactionUpdate,
  readOnly = false,
}: TransactionsSectionProps) {
  // Local state for immediate UI feedback (e.g. input field)
  const [searchValue, setSearchValue] = useState(queryParams.search || '');

  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Sync internal state if queryParams.search changes externally (e.g. clear filters)
  useEffect(() => {
    setSearchValue(queryParams.search || '');
  }, [queryParams.search]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onQueryChange({ ...queryParams, search: searchValue, page: 1 });
    }
  };

  // Transform query params to filter object for dialog
  const filters: TransactionFilters = useMemo(
    () => ({
      status: queryParams.status || 'all',
      type: queryParams.type || 'all',
      dateRange: queryParams.dateRange || 'all',
      minAmount: queryParams.minAmount,
      maxAmount: queryParams.maxAmount,
    }),
    [queryParams]
  );

  const handleTransactionClick = (transaction: TransactionDetails) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleClearFilters = () => {
    onQueryChange({
      ...queryParams,
      status: 'all',
      type: 'all',
      dateRange: 'all',
      minAmount: undefined,
      maxAmount: undefined,
      page: 1,
    });
  };

  const handleFilterChange = (newFilters: TransactionFilters) => {
    onQueryChange({
      ...queryParams,
      ...newFilters,
      page: 1,
    });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    onQueryChange({
      ...queryParams,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    });
  };

  const handlePageChange = (page: number) => {
    onQueryChange({ ...queryParams, page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    onQueryChange({ ...queryParams, pageSize, page: 1 });
  };

  // Convert transactions for charts
  const transactionVolumeData = useMemo(() => {
    const monthlyData = new Map<string, { volume: number; value: number }>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.created_at);
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { volume: 0, value: 0 });
      }

      const data = monthlyData.get(monthKey)!;
      data.volume += 1;
      data.value += transaction.price;
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month: month.split(' ')[0], // Just month name for brevity
      volume: data.volume,
      value: data.value,
    }));
  }, [transactions]);

  const statusDistributionData = useMemo(() => {
    const statusCounts = new Map<string, number>();

    transactions.forEach((transaction) => {
      const count = statusCounts.get(transaction.status) || 0;
      statusCounts.set(transaction.status, count + 1);
    });

    const statusColors: Record<string, string> = {
      completed: '#01d06c',
      active: '#3b82f6',
      pending: '#f59e0b',
      disputed: '#ef4444',
      reported: '#f97316',
      waiting_for_participant: '#a855f7',
      both_joined: '#06b6d4',
      screenshots_uploaded: '#10b981',
      cancelled: '#6b7280',
    };

    return Array.from(statusCounts.entries())
      .map(([status, count]) => ({
        name:
          status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
        value: count,
        color: statusColors[status] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Calculate generic stats based on current view
  const totalVolume = useMemo(() => {
    const total = transactions.reduce((sum, t) => sum + t.price, 0);
    return `$${total.toLocaleString()}`;
  }, [transactions]);

  const successRate = useMemo(() => {
    if (transactions.length === 0) return '0%';
    const completed = transactions.filter(
      (t) => t.status === 'completed'
    ).length;
    const rate = (completed / transactions.length) * 100;
    return `${rate.toFixed(1)}%`;
  }, [transactions]);

  const activePartners = useMemo(() => {
    const uniquePartners = new Set(transactions.map((t) => t.creator_id));
    return uniquePartners.size.toString();
  }, [transactions]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.minAmount !== undefined) count++;
    if (filters.maxAmount !== undefined) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          Icon={DollarSign}
          title="Total Volume"
          value={totalVolume}
          description="In current view"
        />

        <StatsCard
          Icon={TrendingUp}
          title="Transactions"
          value={totalCount.toString()}
          description="Total found"
        />

        <StatsCard
          Icon={CheckCircle2}
          title="Success Rate"
          value={successRate}
          description="Page success rate"
        />

        <StatsCard
          Icon={Users}
          title="Active Partners"
          value={activePartners}
          description="On this page"
        />
      </div>

      {/* Main Content Tabs */}
      <div className="flex h-full w-full flex-col gap-4">
        {/* Transaction Volume Chart */}
        <AreaChartComponent transactionVolumeData={transactionVolumeData} />

        {/* Recent Transactions */}
        <div className="mt-6 min-h-[600px] space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Recent Transactions
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                {readOnly
                  ? 'Latest transaction activity'
                  : 'Your latest transaction activity'}
              </CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto">
                <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  className="bg-background h-10 w-full pl-9 sm:w-[250px]"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <Select
                  value={`${queryParams.sortBy}-${queryParams.sortOrder}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="flex-1 sm:w-[160px] sm:flex-none">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">
                      Newest First
                    </SelectItem>
                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                    <SelectItem value="price-desc">Highest Price</SelectItem>
                    <SelectItem value="price-asc">Lowest Price</SelectItem>
                    <SelectItem value="item_name-asc">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setIsFilterDialogOpen(true)}
                  className="flex-1 sm:flex-none"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 justify-center p-0"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div>
            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Active filters:
                </span>
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {filters.status}
                    <X
                      className="hover:text-destructive h-3 w-3 cursor-pointer"
                      onClick={() =>
                        handleFilterChange({ ...filters, status: 'all' })
                      }
                    />
                  </Badge>
                )}
                {filters.type !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {filters.type}
                    <X
                      className="hover:text-destructive h-3 w-3 cursor-pointer"
                      onClick={() =>
                        handleFilterChange({ ...filters, type: 'all' })
                      }
                    />
                  </Badge>
                )}
                {filters.dateRange !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Date: {filters.dateRange}
                    <X
                      className="hover:text-destructive h-3 w-3 cursor-pointer"
                      onClick={() =>
                        handleFilterChange({ ...filters, dateRange: 'all' })
                      }
                    />
                  </Badge>
                )}
                {(filters.minAmount !== undefined ||
                  filters.maxAmount !== undefined) && (
                  <Badge variant="secondary" className="gap-1">
                    Amount: ${filters.minAmount ?? 0} - $
                    {filters.maxAmount ?? '∞'}
                    <X
                      className="hover:text-destructive h-3 w-3 cursor-pointer"
                      onClick={() =>
                        handleFilterChange({
                          ...filters,
                          minAmount: undefined,
                          maxAmount: undefined,
                        })
                      }
                    />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TransactionItemSkeleton key={i} />
                ))
              ) : transactions.length > 0 ? (
                <>
                  {transactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onClick={
                        readOnly
                          ? undefined
                          : () => handleTransactionClick(transaction)
                      }
                    />
                  ))}

                  <div className="mt-6">
                    <Pagination
                      page={queryParams.page || 1}
                      pageSize={queryParams.pageSize || 10}
                      totalCount={totalCount}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      isLoading={isLoading}
                    />
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground flex min-h-[600px] flex-col items-center justify-center rounded-lg border-2 py-12 text-center">
                  <Inbox className="mb-3 h-12 w-12 opacity-20" />
                  <p className="text-sm font-semibold">No transactions found</p>
                  <p className="text-xs">
                    Create a new transaction to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        readOnly={readOnly}
        onTransactionUpdate={onTransactionUpdate}
      />
      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        filters={filters}
        onFiltersChange={handleFilterChange}
      />
    </div>
  );
}
