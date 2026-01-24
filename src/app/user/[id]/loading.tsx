import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <Card className="relative overflow-hidden border-neutral-800 bg-neutral-900/50">
        <CardContent className="p-5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              {/* Avatar */}
              <Skeleton className="h-24 w-24 rounded-full bg-neutral-800" />

              {/* Info */}
              <div className="space-y-2 text-center sm:text-left">
                <Skeleton className="h-8 w-48 bg-neutral-800" />
                <Skeleton className="h-4 w-32 bg-neutral-800" />
                <div className="flex justify-center gap-2 pt-1 sm:justify-start">
                  <Skeleton className="h-5 w-20 bg-neutral-800" />
                  <Skeleton className="h-5 w-20 bg-neutral-800" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Skeleton */}
      <div className="mt-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40 bg-neutral-800" />
            <Skeleton className="h-4 w-60 bg-neutral-800" />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <Skeleton className="h-10 w-full max-w-[400px] rounded-lg bg-neutral-800" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-24 w-full rounded-lg bg-neutral-800"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
