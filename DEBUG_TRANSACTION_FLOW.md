# Debug Guide: Transaction Creation Error

## Step 1: Check What Error You're Getting

Open the page `/transaction/invite` and check:

### In the Browser UI:

- What does the error card say?
  - [ ] "Authentication Required"
  - [ ] "Database Setup Required"
  - [ ] "Error Creating Transaction"

### In Browser Console (F12):

Look for the log message that starts with `Transaction creation failed:`

It should show:

```
Transaction creation failed: {
  status: NUMBER,
  statusText: "...",
  error: { ... }
}
```

**What is the status number?**

- `401` = Not signed in
- `500` = Server/database error
- Other = Something else

---

## Step 2: Verify You're Signed In

### Quick Check:

1. Open Browser DevTools (F12)
2. Go to Application tab → Cookies
3. Look for cookies from your domain
4. Do you see any auth-related cookies (like `sb-access-token` or similar)?

### OR Check via Code:

1. Navigate to `/home` or any authenticated page
2. Can you see your user profile/dashboard?
3. If redirected to `/sign-in`, you're NOT signed in

---

## Step 3: Sign In

If you're not signed in:

1. Navigate to `/sign-in`
2. Sign in with your Supabase credentials
3. After successful sign-in, try `/transaction/invite` again

---

## Step 4: Verify Database Tables Exist

If you get status `500`:

### In Supabase Dashboard:

1. Go to Table Editor
2. Check if these tables exist:
   - [ ] `transactions`
   - [ ] `transaction_participants`
   - [ ] `transaction_screenshots`

### If tables are missing:

1. Go to SQL Editor in Supabase
2. Copy ALL content from `supabase/migrations/001_create_transactions.sql`
3. Paste and run it
4. Copy ALL content from `supabase/migrations/002_create_storage_bucket.sql`
5. Paste and run it

---

## Step 5: Check Supabase Connection

If environment variables might be wrong:

### Verify in Supabase Dashboard:

1. Go to Project Settings → API
2. Compare these values with your `.env` file:
   - `NEXT_PUBLIC_SUPABASE_URL` should match "Project URL"
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` should match "anon public" key

### Update .env if needed:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**IMPORTANT:** Restart dev server after changing .env:

```bash
# Stop server (Ctrl+C)
bun run dev
```

---

## Step 6: Test API Directly

### Test if API is working at all:

Open a new terminal and run:

```bash
# Get your auth token first (from browser DevTools → Application → Cookies)
# Look for a cookie like 'sb-access-token' and copy its value

# Then test the API:
curl -X POST http://localhost:3000/api/transaction/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{}"
```

**Expected responses:**

- `{"error":"Unauthorized"}` → Auth token is wrong/expired
- `{"transaction": {...}}` → Success! API works
- Other error → Check the error message

---

## Common Issues & Solutions

### Issue: "Authentication Required" every time

**Solution:** Sign in at `/sign-in` first

### Issue: "Database Setup Required"

**Solution:** Run migrations in Supabase Dashboard

### Issue: Page just shows loading forever

**Solution:** Check browser console for errors

### Issue: "Failed to create transaction" with no details

**Solution:** Check the browser console for the detailed error log

### Issue: Works in one browser but not another

**Solution:** Sign in separately in each browser (sessions don't transfer)

---

## Still Not Working?

### Collect This Info:

1. **Error from console:**

   ```
   Transaction creation failed: { ... }
   ```

2. **Are you signed in?** Yes/No

3. **Do tables exist in Supabase?** Yes/No

4. **Environment variables set?** Yes/No

5. **Server restarted after env changes?** Yes/No

Then share this information for further help!

---

## Quick Test Command

Run this to verify your setup:

```bash
# Check env vars
echo "Checking environment..."
grep SUPABASE .env | sed 's/=.*/=***/'

# Check if server is running
curl -s http://localhost:3000 > /dev/null && echo "✓ Server running" || echo "✗ Server not running"

# Check if API responds
curl -s http://localhost:3000/api/transaction/create -X POST && echo ""
```

Expected output:

- Environment vars should show (with values hidden)
- Server should be running
- API should return an error (expected without auth)
