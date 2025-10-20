# Quick Start Guide - Real-time Transaction Flow

Get the transaction invitation system running in 5 minutes.

## Prerequisites

- Supabase project created
- Environment variables configured
- Application running locally

## Setup Steps

### 1. Configure Environment (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Run Database Migrations

**Option A: Via Supabase Dashboard**

1. Go to SQL Editor
2. Copy contents of `supabase/migrations/001_create_transactions.sql`
3. Run the script
4. Copy contents of `supabase/migrations/002_create_storage_bucket.sql`
5. Run the script

**Option B: Via Supabase CLI**

```bash
supabase migration up
```

### 3. Enable Realtime

1. Go to **Database** → **Replication**
2. Enable for: `transactions`, `transaction_participants`
3. Select all events

### 4. Start Development Server

```bash
bun run dev
```

## Testing Flow

### As User A (Creator):

1. Navigate to: `http://localhost:3000/transaction/new`
2. Copy the generated invitation link
3. Wait for User B to join

### As User B (Invitee):

1. Open invitation link in incognito/different browser
2. Sign in with different account
3. Click "Accept Invitation"
4. Upload screenshot

### Expected Behavior:

✅ Both users automatically navigate to upload screen when both join
✅ Both users automatically navigate to transaction details when both upload
✅ Real-time updates reflect in both windows

## File Structure

```
src/
├── app/api/transaction/
│   ├── create/route.ts          # Create transaction
│   ├── join/route.ts             # Join transaction
│   └── [id]/
│       ├── status/route.ts       # Get status
│       └── upload/route.ts       # Upload screenshot
├── components/transaction/invite/
│   ├── create-invitation-page.tsx    # Creator flow
│   └── accept-invitation-page.tsx    # Invitee flow
├── hooks/
│   └── useTransactionStatus.ts   # Real-time hook
├── types/
│   └── transaction.ts            # TypeScript types
supabase/migrations/
├── 001_create_transactions.sql   # Database schema
└── 002_create_storage_bucket.sql # Storage setup
```

## Common Issues

### "Transaction not found"

→ Check RLS policies are applied correctly

### Real-time not working

→ Verify Realtime is enabled in Supabase Dashboard

### Upload fails

→ Ensure storage bucket created and RLS policies set

## Next Steps

- Read full documentation: [TRANSACTION_FLOW_SETUP.md](./TRANSACTION_FLOW_SETUP.md)
- Implement email invitations
- Add transaction details validation
- Deploy to production

## Support

For detailed troubleshooting, see the [full setup guide](./TRANSACTION_FLOW_SETUP.md#troubleshooting).
