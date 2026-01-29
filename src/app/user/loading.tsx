import { TransactionItemSkeleton } from '@/components/home/components/transactions/transaction-item-skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-[70vh] space-y-8">
      {/* Header Skeleton */}
      <Card className="relative overflow-hidden border-neutral-800 bg-neutral-900/50">
        <CardContent className="relative p-5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Skeleton className="h-24 w-24 rounded-full border-2 border-neutral-700" />
              <div className="space-y-3 text-center sm:text-left">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
            <div className="flex w-full justify-center gap-2 sm:w-auto sm:justify-start">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Skeleton */}
      <div className="mt-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-11 w-full sm:w-32" />
        </div>

        <div className="mt-6 space-y-6">
          {/* Tabs Skeleton */}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Skeleton className="h-10 w-full rounded-lg sm:w-32" />
            <Skeleton className="h-10 w-full rounded-lg sm:w-32" />
          </div>

          {/* List Skeletons */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <TransactionItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
