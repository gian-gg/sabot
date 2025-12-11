'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TransactionStatus } from '@/types/transaction';
import {
  CheckCircle2,
  DollarSign,
  Filter,
  Search,
  TrendingUp,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import AreaChartComponent from './components/transactions/area-chart-component';
import PieChartComponent from './components/transactions/pie-chart-component';
import StatsCard from './components/transactions/stats-card';
import TransactionItem from './components/transactions/transaction-item';
import { TransactionDetailsModal } from './components/transactions/transaction-details-modal';
import {
  FilterDialog,
  type TransactionFilters,
} from './components/transactions/filter-dialog';

import type { TransactionDetails } from '@/types/transaction';

export default function TransactionsSection({
  recentTransactions,
}: {
  recentTransactions: TransactionDetails[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    status: 'all',
    type: 'all',
    dateRange: 'all',
  });

  // Delete mode state
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationData, setDeleteConfirmationData] = useState<{
    totalCount: number;
    hardDeleteCount: number;
    softDeleteCount: number;
  } | null>(null);

  // Cancel mode state
  const [isCancelMode, setIsCancelMode] = useState(false);
  const [selectedForCancellation, setSelectedForCancellation] = useState<
    Set<string>
  >(new Set());
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Calculate transaction volume data by month
  const transactionVolumeData = useMemo(() => {
    const monthlyData = new Map<string, { volume: number; value: number }>();

    recentTransactions.forEach((transaction) => {
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

    // Get last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      const monthShort = date.toLocaleDateString('en-US', { month: 'short' });

      months.push({
        month: monthShort,
        volume: monthlyData.get(monthKey)?.volume || 0,
        value: monthlyData.get(monthKey)?.value || 0,
      });
    }

    return months;
  }, [recentTransactions]);

  // Calculate status distribution data
  const statusDistributionData = useMemo(() => {
    const statusCounts = new Map<TransactionStatus, number>();

    recentTransactions.forEach((transaction) => {
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
  }, [recentTransactions]);

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return recentTransactions.filter((transaction) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        transaction.item_name.toLowerCase().includes(searchLower) ||
        (transaction.transaction_participants.length > 1 &&
          transaction.transaction_participants[1].participant_name
            ?.toLowerCase()
            .includes(searchLower)) ||
        transaction.id.toLowerCase().includes(searchLower);

      // Status filter - treat "pending" as a group of in-progress statuses
      let matchesStatus = false;
      if (filters.status === 'all') {
        matchesStatus = true;
      } else if (filters.status === 'pending') {
        // Include all in-progress/pending-like statuses
        matchesStatus = [
          'pending',
          'waiting_for_participant',
          'both_joined',
          'screenshots_uploaded',
        ].includes(transaction.status);
      } else {
        matchesStatus = transaction.status === filters.status;
      }

      // Type filter
      const matchesType =
        filters.type === 'all' || transaction.transaction_type === filters.type;

      // Amount filter
      const matchesMinAmount =
        filters.minAmount === undefined ||
        transaction.price >= filters.minAmount;
      const matchesMaxAmount =
        filters.maxAmount === undefined ||
        transaction.price <= filters.maxAmount;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesMinAmount &&
        matchesMaxAmount
      );
    });
  }, [searchQuery, filters, recentTransactions]);

  // When in delete mode, only show deletable transactions; when in cancel mode, only show active
  const displayTransactions = useMemo(() => {
    if (isDeleteMode) {
      return filteredTransactions.filter((t) =>
        [
          'waiting_for_participant',
          'both_joined',
          'screenshots_uploaded',
        ].includes(t.status)
      );
    }
    if (isCancelMode) {
      return filteredTransactions.filter((t) => t.status === 'active');
    }
    return filteredTransactions;
  }, [isDeleteMode, isCancelMode, filteredTransactions]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.minAmount !== undefined) count++;
    if (filters.maxAmount !== undefined) count++;
    return count;
  }, [filters]);

  const handleTransactionClick = (transaction: TransactionDetails) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      dateRange: 'all',
    });
  };

  // Delete mode handlers
  const handleToggleSelection = (transactionId: string) => {
    const newSelection = new Set(selectedForDeletion);
    if (newSelection.has(transactionId)) {
      newSelection.delete(transactionId);
    } else {
      newSelection.add(transactionId);
    }
    setSelectedForDeletion(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedForDeletion.size === displayTransactions.length) {
      setSelectedForDeletion(new Set());
    } else {
      setSelectedForDeletion(new Set(displayTransactions.map((t) => t.id)));
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteMode(false);
    setSelectedForDeletion(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedForDeletion.size === 0) return;

    // Get transactions being deleted
    const transactionsToDelete = displayTransactions.filter((t) =>
      selectedForDeletion.has(t.id)
    );

    const softDeleteCount = transactionsToDelete.filter(
      (t) => t.status === 'screenshots_uploaded'
    ).length;
    const hardDeleteCount = transactionsToDelete.length - softDeleteCount;

    // Show confirmation dialog
    setDeleteConfirmationData({
      totalCount: transactionsToDelete.length,
      hardDeleteCount,
      softDeleteCount,
    });
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedForDeletion.size === 0) return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/transaction/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionIds: Array.from(selectedForDeletion),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete transactions');
      }

      const result = await response.json();

      // Show success message
      toast.success(
        `Successfully deleted ${result.summary.softDeleted + result.summary.hardDeleted} transaction(s)`
      );

      // Exit delete mode and refresh
      setIsDeleteMode(false);
      setSelectedForDeletion(new Set());
      setShowDeleteConfirmation(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete transactions:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete transactions'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmationData(null);
  };

  // Cancel mode handlers
  const handleToggleCancellationSelection = (transactionId: string) => {
    const newSelection = new Set(selectedForCancellation);
    if (newSelection.has(transactionId)) {
      newSelection.delete(transactionId);
    } else {
      newSelection.add(transactionId);
    }
    setSelectedForCancellation(newSelection);
  };

  const handleSelectAllForCancel = () => {
    if (selectedForCancellation.size === displayTransactions.length) {
      setSelectedForCancellation(new Set());
    } else {
      setSelectedForCancellation(new Set(displayTransactions.map((t) => t.id)));
    }
  };

  const handleCancelCancelMode = () => {
    setIsCancelMode(false);
    setSelectedForCancellation(new Set());
  };

  const handleBulkCancel = () => {
    if (selectedForCancellation.size === 0) return;
    setShowCancelConfirmation(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedForCancellation.size === 0) return;

    setIsCancelling(true);
    try {
      const response = await fetch('/api/transaction/bulk-cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionIds: Array.from(selectedForCancellation),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel transactions');
      }

      const result = await response.json();

      toast.success(
        `Successfully cancelled ${result.summary.cancelled} transaction(s)`
      );

      setIsCancelMode(false);
      setSelectedForCancellation(new Set());
      setShowCancelConfirmation(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to cancel transactions:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to cancel transactions'
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Calculate total stats from recent transactions
  const totalVolume = useMemo(() => {
    const total = recentTransactions.reduce((sum, t) => sum + t.price, 0);
    return `$${total.toLocaleString()}`;
  }, [recentTransactions]);

  const successRate = useMemo(() => {
    const completed = recentTransactions.filter(
      (t) => t.status === 'completed'
    ).length;
    const rate = (completed / recentTransactions.length) * 100;

    return rate ? `${rate.toFixed(1)}%` : '0%';
  }, [recentTransactions]);

  const activePartners = useMemo(() => {
    const uniquePartners = new Set(recentTransactions.map((t) => t.creator_id));
    return uniquePartners.size.toString();
  }, [recentTransactions]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground mt-1">
            Manage and analyze your transaction history
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          Icon={DollarSign}
          title="Total Volume"
          value={totalVolume}
          description="Total transaction value"
        />

        <StatsCard
          Icon={TrendingUp}
          title="Total Transactions"
          value={recentTransactions.length.toString()}
          description="All time transactions"
        />

        <StatsCard
          Icon={CheckCircle2}
          title="Success Rate"
          value={successRate}
          description="Completed transactions"
        />

        <StatsCard
          Icon={Users}
          title="Active Partners"
          value={activePartners}
          description="Unique transaction partners"
        />
      </div>

      {/* Main Content Tabs */}
      <div className="flex h-full w-full flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-7">
          {/* Transaction Volume Chart */}
          <AreaChartComponent transactionVolumeData={transactionVolumeData} />

          {/* Status Distribution */}
          <PieChartComponent statusDistributionData={statusDistributionData} />
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  {isCancelMode ? (
                    <span className="text-amber-600">
                      Cancel mode active - Select active transactions to cancel
                      ({displayTransactions.length} cancellable)
                    </span>
                  ) : isDeleteMode ? (
                    <span className="text-destructive">
                      Delete mode active - Select transactions to delete (
                      {displayTransactions.length} deletable)
                    </span>
                  ) : (
                    <>
                      Your latest transaction activity
                      {filteredTransactions.length !==
                        recentTransactions.length && (
                        <span className="text-primary ml-2">
                          ({filteredTransactions.length} of{' '}
                          {recentTransactions.length})
                        </span>
                      )}
                    </>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    className="h-9 w-[200px] pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterDialogOpen(true)}
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

                {/* Action Mode Buttons */}
                {!isDeleteMode && !isCancelMode ? (
                  <div className="flex items-center gap-2">
                    {/* Cancel Button - Amber styling */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCancelMode(true)}
                      className="border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-700"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>

                    {/* Delete Button - Red styling */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleteMode(true)}
                      className="border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                ) : isCancelMode ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleBulkCancel}
                      disabled={
                        selectedForCancellation.size === 0 || isCancelling
                      }
                      className="border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-700"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {isCancelling
                        ? 'Cancelling...'
                        : `Cancel Selected (${selectedForCancellation.size})`}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelCancelMode}
                      disabled={isCancelling}
                    >
                      Exit
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={selectedForDeletion.size === 0 || isDeleting}
                      className="border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting
                        ? 'Deleting...'
                        : `Delete Selected (${selectedForDeletion.size})`}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelDelete}
                      disabled={isDeleting}
                    >
                      Exit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                      onClick={() => setFilters({ ...filters, status: 'all' })}
                    />
                  </Badge>
                )}
                {filters.type !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {filters.type}
                    <X
                      className="hover:text-destructive h-3 w-3 cursor-pointer"
                      onClick={() => setFilters({ ...filters, type: 'all' })}
                    />
                  </Badge>
                )}
                {filters.dateRange !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Date: {filters.dateRange}
                    <X
                      className="hover:text-destructive h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setFilters({ ...filters, dateRange: 'all' })
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
                        setFilters({
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

            {/* Select All Checkbox in Delete or Cancel Mode */}
            {(isDeleteMode || isCancelMode) &&
              displayTransactions.length > 0 && (
                <div className="mb-3 flex items-center gap-2 rounded-md border p-3">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={
                      isDeleteMode
                        ? selectedForDeletion.size ===
                          displayTransactions.length
                        : selectedForCancellation.size ===
                          displayTransactions.length
                    }
                    onChange={
                      isDeleteMode ? handleSelectAll : handleSelectAllForCancel
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Select All ({displayTransactions.length} transactions)
                  </label>
                </div>
              )}

            <div className="space-y-3">
              {displayTransactions.length > 0 ? (
                displayTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`flex items-center gap-3 ${
                      isDeleteMode || isCancelMode
                        ? 'hover:bg-accent cursor-pointer rounded-md p-2 transition-colors'
                        : ''
                    }`}
                    onClick={() => {
                      if (isDeleteMode) {
                        handleToggleSelection(transaction.id);
                      } else if (isCancelMode) {
                        handleToggleCancellationSelection(transaction.id);
                      }
                    }}
                  >
                    {(isDeleteMode || isCancelMode) && (
                      <input
                        type="checkbox"
                        checked={
                          isDeleteMode
                            ? selectedForDeletion.has(transaction.id)
                            : selectedForCancellation.has(transaction.id)
                        }
                        onChange={() =>
                          isDeleteMode
                            ? handleToggleSelection(transaction.id)
                            : handleToggleCancellationSelection(transaction.id)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <div className="flex-1">
                      <TransactionItem
                        transaction={transaction}
                        onClick={
                          isDeleteMode || isCancelMode
                            ? () => {
                                // Prevent opening details modal in action modes
                              }
                            : () => handleTransactionClick(transaction)
                        }
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
                  <Search className="mb-3 h-12 w-12 opacity-20" />
                  <p className="text-sm">
                    {isCancelMode
                      ? 'No active transactions found'
                      : isDeleteMode
                        ? 'No deletable transactions found'
                        : 'No transactions found'}
                  </p>
                  <p className="text-xs">
                    {isCancelMode
                      ? 'Only transactions with status "active" can be cancelled'
                      : isDeleteMode
                        ? 'Only transactions with status "waiting for participant", "both joined", or "screenshots uploaded" can be deleted'
                        : 'Try adjusting your search or filters'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              {deleteConfirmationData?.totalCount} transaction(s)?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {deleteConfirmationData?.hardDeleteCount ? (
              <div className="bg-destructive/10 flex items-start gap-3 rounded-md p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {deleteConfirmationData.hardDeleteCount} will be permanently
                    deleted
                  </p>
                  <p className="text-muted-foreground text-xs">
                    These transactions will be completely removed from your
                    database.
                  </p>
                </div>
              </div>
            ) : null}

            {deleteConfirmationData?.softDeleteCount ? (
              <div className="flex items-start gap-3 rounded-md bg-yellow-500/10 p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {deleteConfirmationData.softDeleteCount} will be hidden but
                    preserved in statistics
                  </p>
                  <p className="text-muted-foreground text-xs">
                    These transactions will be hidden from view but kept in your
                    success rate calculations.
                  </p>
                </div>
              </div>
            ) : null}

            <p className="text-destructive text-sm font-semibold">
              This action cannot be undone for permanently deleted transactions.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelConfirmation}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={showCancelConfirmation}
        onOpenChange={setShowCancelConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancel</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel {selectedForCancellation.size}{' '}
              active transaction(s)?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md border-amber-500/20 bg-amber-500/10 p-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700">
                  {selectedForCancellation.size} active transaction(s) will be
                  cancelled
                </p>
                <p className="text-muted-foreground text-xs">
                  Cancelled transactions cannot be reactivated. All participants
                  will be notified.
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-amber-600">
              This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirmation(false)}
              disabled={isCancelling}
            >
              Go Back
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="border-amber-500/20 bg-amber-500 text-white hover:bg-amber-600"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Transactions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
