import { BackButton } from '@/components/core/back-button';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileStats } from '@/components/profile/profile-stats';
import { TransactionHistoryList } from '@/components/profile/transaction-history-list';
import { ProfileActions } from '@/components/profile/profile-actions';
import {
  ProfileAlert,
  ProfileNotFound,
} from '@/components/profile/profile-alert';
import { getUserProfile } from '@/lib/supabase/db/profile';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

const UserPage = async ({ params }: ProfilePageProps) => {
  const { id } = await params;
  const profile = await getUserProfile(id);

  if (!profile) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <BackButton />
        <ProfileNotFound />
      </div>
    );
  }

  const hasTransactions = profile.recentTransactions.length > 0;

  return (
    <div className="container mx-auto max-w-5xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8 md:px-8">
      <BackButton />
      <ProfileHeader profile={profile} showTrustScore={profile.isVerified} />

      <div className="flex justify-center sm:justify-start">
        <ProfileActions
          userId={profile.id}
          userName={profile.name}
          userEmail={profile.email}
        />
      </div>

      {!profile.isVerified && (
        <ProfileAlert
          type="warning"
          title="Unverified User"
          message="This user has not completed identity verification. Transaction history is hidden for unverified users."
        />
      )}

      {profile.isVerified && !hasTransactions && (
        <ProfileAlert
          type="info"
          title="No Transaction History"
          message="This user hasn't completed any transactions yet."
        />
      )}

      {profile.isVerified && hasTransactions && (
        <>
          <ProfileStats stats={profile.stats} />
          <TransactionHistoryList
            transactions={profile.recentTransactions}
            showFilter={true}
          />
        </>
      )}
    </div>
  );
};

export default UserPage;
