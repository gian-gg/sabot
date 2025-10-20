import React from 'react';

// Add import for the client component
import ProfileClient from './ProfileClient';

type Props = {
  params: { id: string };
};

export default function ProfilePage({ params }: Props) {
  const { id } = params;
  // Render the client component and pass id
  return <ProfileClient id={id} />;
}
