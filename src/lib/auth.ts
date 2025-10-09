import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as authSchemas from '@/lib/db/schema';
import { db } from '@/lib/db'; // your drizzle instance

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchemas,
  }),
  emailAndPassword: { enabled: true },
});
