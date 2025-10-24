'use client';

import { CreateInvitationPage } from '@/components/agreement/invite/page';

export default function InvitePage() {
  // Always show the create invitation flow
  // Accepting invitations is now at /agreement/accept?id=xxx
  return <CreateInvitationPage />;
}
