'use client';

import { useState } from 'react';
import { CreateTransactionForm } from '@/components/transaction/invite/create-transaction-form';
import { InvitationCreatedView } from '@/components/transaction/invite/invitation-created-view';

export default function TransactionInvitePage() {
  const [transactionCreated, setTransactionCreated] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');

  const handleTransactionCreated = (id: string, url: string) => {
    setTransactionId(id);
    setInviteUrl(url);
    setTransactionCreated(true);
  };

  if (transactionCreated) {
    return (
      <InvitationCreatedView
        transactionId={transactionId}
        inviteUrl={inviteUrl}
      />
    );
  }

  return (
    <CreateTransactionForm onTransactionCreated={handleTransactionCreated} />
  );
}
