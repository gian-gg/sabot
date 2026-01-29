import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TransactionItemSkeleton() {
  return (
    <Card className="flex flex-col gap-3 p-3 sm:h-[160px] sm:flex-row sm:gap-6 sm:p-5">
      <div className="flex flex-1 gap-3 sm:gap-6">
        {/* Icon Section */}
        <div className="shrink-0">
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32 md:w-48" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <Skeleton className="hidden h-4 w-full max-w-[300px] sm:block" />
          </div>

          {/* Badges Row - Desktop */}
          <div className="hidden gap-2 sm:flex">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>

          {/* Footer Meta */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t pt-3 sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:pt-0">
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-7 w-24" />
        </div>

        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </Card>
  );
}
