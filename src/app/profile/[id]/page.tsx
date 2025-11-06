import { notFound } from 'next/navigation';
import { BackButton } from '@/components/core/back-button';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileStats } from '@/components/profile/profile-stats';
import { TransactionHistoryList } from '@/components/profile/transaction-history-list';
import { ProfileActions } from '@/components/profile/profile-actions';
import { getUserProfile } from '@/lib/supabase/db/profile';

const UserPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const profile = await getUserProfile(id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8 md:px-8">
      <BackButton />
      <ProfileHeader profile={profile} showTrustScore={true} />

      <div className="flex justify-center sm:justify-start">
        <ProfileActions
          userId={profile.id}
          userName={profile.name}
          userEmail={profile.email}
        />
      </div>

      <ProfileStats stats={profile.stats} />

      <TransactionHistoryList
        transactions={profile.recentTransactions}
        showFilter={true}
      />
    </div>
  );
};

export default UserPage;
