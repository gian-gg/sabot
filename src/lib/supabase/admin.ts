import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client with service role key
 * Use this for server-side operations that require bypassing RLS
 * or accessing user data without an active session (e.g., webhooks)
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
