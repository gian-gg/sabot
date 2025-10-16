'use server';

import { createClient } from '../server';

export async function isUserVerified(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_data')
    .select('is_verified')
    .eq('id', userId)
    .single();

  // if there's an error or no data, we assume the user is not verified
  if (error || !data) {
    return false;
  }

  return Boolean(data.is_verified);
}
