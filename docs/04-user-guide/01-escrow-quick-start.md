# Escrow Feature - Quick Start Guide

Get the Escrow feature up and running in minutes.

## Prerequisites

- Node.js 18+ and Bun installed
- Supabase project configured
- Sabot app running locally or deployed

## Installation Steps

### 1. Install Dependencies

```bash
cd sabot
bun install
```

This will install the new `date-fns` dependency needed for the escrow feature.

### 2. Run Database Migration

Apply the escrow schema to your Supabase database:

```bash
# Using Supabase CLI
supabase db push

# Or apply the migration directly in Supabase Dashboard
# Copy contents of: supabase/migrations/008_create_escrow_tables.sql
# Paste into SQL Editor and execute
```

### 3. Verify Tables Created

Check your Supabase database for these new tables:

- ✅ `escrows`
- ✅ `escrow_events`
- ✅ `escrow_evidence`

### 4. Verify Storage Bucket

Ensure the storage bucket `escrow-evidence` was created:

- Go to Supabase Dashboard → Storage
- Look for `escrow-evidence` bucket
- Check that policies are in place

### 5. Start Development Server

```bash
bun run dev
```

The app should start on `http://localhost:3000`

## Testing the Feature

### Test 1: Create an Escrow

1. **Login** to Sabot
2. **Navigate** to home page
3. **Click** "Create" button in hero section
4. **Select** "Escrow" from dropdown
5. **Fill** the form:
   ```
   Type: Item
   Title: Test Laptop Sale
   Description: Testing escrow feature
   Deliverable: Laptop in good condition
   Amount: 500
   Currency: USD
   ```
6. **Submit** the form
7. **Verify** you're redirected to escrow detail page

✅ **Expected Result**: Escrow created with status "Pending"

### Test 2: Share Escrow Link

1. **Copy** the escrow link from the detail page
2. **Open** an incognito window
3. **Login** with a different user
4. **Paste** the escrow link
5. **Click** "Join Escrow" button

✅ **Expected Result**: Second user joins, status changes to "Active"

### Test 3: Confirm Completion

1. **As User 1**: Click "Confirm Completion"
2. **Add** optional notes
3. **Submit** confirmation

✅ **Expected Result**: Status changes to "Awaiting Confirmation"

4. **As User 2**: Click "Confirm Completion"
5. **Submit** confirmation

✅ **Expected Result**: Status changes to "Completed"

### Test 4: Request Arbiter

1. **Create** a new escrow
2. **Both users** join
3. **One user** clicks "Request Arbiter"
4. **Select** dispute reason
5. **Enter** detailed explanation
6. **Submit** request

✅ **Expected Result**: Status changes to "Disputed", arbiter requested

## API Testing

### Using curl

**Create Escrow**:

```bash
curl -X POST http://localhost:3000/api/escrow/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "item",
    "title": "Test Escrow",
    "deliverable_description": "Testing API",
    "amount": 100
  }'
```

**Get Escrow Status**:

```bash
curl http://localhost:3000/api/escrow/[ESCROW_ID]/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Confirm Completion**:

```bash
curl -X POST http://localhost:3000/api/escrow/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "escrow_id": "ESCROW_ID",
    "confirmation_notes": "Received in good condition"
  }'
```

## Common Routes

| Route          | Description                   |
| -------------- | ----------------------------- |
| `/escrow/new`  | Create new escrow             |
| `/escrow/[id]` | View escrow details           |
| `/home`        | Home page (has Create button) |

## Component Usage

### Basic Integration

```tsx
import { EnableEscrowButton } from '@/components/escrow/enable-escrow-button';

export default function MyPage() {
  return (
    <div>
      <h1>My Transaction</h1>
      <EnableEscrowButton transactionId="tx-123" />
    </div>
  );
}
```

### Advanced Integration

```tsx
import {
  EscrowDetailsCard,
  EscrowTimeline,
  EscrowStatusBadge,
} from '@/components/escrow';

export default function EscrowDetailPage({ escrow, events }) {
  return (
    <div className="space-y-6">
      <EscrowStatusBadge status={escrow.status} />
      <EscrowDetailsCard escrow={escrow} />
      <EscrowTimeline events={events} />
    </div>
  );
}
```

## Troubleshooting

### Issue: Database migration fails

**Solution**:

```bash
# Check migration status
supabase migration list

# If needed, reset and retry
supabase db reset
supabase db push
```

### Issue: "Unauthorized" errors

**Solution**:

- Ensure user is logged in
- Check Supabase session is valid
- Verify RLS policies are applied

### Issue: Components not rendering

**Solution**:

```bash
# Clear cache and rebuild
rm -rf .next
bun run build
bun run dev
```

### Issue: TypeScript errors

**Solution**:

```bash
# Ensure all types are available
bun install
# Restart TypeScript server in your IDE
```

## Development Tips

### 1. Enable Debug Logging

Add to your `.env`:

```bash
NEXT_PUBLIC_DEBUG=true
```

### 2. Check Database Logs

In Supabase Dashboard:

- Go to Database → Logs
- Filter by table name: `escrows`
- Check for errors

### 3. Use Browser DevTools

- Network tab: Monitor API calls
- Console: Check for errors
- React DevTools: Inspect component state

### 4. Test with Mock Data

Create test escrows with different statuses:

```sql
-- In Supabase SQL Editor
INSERT INTO escrows (
  initiator_id, type, title,
  deliverable_description, status
) VALUES (
  auth.uid(), 'item', 'Test Escrow',
  'Test deliverable', 'active'
);
```

## Next Steps

1. ✅ **Read Full Documentation**: See `docs/ESCROW_FEATURE.md`
2. ✅ **Explore Components**: See `src/components/escrow/README.md`
3. ✅ **Review Implementation**: See `ESCROW_IMPLEMENTATION_SUMMARY.md`
4. 📝 **Write Tests**: Add unit and integration tests
5. 🚀 **Deploy**: Push to production after testing

## Resources

- **Main Documentation**: [ESCROW_FEATURE.md](./ESCROW_FEATURE.md)
- **Component Docs**: [Component README](../src/components/escrow/README.md)
- **Implementation Summary**: [Summary](../ESCROW_IMPLEMENTATION_SUMMARY.md)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

## Support

Need help?

- 📧 Email: dev@sabot.app
- 💬 GitHub Issues
- 📖 Check documentation first

---

**Ready to go!** 🚀

Create your first escrow at: `http://localhost:3000/escrow/new`
