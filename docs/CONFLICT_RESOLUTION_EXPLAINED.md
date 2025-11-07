# Conflict Resolution: Last Write Wins Problem

## The Problem Explained

### Current Implementation (Last Write Wins)

Imagine this scenario with your current PartyKit code:

```
Time: 10:00:00.000 - Both users see empty field "productType"

Time: 10:00:00.100 - Alice clicks "iPhone 13"
                   - Alice's local state: productType = "iPhone 13"
                   - Alice sends: { field: "productType", value: "iPhone 13", timestamp: 100 }

Time: 10:00:00.150 - Bob clicks "iPhone 14 Pro"
                   - Bob's local state: productType = "iPhone 14 Pro"
                   - Bob sends: { field: "productType", value: "iPhone 14 Pro", timestamp: 150 }

Time: 10:00:00.200 - Alice receives Bob's message
                   - Alice's state changes: productType = "iPhone 14 Pro" ✅
                   - Alice sees Bob's selection

Time: 10:00:00.250 - Bob receives Alice's message
                   - Bob's state changes: productType = "iPhone 13" ❌
                   - Bob now sees a DIFFERENT value than Alice!
```

### What Just Happened?

**Network latency caused Alice and Bob to see different final states:**

- Alice sees: `productType = "iPhone 14 Pro"` (Bob's selection)
- Bob sees: `productType = "iPhone 13"` (Alice's selection)

This is called **"Last Write Wins"** - whoever's message arrives last overwrites the previous value, regardless of which one was actually selected first.

---

## Why This Happens in Your Code

### Current Implementation

```typescript
// use-shared-conflict-resolution.ts (lines 254-275)

const selectField = useCallback((field, value) => {
  const selection: SharedSelection = {
    field,
    value,
    userId,
    userName,
    timestamp: Date.now(),  // ⚠️ Timestamp is recorded...
  };

  // 1. Update local state immediately
  setSharedSelections((prev) => ({
    ...prev,
    [field]: selection,
  }));

  // 2. Broadcast to other participants
  socket.send(JSON.stringify({
    type: 'field_selected',
    selection,
  }));
}, [socket, userId, userName]);

// When message arrives from other user:
case 'field_selected':
  if (message.selection) {
    // 3. ALWAYS overwrite, no timestamp comparison! ❌
    setSharedSelections((prev) => ({
      ...prev,
      [message.selection!.field]: message.selection!,
    }));
  }
  break;
```

**The Problem:**

- ✅ Timestamps ARE recorded (`timestamp: Date.now()`)
- ❌ Timestamps are NEVER checked when receiving messages
- ❌ Always overwrites with incoming value (last write wins)

---

## Real-World Failure Scenarios

### Scenario 1: The Flickering Selection

```
Alice selects "Like New" → Bob selects "Good" → Network delays →
Alice sees: "Like New" → "Good" → "Like New" → "Good" (flickering!)
```

### Scenario 2: The Split Brain

```
Time 0: Empty field
Time 1: Alice clicks "Meetup" (network lag 500ms)
Time 2: Bob clicks "Delivery" (network lag 50ms)

Result:
- Alice sees: "Delivery" (Bob won)
- Bob sees: "Meetup" (Alice won)
- They proceed with DIFFERENT transaction types! 🚨
```

### Scenario 3: The Race Condition

```
Two users rapidly clicking different values:
User A: iPhone 13 → iPhone 14 → iPhone 15
User B: iPhone 14 Pro → iPhone 15 Pro

Final state depends entirely on network speed, not selection order!
```

---

## Solution 1: Timestamp-Based Conflict Resolution

### How It Works

```typescript
// When receiving a message, compare timestamps
case 'field_selected':
  if (message.selection) {
    setSharedSelections((prev) => {
      const existing = prev[message.selection!.field];

      // Only update if incoming message is newer
      if (!existing || message.selection!.timestamp > existing.timestamp) {
        return {
          ...prev,
          [message.selection!.field]: message.selection!,
        };
      }

      // Ignore older messages
      return prev;
    });
  }
  break;
```

### Example Timeline (With Fix)

```
Time: 10:00:00.100 - Alice clicks "iPhone 13" (timestamp: 100)
Time: 10:00:00.150 - Bob clicks "iPhone 14 Pro" (timestamp: 150)

Time: 10:00:00.200 - Alice receives Bob's message (timestamp: 150)
                   - Compares: 150 > 100 ✅
                   - Alice updates to: "iPhone 14 Pro"

Time: 10:00:00.250 - Bob receives Alice's message (timestamp: 100)
                   - Compares: 100 < 150 ❌
                   - Bob IGNORES Alice's message
                   - Bob keeps: "iPhone 14 Pro"

✅ Both users now see the same value!
```

---

## Solution 2: CRDT (Conflict-free Replicated Data Type)

### What is a CRDT?

A **CRDT** is a data structure that mathematically guarantees eventual consistency, even with:

- Network partitions
- Out-of-order messages
- Concurrent edits

### LWW-Register (Last-Write-Wins Register)

The simplest CRDT for your use case:

```typescript
interface LWWRegister<T> {
  value: T;
  timestamp: number;
  actorId: string; // userId for tie-breaking
}

function merge(local: LWWRegister<T>, remote: LWWRegister<T>): LWWRegister<T> {
  // Rule 1: Higher timestamp wins
  if (remote.timestamp > local.timestamp) {
    return remote;
  }

  // Rule 2: If timestamps equal, higher actorId wins (deterministic tie-breaking)
  if (remote.timestamp === local.timestamp) {
    return remote.actorId > local.actorId ? remote : local;
  }

  // Rule 3: Keep local value (it's newer)
  return local;
}
```

### Implementation for Your Hook

```typescript
interface CRDTSelection {
  field: keyof AnalysisData;
  value: unknown;
  timestamp: number;
  userId: string;
  userName: string;
}

// Updated message handler
case 'field_selected':
  if (message.selection) {
    setSharedSelections((prev) => {
      const existing = prev[message.selection!.field];
      const incoming = message.selection!;

      // CRDT merge logic
      const merged = mergeLWW(existing, incoming);

      return {
        ...prev,
        [message.selection!.field]: merged,
      };
    });
  }
  break;

function mergeLWW(
  local: CRDTSelection | undefined,
  remote: CRDTSelection
): CRDTSelection {
  if (!local) return remote;

  // Higher timestamp wins
  if (remote.timestamp > local.timestamp) return remote;
  if (remote.timestamp < local.timestamp) return local;

  // Tie-breaking: higher userId wins (deterministic)
  return remote.userId > local.userId ? remote : local;
}
```

---

## Solution 3: Server as Source of Truth

The **most reliable** approach: let the server decide order.

### Current Architecture (Peer-to-Peer)

```
Alice ──────────────────> Bob
  │                        │
  └─> PartyKit Server ────┘
      (just broadcasts)
```

### Improved Architecture (Server Authoritative)

```
Alice ──> PartyKit Server ──> Bob
          │
          ├─> Assigns sequence number
          ├─> Stores authoritative state
          └─> Broadcasts with ordering
```

### Server Implementation

```typescript
// party/collaboration.ts
export default class CollaborationServer implements Party.Server {
  private sharedSelections: Map<string, SelectionWithSequence> = new Map();
  private sequenceCounter = 0;

  onMessage(message: string, sender: Party.Connection) {
    const parsed = JSON.parse(message);

    if (parsed.type === 'field_selected') {
      const { field, value, userId, userName } = parsed.selection;

      // Server assigns authoritative sequence number
      const selection = {
        field,
        value,
        userId,
        userName,
        timestamp: Date.now(),
        sequence: ++this.sequenceCounter, // ✅ Server-side ordering
      };

      // Store server-side
      this.sharedSelections.set(field, selection);

      // Broadcast with sequence number
      this.room.broadcast(
        JSON.stringify({
          type: 'field_selected',
          selection,
        })
      );
    }
  }
}
```

### Client Updates

```typescript
case 'field_selected':
  if (message.selection) {
    setSharedSelections((prev) => {
      const existing = prev[message.selection!.field];

      // Compare server-assigned sequence numbers
      if (!existing || message.selection!.sequence > existing.sequence) {
        return {
          ...prev,
          [message.selection!.field]: message.selection!,
        };
      }

      return prev;
    });
  }
  break;
```

---

## Comparison Table

| Approach                      | Pros                   | Cons                            | Complexity |
| ----------------------------- | ---------------------- | ------------------------------- | ---------- |
| **Current (Last Write Wins)** | Simple                 | ❌ Inconsistent state           | Low        |
| **Timestamp Comparison**      | Easy to implement      | ⚠️ Requires synchronized clocks | Low        |
| **CRDT (LWW-Register)**       | Guaranteed consistency | Requires tie-breaking logic     | Medium     |
| **Server Authoritative**      | Most reliable          | Adds latency, server complexity | High       |

---

## Recommended Fix for Sabot

### Quick Fix (5 minutes)

Add timestamp comparison:

```typescript
// In use-shared-conflict-resolution.ts
case 'field_selected':
  if (message.selection) {
    setSharedSelections((prev) => {
      const existing = prev[message.selection!.field];

      // ✅ Only update if newer timestamp
      if (!existing || message.selection!.timestamp > existing.timestamp) {
        return {
          ...prev,
          [message.selection!.field]: message.selection!,
        };
      }

      // Ignore older selections
      console.log('[ConflictResolution] Ignoring older selection:', {
        field: message.selection!.field,
        existing: existing.timestamp,
        incoming: message.selection!.timestamp,
      });
      return prev;
    });
  }
  break;
```

### Better Fix (30 minutes)

Add CRDT with tie-breaking:

```typescript
function mergeLWW(local: SharedSelection | undefined, remote: SharedSelection): SharedSelection {
  if (!local) return remote;

  // Higher timestamp wins
  if (remote.timestamp > local.timestamp) return remote;
  if (remote.timestamp < local.timestamp) return local;

  // Tie-breaking: higher userId wins (consistent across all clients)
  return remote.userId > local.userId ? remote : local;
}

case 'field_selected':
  if (message.selection) {
    setSharedSelections((prev) => ({
      ...prev,
      [message.selection!.field]: mergeLWW(
        prev[message.selection!.field],
        message.selection!
      ),
    }));
  }
  break;
```

### Best Fix (2 hours)

Implement server-side sequence numbers (see Solution 3 above).

---

## Testing the Fix

### Test Case 1: Simultaneous Selections

```typescript
// Simulate two users clicking at same time
const alice = { userId: 'alice', timestamp: 1000 };
const bob = { userId: 'bob', timestamp: 1000 };

// Without fix: Whoever's message arrives last wins (random)
// With fix: userId tie-breaking ensures consistent result
```

### Test Case 2: Network Delay

```typescript
// Alice clicks first, but message arrives late
const alice = { userId: 'alice', timestamp: 100 };
const bob = { userId: 'bob', timestamp: 200 };

// Without fix: If Alice's message arrives last, it wins (wrong!)
// With fix: Bob's higher timestamp wins (correct!)
```

### Test Case 3: Clock Skew

```typescript
// Alice's clock is 5 seconds ahead
const alice = { userId: 'alice', timestamp: 6000 };
const bob = { userId: 'bob', timestamp: 1000 };

// Timestamp comparison: Alice always wins (problematic with clock skew)
// CRDT with tie-breaking: Still works correctly
// Server sequence: Best solution (immune to clock skew)
```

---

## Summary

**Your Current Code:**

```typescript
// ❌ Always overwrites (last network message wins)
setSharedSelections((prev) => ({
  ...prev,
  [field]: incomingSelection, // No validation!
}));
```

**Fixed Code:**

```typescript
// ✅ Only updates if logically newer
setSharedSelections((prev) => {
  const existing = prev[field];
  if (!existing || shouldUpdate(existing, incomingSelection)) {
    return { ...prev, [field]: incomingSelection };
  }
  return prev; // Ignore older data
});
```

**The key insight:** Network speed shouldn't determine the final state—logical ordering (timestamps/sequence numbers) should.
