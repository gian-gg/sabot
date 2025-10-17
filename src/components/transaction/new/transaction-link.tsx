'use client';

import { InvitationLink } from '@/components/shared/invitation-link';

interface TransactionLinkProps {
  link: string;
}

export function TransactionLink({ link }: TransactionLinkProps) {
  return <InvitationLink link={link} type="transaction" />;
}

// Keep default export for backward compatibility
export default TransactionLink;
