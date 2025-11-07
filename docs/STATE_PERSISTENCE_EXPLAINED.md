# Missing State Persistence Problem Explained

## The Problem

When a new user joins a conflict resolution session that's already in progress, they **don't receive the selections** that were already made. This causes inconsistent state between users.

---

## Current Flow (Broken)

### Scenario: Alice and Bob Already Started, Carol Joins Late

```
Time: 10:00 - Alice joins room
             - Selects: productType = "iPhone 13"
             - Selects: condition = "Like New"
             - Selects: price = "45000"

Time: 10:05 - Bob joins room
             - Receives Alice's selections via broadcast
             - Bob sees: productType = "iPhone 13", condition = "Like New", price = "45000"
             - Bob selects: quantity = "1"

Time: 10:10 - Carol joins room
             - ❌ Server has NO stored state
             - ❌ Carol sees EMPTY form
             - Carol doesn't know Alice/Bob already selected values!
```

---

## What the Client TRIES to Do

### Client Code (use-shared-conflict-resolution.ts, lines 226-241)

```typescript
const socket = usePartySocket({
  host,
  party: 'collaboration',
  room: `conflict-resolution:${transactionId}`,
  onOpen() {
    console.log('[ConflictResolution] Connected to PartyKit');
    setIsConnected(true);

    // Announce presence
    socket.send(
      JSON.stringify({
        type: 'user_joined',
        userId,
        userName,
      })
    );

    // ✅ Request current state sync
    socket.send(
      JSON.stringify({
        type: 'sync_request', // ← Client asks for state
      })
    );
  },
});
```

**What the client expects:**

1. Send `sync_request` message to server
2. Server responds with `sync_response` containing all current selections
3. Client applies the state and is now in sync

---

## What the Server ACTUALLY Does

### Server Code (party/collaboration.ts)

```typescript
onMessage(message: string, sender: Party.Connection) {
  // Broadcast custom messages (for conflict resolution)
  if (this.room.id.startsWith('conflict-resolution:')) {
    console.log(`[PartyKit] Broadcasting message in ${this.room.id}:`, message);

    try {
      const parsed = JSON.parse(message);

      // Store userId when they join
      if (parsed.type === 'user_joined' && parsed.userId && parsed.userName) {
        connectionUserMap.set(sender.id, {
          userId: parsed.userId,
          userName: parsed.userName,
        });
      }
    } catch (_e) {
      // Ignore parse errors
    }

    // ❌ Just broadcasts the message, doesn't handle sync_request!
    this.room.broadcast(message, [sender.id]);
  }
}
```

**What actually happens:**

1. Client sends `sync_request`
2. Server broadcasts `sync_request` to other clients (useless!)
3. **Server never responds with state**
4. Client waits forever and remains out of sync

---

## Visual Comparison

### What Happens Now (Broken)

```
Carol connects
    │
    ├─> Sends: { type: "user_joined", userId: "carol" }
    │   Server: Broadcasts to Alice & Bob
    │
    └─> Sends: { type: "sync_request" }
        Server: Broadcasts to Alice & Bob (does nothing!)

Carol's state: {}  ← EMPTY!
Alice's state: { productType: "iPhone 13", condition: "Like New", price: "45000" }
Bob's state:   { productType: "iPhone 13", condition: "Like New", price: "45000", quantity: "1" }

❌ Three users have DIFFERENT states!
```

### What Should Happen (Fixed)

```
Carol connects
    │
    ├─> Sends: { type: "user_joined", userId: "carol" }
    │   Server: Broadcasts to Alice & Bob
    │
    └─> Sends: { type: "sync_request" }
        Server: Responds directly to Carol with:
        {
          type: "sync_response",
          selections: {
            productType: { value: "iPhone 13", userId: "alice", timestamp: 1000 },
            condition: { value: "Like New", userId: "alice", timestamp: 2000 },
            price: { value: "45000", userId: "alice", timestamp: 3000 },
            quantity: { value: "1", userId: "bob", timestamp: 4000 }
          }
        }

Carol's state: { productType: "iPhone 13", condition: "Like New", price: "45000", quantity: "1" }
Alice's state: { productType: "iPhone 13", condition: "Like New", price: "45000", quantity: "1" }
Bob's state:   { productType: "iPhone 13", condition: "Like New", price: "45000", quantity: "1" }

✅ All users have SAME state!
```

---

## Why This is Critical

### Problem 1: Late Joiners See Nothing

```
Alice & Bob spend 5 minutes resolving conflicts.
Carol joins and sees empty form.
Carol makes selections that conflict with Alice/Bob.
Everyone is confused!
```

### Problem 2: Page Refresh Loses Everything

```
Alice selects 10 fields.
Alice accidentally refreshes browser.
Alice rejoins → all selections are GONE.
Alice has to redo all selections!
```

### Problem 3: Network Glitches Cause Desyncs

```
Bob has poor internet, disconnects briefly.
Bob reconnects → loses all state.
Bob is now working with stale/missing data.
```

---

## The Fix

### Step 1: Server Stores State

