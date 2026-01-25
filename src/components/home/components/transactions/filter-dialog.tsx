'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { TransactionStatus } from '@/types/transaction';
import { Calendar, DollarSign, Filter, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

export interface TransactionFilters {
  status: TransactionStatus | 'all';
  type: 'all' | 'meetup' | 'delivery' | 'online';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  minAmount?: number;
  maxAmount?: number;
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

export function FilterDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: FilterDialogProps) {
  // Local state to hold temporary filter values
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  // Sync local filters with prop filters when dialog opens
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleReset = () => {
    setLocalFilters({
      status: 'all',
      type: 'all',
      dateRange: 'all',
      minAmount: undefined,
      maxAmount: undefined,
    });
  };

  const handleApply = () => {
    onFiltersChange({
      ...localFilters,
      // Whenever filters change, reset to page 1 to ensure results exist
      // This logic actually belongs in the parent handler usually, but we pass full filters back
      // The parent `handleFilterChange` already does `page: 1`
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalFilters(filters); // Revert to original filters
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Transactions
          </DialogTitle>
          <DialogDescription>
            Customize your transaction view with filters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  status: value as TransactionStatus | 'all',
                })
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select
              value={localFilters.type}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  type: value as 'all' | 'meetup' | 'delivery' | 'online',
                })
              }
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="meetup">In-Person Meetup</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="online">Online Transaction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label htmlFor="dateRange" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <Select
              value={localFilters.dateRange}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  dateRange: value as TransactionFilters['dateRange'],
                })
              }
            >
              <SelectTrigger id="dateRange" className="w-full">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Amount Range Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Amount Range
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label
                  htmlFor="minAmount"
                  className="text-muted-foreground text-xs"
                >
                  Min Amount
                </Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="0"
                  value={localFilters.minAmount ?? ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      minAmount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="maxAmount"
                  className="text-muted-foreground text-xs"
                >
                  Max Amount
                </Label>
                <Input
                  id="maxAmount"
                  type="number"
                  placeholder="∞"
                  value={localFilters.maxAmount ?? ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      maxAmount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
