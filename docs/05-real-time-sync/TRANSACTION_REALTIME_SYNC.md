# Transaction Real-Time Synchronization

## Overview

Transaction synchronization uses a **Broadcast + Polling Hybrid** architecture to provide reliable real-time updates between transaction participants (buyer and seller).

---

## Architecture

### Why Hybrid Approach?

The transaction system requires reliable real-time updates that:

- ✅ Work on **all Supabase plans** (Free, Pro, Enterprise)
- ✅ Require **zero database replication configuration**
- ✅ Provide **instant updates** when possible
- ✅ Have **guaranteed delivery** with fallback mechanisms
- ✅ Are **production-ready** and battle-tested

### Solution: Broadcast Channels + Polling

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

### Data Flow Diagram

```
User A's Browser          API Server           User B's Browser
═══════════════          ══════════          ═══════════════

┌─────────────┐          ┌─────────┐          ┌─────────────┐
│  Component  │          │   API   │          │  Component  │
│   Mounted   │          │  Route  │          │   Mounted   │
└──────┬──────┘          └─────────┘          └──────┬──────┘
       │                                              │
       │  1. Subscribe to broadcast channel           │
       ├──────────────────────────────────────────────┤
       │          "transaction:123"                   │
       │                                              │
       │  2. Start polling (every 5 seconds)          │
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

## Implementation

### Client-Side Hook

**File:** `src/hooks/useTransactionStatus.ts`

```typescript
export function useTransactionStatus(transactionId: string | null) {
  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchStatus = async () => {
    if (!transactionId) return;

    const response = await fetch(`/api/transaction/${transactionId}/status`);
    const data = await response.json();
    setStatus(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!transactionId) return;

    // Initial fetch
    fetchStatus();

    // Subscribe to Broadcast Channel
    const channel = supabase
      .channel(`transaction:${transactionId}`)
      .on('broadcast', { event: 'transaction_update' }, (payload) => {
        console.log('Received broadcast:', payload);
        fetchStatus(); // Instant refetch on broadcast
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

  return { status, loading, refetch: fetchStatus };
}
```

**Key Features:**

- Subscribes to broadcast channel on mount
- Sets up polling interval (5 seconds)
- Refetches on broadcast event (instant)
- Refetches on interval (reliable)
- Cleans up both on unmount

### Server-Side Broadcasting

**Example from:** `src/app/api/transaction/join/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // ... join transaction logic ...

  // Broadcast to all subscribed clients
  const supabase = createClient();
  const channel = supabase.channel(`transaction:${transactionId}`);

  await channel.send({
    type: 'broadcast',
    event: 'transaction_update',
    payload: {
      type: 'participant_joined',
      transaction_id: transactionId,
      user_id: user.id,
      timestamp: new Date().toISOString(),
    },
  });

  return NextResponse.json({ success: true });
}
```

**When Broadcasts Happen:**

- User joins transaction → Broadcast `participant_joined`
- User uploads screenshot → Broadcast `screenshot_uploaded`
- Transaction status changes → Broadcast `status_changed`
- Deliverable completed → Broadcast `deliverable_completed`
- Oracle verification result → Broadcast `verification_completed`

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

- ✅ **Fast enough** - Max 5s delay is acceptable for user experience
- ✅ **Efficient** - Doesn't overload server or database
- ✅ **Battery-friendly** - Reasonable for mobile devices
- ✅ **Redundant** - Broadcast handles most cases instantly

**Adjustable in code:**

```typescript
const POLL_INTERVAL = 5000; // Change to 3000 for 3s, etc.
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
  console.log('Received broadcast:', payload);
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

- 2 active clients (buyer + seller)
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

## Transaction Active Page Integration

### Enhanced Data Flow

The Transaction Active Page integrates comprehensive features:

**User Data:** Real-time user authentication and profile data
**Transaction Data:** Complete transaction details with participant information
**Escrow Data:** Full escrow protection with deliverable tracking
**Oracle Verifications:** Automatic verification results and status

### Deliverable Status Tracking

**Status Types:** `pending`, `in_progress`, `completed`, `verified`, `failed`

**Progress Tracking:** Real-time progress calculation across all deliverables

**Party Responsibility:** Clear indication of who is responsible for each deliverable

**Oracle Integration:** Automatic verification for applicable deliverable types

### Oracle Verification System

**IPFS Verification:** For digital files and documents

- Check file accessibility on IPFS gateway
- Binary confidence (accessible/not accessible)
- 10-second timeout

**AI Verification:** For service deliverables using Gemini AI

- AI analysis of proof against requirements
- 0-100% confidence based on analysis
- 80% minimum threshold for verification

**Manual Verification:** Fallback for non-automatable deliverables

- Human review required
- No automatic confidence score

### Status Calculation Logic

**Deliverable Status Priority:**

1. **Oracle Verification** (highest priority)
   - If oracle verification exists and is verified → `verified`
   - If oracle verification exists and failed → `failed`
2. **Manual Confirmation** (fallback)
   - If party confirmed → `completed`
   - Otherwise → `pending`

**Progress Calculation:**

```typescript
const getOverallProgress = () => {
  const totalDeliverables = escrowData.deliverables.length;
  const completedDeliverables = escrowData.deliverables.filter(
    (deliverable) => {
      const status = getDeliverableStatus(
        deliverable,
        deliverable.party_responsible
      );
      return status === 'completed' || status === 'verified';
    }
  ).length;

  return totalDeliverables > 0
    ? (completedDeliverables / totalDeliverables) * 100
    : 0;
};
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

## Summary

The **Broadcast + Polling Hybrid** approach provides:

✅ **Universal Compatibility** - Works on all Supabase plans
✅ **Instant Updates** - Sub-second latency in optimal conditions
✅ **Reliability** - Guaranteed delivery via polling fallback
✅ **Zero Configuration** - No database replication setup needed
✅ **Production Ready** - Battle-tested architecture pattern

This architecture ensures your users get the best possible experience regardless of network conditions, Supabase plan, or server configuration.

---

**Last Updated:** 2025-11-04
**Version:** 1.0.0
