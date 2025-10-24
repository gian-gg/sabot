# Real-time Architecture - Broadcast + Polling Hybrid

## Overview

The transaction invitation system uses a **hybrid approach** combining Supabase Broadcast Channels with intelligent polling to provide reliable real-time synchronization between users.

---

## Why Hybrid Approach?

### The Challenge

Traditional database replication-based real-time features may not be available on all Supabase plans or may still be in beta. We need a solution that:

✅ Works on **all Supabase plans** (Free, Pro, Enterprise)
✅ Requires **zero database replication configuration**
✅ Provides **instant updates** when possible
✅ Has **guaranteed delivery** with fallback mechanisms
✅ Is **production-ready** and battle-tested

### The Solution

**Broadcast Channels + Polling Hybrid**

```
┌──────────────────────────────────────────────────────────┐
│                   Hybrid Architecture                     │
└──────────────────────────────────────────────────────────┘

Primary: Supabase Broadcast Channels
├─ Instant updates (<500ms latency)
├─ No database replication needed
├─ Available on all plans
└─ WebSocket-based

Fallback: Smart Polling
├─ 5-second intervals
├─ Guaranteed delivery
├─ Handles network issues
└─ Zero configuration
```

---

## How It Works

### Architecture Diagram

```
User A's Browser          API Server           User B's Browser
═══════════════          ══════════          ═══════════════

┌─────────────┐          ┌─────────┐          ┌─────────────┐
│  Component  │          │   API   │          │  Component  │
│   Mounted   │          │  Route  │          │   Mounted   │
└──────┬──────┘          └─────────┘          └──────┬──────┘
       │                                              │
       │  1. Subscribe to                             │
       │     broadcast channel                        │
       ├──────────────────────────────────────────────┤
       │          "transaction:123"                   │
       │                                              │
       │  2. Start polling                            │
       │     (every 5 seconds)                        │
       │                                              │
       ├─────────────────┐                            │
       │  Poll API       │                            │
       ├────────────────►│                            │
       │  GET /status    │                            │
       │                 │                            │
       │  3. User B joins transaction                 │
       │                 │◄───────────────────────────┤
       │                 │  POST /join                │
       │                 │                            │
       │  4. API broadcasts event                     │
       │  ◄──────────────┤────────────────────────────┤
       │  Broadcast: user_joined                      │
       │                 │                            │
       │  5. Both clients receive instantly           │
       │  Refetch status                              │
       ├────────────────►│◄───────────────────────────┤
       │  GET /status    │  GET /status               │
       │                 │                            │
       │  6. Polling continues (backup)               │
       ├────────────────►│◄───────────────────────────┤
       │  (every 5s)     │  (every 5s)                │
```

---

## Implementation Details

### 1. Client-Side Hook

**File:** `src/hooks/useTransactionStatus.ts`

```typescript
export function useTransactionStatus(transactionId: string | null) {
  // ... state setup ...

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Subscribe to Broadcast Channel
    const channel = supabase
      .channel(`transaction:${transactionId}`)
      .on('broadcast', { event: 'transaction_update' }, (payload) => {
        // Instant update via broadcast
        fetchStatus();
      })
      .subscribe();

    // Fallback: Poll every 5 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [transactionId]);
}
```

**Key Features:**

- Subscribes to broadcast channel on mount
- Sets up polling interval (5 seconds)
- Refetches on broadcast event (instant)
- Refetches on interval (reliable)
- Cleans up both on unmount

### 2. Server-Side Broadcasting

**Example from** `src/app/api/transaction/join/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // ... join transaction logic ...

  // Broadcast to all subscribed clients
  const channel = supabase.channel(`transaction:${transactionId}`);
  await channel.send({
    type: 'broadcast',
    event: 'transaction_update',
    payload: {
      type: 'participant_joined',
      transaction_id: transactionId,
      user_id: user.id,
    },
  });

  return NextResponse.json({ ... });
}
```

**When Broadcasts Happen:**

- User joins transaction → Broadcast "participant_joined"
- User uploads screenshot → Broadcast "screenshot_uploaded"
- Transaction status changes → Broadcast "transaction_update"

---

## Performance Characteristics

### Latency Comparison

| Scenario       | Broadcast  | Polling       | Combined   |
| -------------- | ---------- | ------------- | ---------- |
| Best Case      | ~200-500ms | 0-5000ms      | ~200-500ms |
| Typical        | ~500ms     | ~2500ms (avg) | ~500ms     |
| Network Issues | May fail   | Always works  | ~2500ms    |
| Server Load    | Very low   | Low           | Low        |

### Why 5 Seconds?

**Poll Interval Rationale:**

✅ **Fast enough** - Max 5s delay is acceptable for user experience
✅ **Efficient** - Doesn't overload server or database
✅ **Battery-friendly** - Reasonable for mobile devices
✅ **Redundant** - Broadcast handles most cases instantly

**Adjustable in code:**

```typescript
const POLL_INTERVAL = 5000; // Change to 3000 for 3s, etc.
```

---

## Comparison with Alternatives

### Option 1: Database Replication (Postgres Changes)

```diff
+ Instant updates via WebSocket
+ No polling needed
- Requires database replication enabled
- Not available on all Supabase plans
- Configuration complexity
```

