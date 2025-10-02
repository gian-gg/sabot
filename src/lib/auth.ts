import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db'; // your drizzle instance

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: { enabled: true },
  //   socialProviders: {
  //     google: {
  //       clientId: process.env.GOOGLE_CLIENT_ID as string,
  //       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  //       accessType: 'offline',
  //       prompt: 'login',
  //     },
  //   },
});
