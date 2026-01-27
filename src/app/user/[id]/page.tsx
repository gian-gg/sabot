import { ProfileNotFound } from '@/components/profile/profile-alert';
import { UserProfileContent } from '@/components/user/user-profile-content';
import { getUserProfile } from '@/lib/supabase/db/profile';
import { getTransactionDetailsByUserID } from '@/lib/supabase/db/transactions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const UserProfilePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { id } = await params;

  if (user.id === id) {
    redirect('/user');
  }

  // Fetch profile and transactions in parallel
  const [profile, allTransactions] = await Promise.all([
    getUserProfile(id),
    getTransactionDetailsByUserID(id),
  ]);

  if (!profile) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <ProfileNotFound />
      </div>
    );
  }

  return (
    <UserProfileContent
      user={{
        id: profile.id,
        name: profile.name,
        email: profile.email || '', // Show email if available
        image: profile.avatar,
        verificationStatus: profile.isVerified ? 'verified' : 'not-started',
      }}
      transactions={allTransactions}
      isOwnProfile={false}
      showBackButton={true}
    />
  );
};

export default UserProfilePage;