```typescript
// party/collaboration.ts
export default class CollaborationServer implements Party.Server {
  // ✅ Add state storage
  private sharedSelections: Map<string, SharedSelection> = new Map();
  private participants: Map<string, Participant> = new Map();

  constructor(readonly room: Party.Room) {}

  onMessage(message: string, sender: Party.Connection) {
    if (this.room.id.startsWith('conflict-resolution:')) {
      const parsed = JSON.parse(message);

      switch (parsed.type) {
        // ✅ Handle sync_request
        case 'sync_request':
          console.log('[PartyKit] Sync request from:', sender.id);

          // Send current state to requester
          sender.send(
            JSON.stringify({
              type: 'sync_response',
              selections: Object.fromEntries(this.sharedSelections),
              participants: Array.from(this.participants.values()),
            })
          );
          break;

        // ✅ Store selections server-side
        case 'field_selected':
          if (parsed.selection) {
            const { field } = parsed.selection;

            // Store in server state
            this.sharedSelections.set(field, parsed.selection);

            // Then broadcast
            this.room.broadcast(message, [sender.id]);
          }
          break;

        // ✅ Track participants
        case 'user_joined':
          if (parsed.userId && parsed.userName) {
            this.participants.set(parsed.userId, {
              id: parsed.userId,
              name: parsed.userName,
              isReady: false,
            });

            this.room.broadcast(message, [sender.id]);
          }
          break;

        // ✅ Update participant ready state
        case 'user_ready':
          if (parsed.userId) {
            const participant = this.participants.get(parsed.userId);
            if (participant) {
              participant.isReady = parsed.isReady;
            }

            this.room.broadcast(message, [sender.id]);
          }
          break;

        default:
          // Broadcast other message types
          this.room.broadcast(message, [sender.id]);
      }
    }
  }
}
```

### Step 2: Client Handles sync_response

The client already has code to handle `sync_response`, but it's never triggered because the server doesn't send it:

```typescript
// use-shared-conflict-resolution.ts (lines 108-114)
case 'sync_response':
  if (message.selections) {
    console.log(
      '[ConflictResolution] Syncing selections:',
      message.selections
    );
    setSharedSelections(message.selections);  // ✅ This works!
  }
  break;
```

**This code is already there and ready to work!** It just needs the server to actually send the response.

---

## Before & After

### Before (Current)

```typescript
// Server
onMessage(message: string, sender: Party.Connection) {
  // ❌ No state storage
  // ❌ No sync_request handling

  this.room.broadcast(message, [sender.id]);  // Just broadcasts everything
}
```

**Result:**

- New users: Empty state
- Refreshed users: Lose everything
- Reconnected users: Out of sync

### After (Fixed)

```typescript
// Server
export default class CollaborationServer implements Party.Server {
  private sharedSelections = new Map(); // ✅ Persistent state

  onMessage(message: string, sender: Party.Connection) {
    const parsed = JSON.parse(message);

    switch (parsed.type) {
      case 'sync_request':
        // ✅ Send state to requester
        sender.send(
          JSON.stringify({
            type: 'sync_response',
            selections: Object.fromEntries(this.sharedSelections),
          })
        );
        break;

      case 'field_selected':
        // ✅ Store selection
        this.sharedSelections.set(parsed.selection.field, parsed.selection);
        this.room.broadcast(message, [sender.id]);
        break;
    }
  }
}
```

**Result:**

- New users: Get full state immediately
- Refreshed users: Rejoin seamlessly
- Reconnected users: Automatically re-sync

---

## Testing the Fix

### Test Case 1: Late Joiner

**Setup:**

1. Alice joins and selects 3 fields
2. Bob joins 30 seconds later

**Without Fix:**

```javascript
// Bob's state after joining
{
} // ❌ Empty
```

**With Fix:**

```javascript
// Bob's state after joining
{
  productType: { value: "iPhone 13", userId: "alice", timestamp: 1000 },
  condition: { value: "Like New", userId: "alice", timestamp: 2000 },
  price: { value: "45000", userId: "alice", timestamp: 3000 }
}  // ✅ Synced!
```

### Test Case 2: Page Refresh

**Setup:**

1. Alice selects 5 fields
2. Alice hits browser refresh (F5)
3. Alice rejoins same room

**Without Fix:**

```javascript
// Alice's state after refresh
{
} // ❌ Lost all selections!
```

**With Fix:**

```javascript
// Alice's state after refresh
{
  productType: { value: "iPhone 13", ... },
  condition: { value: "Like New", ... },
  price: { value: "45000", ... },
  quantity: { value: "1", ... },
  meetingLocation: { value: "SM Mall", ... }
}  // ✅ Restored!
```

---

## Summary

**The Problem:**

- Client sends `sync_request` asking for state
- Server ignores it and just broadcasts the request (useless)
- New/rejoining users have empty state

**The Fix:**

- Server stores selections in `Map<string, SharedSelection>`
- Server responds to `sync_request` with current state
- Client already knows how to handle `sync_response` (code exists)

**Impact:**

- ✅ Late joiners get full state
- ✅ Page refreshes don't lose data
- ✅ Network glitches auto-recover
- ✅ All users stay synchronized

**Effort:** ~30 minutes to implement server-side state storage

This is the **#1 critical fix** needed for production-ready collaboration!
