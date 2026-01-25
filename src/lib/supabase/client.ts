'use client';

import { createBrowserClient } from '@supabase/ssr';
import { clearUser } from '@/store/user/userStore';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  clearUser();
  if (error) {
    throw new Error(`Error signing out: ${error.message}`);
  }
}
