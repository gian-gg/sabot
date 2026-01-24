import { PageHeader } from '@/components/core/page-header';
import { CreateEscrowForm } from '@/components/escrow/create-escrow-form';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * New Escrow Page
 *
 * Allows verified users to create a new escrow-protected transaction.
 * This page is the entry point for initiating escrow transactions.
 */
export default function NewEscrowPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <PageHeader showBackButton backButtonFallback="/user" />

      <Suspense fallback={<FormSkeleton />}>
        <CreateEscrowForm />
      </Suspense>
    </div>
  );
}

/**
 * Loading skeleton for the create escrow form
 */
function FormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
