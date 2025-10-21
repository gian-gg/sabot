'use client';

import { use } from 'react';
import { TransactionActivePage } from '@/components/transaction/id/transaction-active-page';

export default function TransactionActive({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <TransactionActivePage transactionId={id} />;
}
