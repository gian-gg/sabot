import { notFound } from 'next/navigation';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileStats } from '@/components/profile/profile-stats';
import { TransactionHistoryList } from '@/components/profile/transaction-history-list';
import { ProfileActions } from '@/components/profile/profile-actions';
import { getUserProfileOrDefault } from '@/lib/mock-data/profiles';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

const UserPage = async ({ params }: ProfilePageProps) => {
  const { id } = await params;
  const profile = getUserProfileOrDefault(id);

  if (!profile || profile.name === 'Unknown User') {
    notFound();
  }

  return (
    <div className="container mx-auto mt-12 max-w-7xl space-y-6 px-4 py-8">
      <ProfileHeader profile={profile} showTrustScore={true} />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
