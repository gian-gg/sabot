'use client';

import { InvitationLink } from '@/components/shared/invitation-link';

interface AgreementLinkProps {
  link: string;
}

export function AgreementLink({ link }: AgreementLinkProps) {
  return <InvitationLink link={link} type="agreement" />;
}
