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
import type { TransactionStatus } from '@/types/transaction';
import {
  CheckCircle2,
  DollarSign,
  Filter,
  Search,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import AreaChartComponent from './components/transactions/area-chart-component';
import PieChartComponent from './components/transactions/pie-chart-component';
import StatsCard from './components/transactions/stats-card';
import TransactionItem from './components/transactions/transaction-item';
import { TransactionDetailsModal } from './components/transactions/transaction-details-modal';
import {
  FilterDialog,
  type TransactionFilters,
} from './components/transactions/filter-dialog';

const transactionVolumeData = [
  { month: 'Jan', volume: 245, value: 12450 },
  { month: 'Feb', volume: 312, value: 18720 },
  { month: 'Mar', volume: 289, value: 15340 },
  { month: 'Apr', volume: 401, value: 24060 },
  { month: 'May', volume: 478, value: 28680 },
  { month: 'Jun', volume: 523, value: 36610 },
];

const statusDistributionData = [
  { name: 'Completed', value: 523, color: '#01d06c' },
  { name: 'Active', value: 45, color: '#3b82f6' },
  { name: 'Pending', value: 28, color: '#f59e0b' },
  { name: 'Disputed', value: 4, color: '#ef4444' },
];

const recentTransactions = [
  {
    id: '1',
    type: 'Sale',
    item: 'MacBook Pro 2023',
    amount: 1299,
    status: 'completed' as TransactionStatus,
    date: '2024-10-30',
    counterparty: 'John D.',
    description: 'Barely used MacBook Pro with AppleCare+ warranty',
    category: 'Electronics',
    location: 'San Francisco, CA',
    paymentMethod: 'Escrow',
    escrowStatus: 'Funds released',
  },
  {
    id: '2',
    type: 'Purchase',
    item: 'iPhone 15 Pro',
    amount: 999,
    status: 'active' as TransactionStatus,
    date: '2024-10-29',
    counterparty: 'Sarah M.',
    description: 'Brand new iPhone 15 Pro in Natural Titanium',
    category: 'Electronics',
    location: 'Los Angeles, CA',
    paymentMethod: 'Escrow',
    escrowStatus: 'In escrow',
  },
  {
    id: '3',
    type: 'Sale',
    item: 'Gaming Console',
    amount: 450,
    status: 'pending' as TransactionStatus,
    date: '2024-10-28',
    counterparty: 'Mike R.',
    description: 'PlayStation 5 with two controllers',
    category: 'Gaming',
    location: 'Seattle, WA',
    paymentMethod: 'Escrow',
    escrowStatus: 'Awaiting confirmation',
  },
  {
    id: '4',
    type: 'Purchase',
    item: 'Designer Watch',
    amount: 2500,
    status: 'completed' as TransactionStatus,
    date: '2024-10-27',
    counterparty: 'Emma L.',
    description: 'Authentic Rolex Submariner with papers',
    category: 'Luxury',
    location: 'New York, NY',
    paymentMethod: 'Escrow',
    escrowStatus: 'Completed',
  },
  {
    id: '5',
    type: 'Sale',
    item: 'Vintage Camera',
    amount: 680,
    status: 'disputed' as TransactionStatus,
    date: '2024-10-26',
    counterparty: 'David K.',
    description: 'Leica M6 film camera in excellent condition',
    category: 'Photography',
    location: 'Austin, TX',
    paymentMethod: 'Escrow',
    escrowStatus: 'Under review',
  },
  {
    id: '6',
    type: 'Purchase',
    item: 'Mountain Bike',
    amount: 1200,
    status: 'completed' as TransactionStatus,
    date: '2024-10-25',
    counterparty: 'Alex P.',
    description: 'Carbon fiber mountain bike, lightly used',
    category: 'Sports',
    location: 'Denver, CO',
    paymentMethod: 'Escrow',
    escrowStatus: 'Completed',
  },
  {
    id: '7',
    type: 'Sale',
    item: 'Laptop',
    amount: 850,
    status: 'active' as TransactionStatus,
    date: '2024-10-24',
    counterparty: 'Rachel T.',
    description: 'Dell XPS 13 with 16GB RAM',
    category: 'Electronics',
    location: 'Portland, OR',
    paymentMethod: 'Escrow',
    escrowStatus: 'In progress',
  },
  {
    id: '8',
    type: 'Purchase',
    item: 'Collectible Sneakers',
    amount: 450,
    status: 'pending' as TransactionStatus,
    date: '2024-10-23',
    counterparty: 'Chris W.',
    description: 'Limited edition Air Jordan 1s, size 10',
    category: 'Fashion',
    location: 'Miami, FL',
    paymentMethod: 'Escrow',
    escrowStatus: 'Pending verification',
  },
];

export default function TransactionsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<
    (typeof recentTransactions)[0] | null
  >(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    status: 'all',
    type: 'all',
    dateRange: 'all',
  });

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return recentTransactions.filter((transaction) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        transaction.item.toLowerCase().includes(searchLower) ||
        transaction.counterparty.toLowerCase().includes(searchLower) ||
        transaction.id.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        filters.status === 'all' || transaction.status === filters.status;

      // Type filter
      const matchesType =
        filters.type === 'all' || transaction.type === filters.type;

      // Amount filter
      const matchesMinAmount =
        filters.minAmount === undefined ||
        transaction.amount >= filters.minAmount;
      const matchesMaxAmount =
        filters.maxAmount === undefined ||
        transaction.amount <= filters.maxAmount;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesMinAmount &&
        matchesMaxAmount
      );
    });
  }, [searchQuery, filters]);

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

  const handleTransactionClick = (
    transaction: (typeof recentTransactions)[0]
  ) => {
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
          value="$136,860"
          description="+20.1% from last month"
        />

        <StatsCard
          Icon={TrendingUp}
          title="Total Transactions"
          value="2,248"
          description="+15.3% from last month"
        />

        <StatsCard
          Icon={CheckCircle2}
          title="Success Rate"
          value="98.2%"
          description="+2.4% improvement"
        />

        <StatsCard
          Icon={Users}
          title="Active Partners"
          value="573"
          description="-3.2% from last month"
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
                  Your latest transaction activity
                  {filteredTransactions.length !==
                    recentTransactions.length && (
                    <span className="text-primary ml-2">
                      ({filteredTransactions.length} of{' '}
                      {recentTransactions.length})
                    </span>
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

            <div className="space-y-3">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => handleTransactionClick(transaction)}
                  />
                ))
              ) : (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
                  <Search className="mb-3 h-12 w-12 opacity-20" />
                  <p className="text-sm">No transactions found</p>
                  <p className="text-xs">
                    Try adjusting your search or filters
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
    </div>
  );
}
