import React from 'react';

type Props = {
  params: { id: string };
};

export default function ProfilePage({ params }: Props) {
  const { id } = params;
  // Replace with real data fetching (Supabase/etc.) as needed.
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-muted-foreground mt-4 text-sm">User ID: {id}</p>
      {/* ...add profile details, actions, components... */}
    </main>
  );
}
