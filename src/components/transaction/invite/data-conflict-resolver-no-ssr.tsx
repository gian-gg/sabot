import dynamic from 'next/dynamic';

// Wrap DataConflictResolver with dynamic() because it imports Y.js which can't be used in SSR
export const DataConflictResolverNoSsr = dynamic(
  () => import('@/components/transaction/invite/data-conflict-resolver'),
  {
    ssr: false,
  }
);