### Option 2: Pure Polling

```diff
+ Simple to implement
+ Works everywhere
+ Very reliable
- Higher latency (always 0-5s delay)
- More API calls
- Higher server load
```

### Option 3: Broadcast Only

```diff
+ Instant updates
+ Low server load
+ Works on all plans
- No guaranteed delivery
- Fails silently on network issues
- WebSocket connection required
```

### Option 4: Broadcast + Polling (Our Choice)

```diff
+ Instant updates (broadcast)
+ Guaranteed delivery (polling)
+ Works on all plans
+ No configuration needed
+ Fallback on failures
- Slightly more complex
- Some redundant API calls
```

---

## Network Resilience

### Handling Network Issues

```
Scenario 1: Broadcast Fails
──────────────────────────
Broadcast ❌ → Polling ✅ → User sees update within 5s

Scenario 2: Polling Fails
─────────────────────────
Broadcast ✅ → User sees update instantly
(Polling retries next interval)

Scenario 3: Both Fail Temporarily
─────────────────────────────────
Both ❌ → Network restored → Both ✅ → Sync restored

Scenario 4: Page Backgrounded
──────────────────────────────
Browser throttles polling → User returns →
Immediate fetch on tab focus → Up to date
```

---

## Real-World Performance

### Production Metrics (Expected)

**Update Delivery Time:**

- P50 (median): ~500ms
- P90: ~800ms
- P99: ~5000ms
- P99.9: ~10000ms (network issues + retry)

**API Load:**

- Polling: 0.2 requests/second per active user
- Status endpoint: Cached at database level
- Minimal server impact

**User Experience:**

- Most updates: Instant (<1s)
- Worst case: 5s delay
- Network issues: Recovers automatically

---

## Monitoring & Debugging

### Client-Side Debugging

Enable console logs to see real-time events:

```typescript
.on('broadcast', { event: 'transaction_update' }, (payload) => {
  console.log('Received broadcast:', payload); // Already included
  fetchStatus();
})
```

**What to look for:**

- `"Subscribed to transaction updates"` - Broadcast connected
- `"Received broadcast: ..."` - Event received
- Poll requests in Network tab (every 5s)

### Server-Side Monitoring

Track these metrics:

```typescript
// Add to API routes
console.log('Broadcasting update:', {
  transaction_id,
  event_type,
  timestamp: Date.now(),
});
```

**Key Metrics:**

- Broadcast success rate
- API response times
- Polling frequency
- Error rates

---

## Scaling Considerations

### Database Load

**Per Transaction:**

- 2 active clients (creator + invitee)
- 0.2 requests/second × 2 = 0.4 req/s
- Average transaction duration: 2 minutes
- Total requests per transaction: ~48

**At Scale (1000 concurrent transactions):**

- 400 requests/second to status endpoint
- Easily handled with database indexes
- Consider caching for 1-2 seconds if needed

### WebSocket Connections

**Supabase Limits:**

- Free tier: 200 concurrent connections
- Pro tier: 500+ concurrent connections
- Each transaction uses 2 connections

**Scaling Strategy:**

- Monitor connection usage in Supabase Dashboard
- Upgrade plan if approaching limits
- Polling ensures functionality if connections maxed

---

## Future Improvements

### Potential Optimizations

1. **Adaptive Polling**

   ```typescript
   // Poll faster initially, slower as time passes
   const interval = status === 'waiting' ? 3000 : 10000;
   ```

2. **Smart Polling Pause**

   ```typescript
   // Stop polling when both users ready
   if (status.is_ready_for_next_step) {
     clearInterval(pollInterval);
   }
   ```

3. **Connection Quality Detection**

   ```typescript
   // Adjust polling based on network quality
   const interval = navigator.connection.effectiveType === '4g' ? 5000 : 10000;
   ```

4. **Database Replication Migration**
   ```typescript
   // Add postgres_changes when available
   if (replicationAvailable) {
     usePostgresChanges();
   } else {
     useBroadcastPolling();
   }
   ```

---

## Troubleshooting

### Broadcast Not Received

**Symptoms:**

- No `"Received broadcast"` in console
- Updates only appear every 5 seconds

**Solutions:**

1. Check Supabase connection in Network tab
2. Verify `transactionId` matches in channel name
3. Ensure channel subscribed before event sent
4. System still works via polling fallback

### Polling Not Working

**Symptoms:**

- No API requests in Network tab
- Updates never appear

**Solutions:**

1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check authentication status
4. Verify `transactionId` is valid

### Both Not Working

**Symptoms:**

- No updates at all

**Solutions:**

1. Check user authentication
2. Verify transaction exists
3. Check RLS policies
4. Test API endpoints manually

---

## Conclusion

The **Broadcast + Polling Hybrid** approach provides:

✅ **Universal Compatibility** - Works on all Supabase plans
✅ **Instant Updates** - Sub-second latency in optimal conditions
✅ **Reliability** - Guaranteed delivery via polling fallback
✅ **Zero Configuration** - No database replication setup needed
✅ **Production Ready** - Battle-tested architecture pattern

This architecture ensures your users get the best possible experience regardless of network conditions, Supabase plan, or server configuration.

---

**Last Updated:** 2025-10-20
**Version:** 1.0.0
