# Real-time Transaction Invitation Flow - Complete Setup Guide

This guide provides step-by-step instructions for implementing and deploying the real-time transaction invitation system in production.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Storage Configuration](#storage-configuration)
5. [Environment Variables](#environment-variables)
6. [API Endpoints](#api-endpoints)
7. [Real-time Synchronization](#real-time-synchronization)
8. [Frontend Integration](#frontend-integration)
9. [Testing the Flow](#testing-the-flow)
10. [Production Deployment](#production-deployment)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The transaction invitation flow enables:

- **User A** creates a transaction and generates a shareable invitation link
- **User B** receives and clicks the link, accepts the invitation
- Both users are automatically synchronized via Supabase Realtime
- When both join, they're automatically navigated to screenshot upload
- When both upload, they proceed to transaction details

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   User A    │         │   Supabase   │         │   User B    │
│  (Creator)  │         │   Database   │         │  (Invitee)  │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. Create Transaction │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │ 2. Generate Link      │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │ 3. Share Link         │                        │
       ├───────────────────────┼───────────────────────>│
       │                       │                        │
       │                       │ 4. Join Transaction    │
       │                       │<───────────────────────┤
       │                       │                        │
       │ 5. Realtime Event     │ 6. Realtime Event      │
       │<──────────────────────┼───────────────────────>│
       │                       │                        │
       │ 7. Both Navigate to Screenshot Upload          │
       │                       │                        │
       │ 8. Upload Screenshot  │ 9. Upload Screenshot   │
       ├──────────────────────>│<───────────────────────┤
       │                       │                        │
       │ 10. Both Navigate to Transaction Details       │
       │                       │                        │
```

---

## Prerequisites

- **Supabase Project**: Active Supabase project
- **Node.js**: v18+ with Bun package manager
- **Authentication**: Users must be authenticated via Supabase Auth
- **Verification**: (Optional) Implement user verification flow

---

## Database Setup

### Step 1: Run Migrations

Navigate to your Supabase dashboard or use the CLI:

```bash
# If using Supabase CLI
supabase migration up

# Or apply manually via Supabase Dashboard > SQL Editor
```

### Step 2: Apply Schema Migration

Run the SQL from `supabase/migrations/001_create_transactions.sql`:

```sql
-- Creates:
-- - transactions table
-- - transaction_participants table
-- - transaction_screenshots table
-- - Indexes for performance
-- - Row Level Security policies
-- - Helper functions
```

**Key Tables:**

| Table                      | Purpose                                |
| -------------------------- | -------------------------------------- |
| `transactions`             | Stores transaction metadata and status |
| `transaction_participants` | Links users to transactions (2 max)    |
| `transaction_screenshots`  | Stores uploaded screenshot metadata    |

**Transaction Status Flow:**

```
pending → waiting_for_participant → both_joined → screenshots_uploaded → active → completed
```

### Step 3: Enable Realtime

In Supabase Dashboard:

1. Go to **Database** → **Replication**
2. Enable replication for:
   - `transactions` table
   - `transaction_participants` table
3. Select all events: `INSERT`, `UPDATE`, `DELETE`

---

## Storage Configuration

### Step 1: Create Storage Bucket

Run the SQL from `supabase/migrations/002_create_storage_bucket.sql`:

```sql
-- Creates 'transaction-screenshots' bucket with RLS policies
```

Or via Dashboard:

1. Go to **Storage** → **New Bucket**
2. Name: `transaction-screenshots`
3. Public: **NO** (private bucket)
4. Apply RLS policies from migration file

### Step 2: Configure CORS (If needed)

In Supabase Dashboard → Storage → Configuration:

```json
{
  "allowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedHeaders": ["*"],
  "maxAge": 3600
}
```

---

## Environment Variables

Add to your `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Application URL (important for invite links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Change in production

# Optional: Email Service for sending invitations
# RESEND_API_KEY=your-resend-key
# SENDGRID_API_KEY=your-sendgrid-key
```

**Production Environment Variables:**

```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## API Endpoints

All API routes are located in `src/app/api/transaction/`:

### 1. Create Transaction

**Endpoint:** `POST /api/transaction/create`

**Purpose:** Creates a new transaction and adds creator as participant

**Request Body:**

```json
{
  "item_name": "iPhone 14 Pro",
  "item_description": "256GB, Space Gray",
  "price": 899.99,
  "meeting_location": "Downtown Coffee Shop",
  "meeting_time": "2025-10-21T14:00:00Z"
}
```

**Response:**

```json
{
  "transaction": {
    "id": "uuid",
    "status": "waiting_for_participant",
    ...
  },
  "invite_url": "https://yourdomain.com/transaction/invite?id=uuid"
}
```

### 2. Join Transaction

**Endpoint:** `POST /api/transaction/join`

**Purpose:** Adds invitee as participant and updates status to `both_joined`

**Request Body:**

```json
{
  "transaction_id": "uuid"
}
```

**Response:**

```json
{
  "participant": { ... },
  "transaction": { ... }
}
```

### 3. Check Status

**Endpoint:** `GET /api/transaction/[id]/status`

**Purpose:** Returns current transaction status and participant info

**Response:**

```json
{
  "transaction": { ... },
  "participants": [ ... ],
  "current_user_role": "creator",
  "is_ready_for_next_step": true
}
```

### 4. Upload Screenshot

**Endpoint:** `POST /api/transaction/[id]/upload`

**Purpose:** Uploads screenshot to Supabase Storage

**Request:** `multipart/form-data` with `file` field

**Response:**

```json
{
  "screenshot": { ... },
  "both_uploaded": true
}
```

---

## Real-time Synchronization

### Hook: `useTransactionStatus`

Located at `src/hooks/useTransactionStatus.ts`

**Usage:**

```tsx
import { useTransactionStatus } from '@/hooks/useTransactionStatus';

function MyComponent({ transactionId }) {
  const { status, loading, error } = useTransactionStatus(transactionId);

  // status updates automatically via Realtime
  useEffect(() => {
    if (status?.is_ready_for_next_step) {
      // Navigate or update UI
    }
  }, [status]);
}
```

**How it works:**

1. Fetches initial status via API
2. Subscribes to Realtime changes on:
   - `transactions` table
   - `transaction_participants` table
3. Automatically refetches when changes detected
4. Cleans up subscription on unmount

---

## Frontend Integration

### Create Invitation Page

**File:** `src/components/transaction/invite/create-invitation-page.tsx`

**Key Features:**

- Automatically creates transaction on mount
- Displays shareable link
- Real-time status monitoring
- Auto-navigates when both users join

**Usage:**

```tsx
import { CreateTransactionPage } from '@/components/transaction/invite/create-invitation-page';

export default function TransactionNewPage() {
  return <CreateTransactionPage />;
}
```

### Accept Invitation Page

**File:** `src/components/transaction/invite/accept-invitation-page.tsx`

**Key Features:**

- Review invitation details
- Join transaction with API call
- Upload screenshot
- Real-time sync with creator

**Usage:**

```tsx
import { AcceptTransactionPage } from '@/components/transaction/invite/accept-invitation-page';

export default function TransactionInvitePage({ params }) {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');

  return <AcceptTransactionPage transactionId={transactionId} />;
}
```

---

## Testing the Flow

### Local Development Testing

**1. Start Development Server:**

```bash
bun run dev
```

**2. Test as User A (Creator):**

1. Navigate to `/transaction/new`
2. Transaction is automatically created
3. Copy the invitation link
4. Open in incognito window (or different browser)

**3. Test as User B (Invitee):**

1. Paste invitation link in incognito window
2. Sign in as different user
3. Click "Accept Invitation"
4. Observe: Both windows should navigate to upload screen

**4. Test Screenshot Upload:**

1. Upload screenshot in both windows
2. Observe: Both navigate to transaction details when complete

### Testing Checklist

- [ ] Transaction creation works
- [ ] Invitation link is generated correctly
- [ ] Second user can join via link
- [ ] Both users navigate automatically when both join
- [ ] Screenshot upload works
- [ ] Both users navigate when both upload
- [ ] Real-time updates work (test with network throttling)
- [ ] Error handling works (test with offline mode)

---

## Production Deployment

### Pre-deployment Checklist

- [ ] All migrations applied to production database
- [ ] Storage bucket created and configured
- [ ] RLS policies tested and verified
- [ ] Environment variables set correctly
- [ ] `NEXT_PUBLIC_BASE_URL` points to production domain
- [ ] Realtime enabled on required tables
- [ ] CORS configured for production domain

### Deployment Steps

**1. Build Application:**

```bash
bun run build
```

**2. Deploy to Hosting Platform:**

#### Vercel:

```bash
vercel --prod
```

#### Manual Deployment:

```bash
bun run build
bun run start
```

**3. Verify Environment Variables:**

Ensure all `NEXT_PUBLIC_*` variables are set in your hosting platform's dashboard.

**4. Test Production Flow:**

Use the same testing checklist as local development.

### Performance Optimization

**Database Indexes:**
Already created in migration for:

- `transactions.creator_id`
- `transactions.status`
- `transaction_participants.transaction_id`
- `transaction_participants.user_id`

**Realtime Optimization:**

- Only subscribe when component mounted
- Unsubscribe on unmount
- Use specific filters (`transaction_id=eq.uuid`)

---

## Troubleshooting

### Issue: "Transaction not found"

**Possible Causes:**

- Transaction ID invalid
- User doesn't have permission (RLS policy blocking)
- Transaction was deleted

**Solution:**

```sql
-- Check RLS policies
SELECT * FROM transactions WHERE id = 'uuid';  -- As authenticated user
```

### Issue: Real-time updates not working

**Possible Causes:**

- Realtime not enabled on tables
- User not authenticated
- Subscription filter incorrect

**Solution:**

1. Check Supabase Dashboard → Database → Replication
2. Verify authentication: `supabase.auth.getUser()`
3. Check browser console for Realtime connection errors

### Issue: Screenshot upload fails

**Possible Causes:**

- File too large (>10MB)
- Invalid file type
- Storage bucket not configured
- RLS policy blocking

**Solution:**

1. Check file size: Max 10MB
2. Verify file type: JPEG, PNG, WebP only
3. Check Storage RLS policies
4. Verify bucket name: `transaction-screenshots`

### Issue: Both users not navigating simultaneously

**Possible Causes:**

- Realtime lag
- Status not updating correctly
- `is_ready_for_next_step` logic incorrect

**Solution:**

```tsx
// Add debugging
useEffect(() => {
  console.log('Status:', status);
  console.log('Ready for next:', status?.is_ready_for_next_step);
  console.log('Transaction status:', status?.transaction.status);
}, [status]);
```

### Issue: "Failed to join transaction"

**Possible Causes:**

- Already a participant
- Transaction full (2 participants max)
- User is the creator

**Solution:**
Check API response for specific error message.

---

## Advanced Features

### Email Invitations

To send invitation emails, integrate with Resend or SendGrid:

```typescript
// In handleSendInvitation
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Transaction Invitation',
  html: `<p>You've been invited to a secure transaction.
         <a href="${transactionLink}">Click here to join</a></p>`,
});
```

### Webhook Notifications

Set up Supabase webhooks for transaction events:

1. Go to Supabase Dashboard → Database → Webhooks
2. Create webhook for `transactions` table
3. Trigger on `UPDATE` when status changes
4. Send to your API endpoint for processing

### Analytics

Track transaction flow metrics:

```typescript
// Add to each step
analytics.track('Transaction Created', { transactionId });
analytics.track('Invitation Accepted', { transactionId });
analytics.track('Screenshot Uploaded', { transactionId });
```

---

## Security Best Practices

1. **Always verify authentication** in API routes
2. **Use RLS policies** to restrict data access
3. **Validate file uploads** (size, type, content)
4. **Rate limit** invitation creation
5. **Sanitize user input** for transaction details
6. **Use HTTPS** in production
7. **Implement CSRF protection** for state-changing operations

---

## Support

For issues or questions:

- Check [Supabase Documentation](https://supabase.com/docs)
- Review [Next.js Documentation](https://nextjs.org/docs)
- Open an issue in the repository

---

**Last Updated:** 2025-10-20
**Version:** 1.0.0
