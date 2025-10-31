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

import type { TransactionDetails } from '@/types/transaction';

const recentTransactions: TransactionDetails[] = [
  {
    id: '1',
    creator_id: 'user_001',
    creator_name: 'John D.',
    creator_email: 'john.d@example.com',
    creator_avatar_url: null,
    status: 'completed' as TransactionStatus,
    item_name: 'MacBook Pro 2023',
    item_description: 'Barely used MacBook Pro with AppleCare+ warranty',
    price: 1299,
    meeting_location: 'San Francisco, CA',
    meeting_time: '2025-10-30T14:00:00Z',
    delivery_address: null,
    delivery_method: null,
    online_platform: null,
    online_contact: null,
    online_instructions: null,
    category: 'Electronics',
    condition: 'like-new',
    quantity: 1,
    transaction_type: 'meetup' as const,
    hash: null,
    created_at: '2025-10-30T10:00:00Z',
    updated_at: '2025-10-30T15:00:00Z',
  },
  {
    id: '2',
    creator_id: 'user_002',
    creator_name: 'Sarah M.',
    creator_email: 'sarah.m@example.com',
    creator_avatar_url: null,
    status: 'active' as TransactionStatus,
    item_name: 'iPhone 15 Pro',
    item_description: 'Brand new iPhone 15 Pro in Natural Titanium',
    price: 999,
    meeting_location: null,
    meeting_time: null,
    delivery_address: '123 Main St, Los Angeles, CA 90001',
    delivery_method: 'UPS Ground',
    online_platform: null,
    online_contact: null,
    online_instructions: null,
    category: 'Electronics',
    condition: 'new',
    quantity: 1,
    transaction_type: 'delivery' as const,
    hash: null,
    created_at: '2025-10-29T10:00:00Z',
    updated_at: '2025-10-29T10:00:00Z',
  },
  {
    id: '3',
    creator_id: 'user_003',
    creator_name: 'Mike K.',
    creator_email: 'mike.k@example.com',
    creator_avatar_url: null,
    status: 'pending' as TransactionStatus,
    item_name: 'Sony WH-1000XM5',
    item_description: 'Premium noise-cancelling wireless headphones',
    price: 349,
    meeting_location: null,
    meeting_time: null,
    delivery_address: null,
    delivery_method: null,
    online_platform: 'Discord',
    online_contact: '@mikek#1234',
    online_instructions: 'Will send digital code via DM',
    category: 'Electronics',
    condition: 'new',
    quantity: 1,
    transaction_type: 'online' as const,
    hash: null,
    created_at: '2025-10-28T10:00:00Z',
    updated_at: '2025-10-28T10:00:00Z',
  },
  {
    id: '4',
    creator_id: 'user_004',
    creator_name: 'Mike R.',
    creator_email: 'mike.r@example.com',
    creator_avatar_url: null,
    status: 'pending' as TransactionStatus,
    item_name: 'Gaming Console',
    item_description: 'PlayStation 5 with two controllers',
    price: 450,
    meeting_location: 'Seattle, WA',
    meeting_time: '2025-10-28T16:00:00Z',
    delivery_address: null,
    delivery_method: null,
    online_platform: null,
    online_contact: null,
    online_instructions: null,
    category: 'Gaming',
    condition: 'good',
    quantity: 1,
    transaction_type: 'meetup' as const,
    hash: null,
    created_at: '2025-10-28T10:00:00Z',
    updated_at: '2025-10-28T10:00:00Z',
  },
  {
    id: '5',
    creator_id: 'user_005',
    creator_name: 'Emma L.',
    creator_email: 'emma.l@example.com',
    creator_avatar_url: null,
    status: 'completed' as TransactionStatus,
    item_name: 'Designer Watch',
    item_description: 'Authentic Rolex Submariner with papers',
    price: 2500,
    meeting_location: null,
    meeting_time: null,
    delivery_address: '456 Park Ave, New York, NY 10022',
    delivery_method: 'FedEx Overnight',
    online_platform: null,
    online_contact: null,
    online_instructions: null,
    category: 'Luxury',
    condition: 'excellent',
    quantity: 1,
    transaction_type: 'delivery' as const,
    hash: null,
    created_at: '2025-10-27T10:00:00Z',
    updated_at: '2025-10-27T18:00:00Z',
  },
  {
    id: '6',
    creator_id: 'user_006',
    creator_name: 'David K.',
    creator_email: 'david.k@example.com',
    creator_avatar_url: null,
    status: 'disputed' as TransactionStatus,
    item_name: 'Vintage Camera',
    item_description: 'Leica M6 film camera in excellent condition',
    price: 680,
    meeting_location: 'Austin, TX',
    meeting_time: '2025-10-26T14:00:00Z',
    delivery_address: null,
    delivery_method: null,
    online_platform: null,
    online_contact: null,
    online_instructions: null,
    category: 'Photography',
    condition: 'excellent',
    quantity: 1,
    transaction_type: 'meetup' as const,
    hash: null,
    created_at: '2025-10-26T10:00:00Z',
    updated_at: '2025-10-26T14:00:00Z',
  },
  {
    id: '7',
    creator_id: 'user_007',
    creator_name: 'Alex P.',
    creator_email: 'alex.p@example.com',
    creator_avatar_url: null,
    status: 'completed' as TransactionStatus,
    item_name: 'Mountain Bike',
    item_description: 'Carbon fiber mountain bike, lightly used',
    price: 1200,
    meeting_location: 'Denver, CO',
    meeting_time: '2025-10-25T12:00:00Z',
    delivery_address: null,
    delivery_method: null,
    online_platform: null,
    online_contact: null,
    online_instructions: null,
    category: 'Sports',
    condition: 'good',
    quantity: 1,
    transaction_type: 'meetup' as const,
    hash: null,
    created_at: '2025-10-25T10:00:00Z',
    updated_at: '2025-10-25T14:00:00Z',
  },
  {
    id: '8',
    creator_id: 'user_008',
    creator_name: 'Rachel T.',
    creator_email: 'rachel.t@example.com',
    creator_avatar_url: null,
    status: 'active' as TransactionStatus,
    item_name: 'Laptop',
    item_description: 'Dell XPS 13 with 16GB RAM',
    price: 850,
    meeting_location: null,
    meeting_time: null,
    delivery_address: '789 Oak St, Portland, OR 97201',
    delivery_method: 'USPS Priority',
    online_platform: null,
    online_contact: null,
    online_instructions: null,
    category: 'Electronics',
    condition: 'good',
    quantity: 1,
    transaction_type: 'delivery' as const,
    hash: null,
    created_at: '2025-10-24T10:00:00Z',
    updated_at: '2025-10-24T10:00:00Z',
  },
  {
    id: '9',
    creator_id: 'user_009',
    creator_name: 'Chris W.',
    creator_email: 'chris.w@example.com',
    creator_avatar_url: null,
    status: 'pending' as TransactionStatus,
    item_name: 'Collectible Sneakers',
    item_description: 'Limited edition Air Jordan 1s, size 10',
    price: 450,
    meeting_location: 'Miami, FL',
    meeting_time: '2025-10-23T15:00:00Z',
    delivery_address: null,
    delivery_method: null,
    online_platform: null,
    online_contact: null,
    online_instructions: null,
    category: 'Fashion',
    condition: 'new',
    quantity: 1,
    transaction_type: 'meetup' as const,
    hash: null,
    created_at: '2025-10-23T10:00:00Z',
    updated_at: '2025-10-23T10:00:00Z',
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
  }, []);

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
  }, []);

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return recentTransactions.filter((transaction) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        transaction.item_name.toLowerCase().includes(searchLower) ||
        transaction.creator_name.toLowerCase().includes(searchLower) ||
        transaction.id.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        filters.status === 'all' || transaction.status === filters.status;

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

  // Calculate total stats from recent transactions
  const totalVolume = useMemo(() => {
    const total = recentTransactions.reduce((sum, t) => sum + t.price, 0);
    return `$${total.toLocaleString()}`;
  }, []);

  const successRate = useMemo(() => {
    const completed = recentTransactions.filter(
      (t) => t.status === 'completed'
    ).length;
    const rate = (completed / recentTransactions.length) * 100;
    return `${rate.toFixed(1)}%`;
  }, []);

  const activePartners = useMemo(() => {
    const uniquePartners = new Set(recentTransactions.map((t) => t.creator_id));
    return uniquePartners.size.toString();
  }, []);

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
