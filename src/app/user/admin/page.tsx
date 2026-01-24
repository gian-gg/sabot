'use server';

import React from 'react';
import AdminClient from './client';
import { getVerificationRequests } from '@/lib/supabase/db/verify';

const AdminPage = async () => {
  const requests = await getVerificationRequests();

  return <AdminClient requests={requests} />;
};

export default AdminPage;
