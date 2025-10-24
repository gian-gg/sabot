import dynamic from 'next/dynamic';

// Wrap CollaborativeDataResolver with dynamic() because it imports Y.js which can't be used in SSR
export const CollaborativeDataResolverNoSsr = dynamic(
  () => import('@/components/transaction/collaborative-data-resolver'),
  {
    ssr: false,
  }
);
