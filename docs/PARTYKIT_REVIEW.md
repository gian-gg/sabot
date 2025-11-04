# PartyKit Implementation Review

**Date**: 2025-11-02  
**Purpose**: Real-time collaboration for transaction conflict resolution  
**Status**: ⚠️ Functional but needs optimization

---

## 📋 Current Architecture

### Server Components

#### 1. **collaboration.ts** (Main Party Server)

- **Purpose**: Handles conflict resolution collaboration
- **Room Pattern**: `conflict-resolution:{transactionId}`
- **Features**:
  - User join/leave tracking
  - Field selection broadcasting
  - Reconnection grace period (8 seconds)
  - User ready state synchronization

#### 2. **server.ts** (Default Party Server)

- **Purpose**: Generic server (unused in current implementation)
- **Status**: Appears to be a boilerplate/fallback

### Client Components

#### 1. **use-shared-conflict-resolution.ts** (React Hook)

- **Purpose**: Client-side state management for collaboration
- **Manages**:
  - Shared field selections
  - Participant list
  - Connection status
  - Disconnect detection

---

## 🎯 Message Protocol

### Message Types

1. **user_joined** - User enters room
2. **user_left** - User leaves room (after grace period)
3. **field_selected** - User selects a conflict resolution option
4. **user_ready** - User confirms their selections
5. **sync_request** - Request current state (NOT IMPLEMENTED ON SERVER)
6. **sync_response** - Response with state (NOT IMPLEMENTED ON SERVER)

---

## ⚠️ Issues & Inefficiencies

### Critical Issues

#### 1. **Missing State Persistence**

**Problem**: `sync_request` and `sync_response` are sent but never handled on the server.

**Impact**:

- New users joining don't see existing selections
- If one user refreshes, they lose all context
- No recovery from disconnection

**Current Code**:

```typescript
// Client sends (line 236-241 in hook):
socket.send(JSON.stringify({ type: 'sync_request' }));

// ❌ Server never responds to sync_request
// ❌ No state storage in collaboration.ts
```

**Fix Required**: Server needs to:

- Store `sharedSelections` in room state
- Respond to `sync_request` with current state
- Persist participant ready states

---

#### 2. **Redundant State Management**

**Problem**: Client adds current user to participants locally AND waits for broadcast.

**Code Example** (lines 52-60 in hook):

```typescript
// Adds user locally on mount
useEffect(() => {
  setParticipants((prev) => [
    ...prev,
    { id: userId, name: userName, isReady: false },
  ]);
}, [userId, userName]);

// Also receives user_joined broadcast from server
// Results in potential duplicate or missed state
```

**Impact**: Race conditions, duplicate entries, inconsistent participant counts

---

#### 3. **Message Handler Missing Dependency**

**Problem**: `handleMessage` callback doesn't include `userId` in dependencies.

**Code** (line 64):

```typescript
const handleMessage = useCallback((evt: MessageEvent) => {
  // ... uses userId on line 191
  if (leftUserId !== userId) {
    setOtherPartyDisconnected(true);
  }
}, []); // ❌ Missing userId dependency
```

**Impact**: Stale closure - may reference old userId value

---

#### 4. **No Conflict Resolution for Simultaneous Selections**

**Problem**: If two users select different values for the same field simultaneously, last write wins.

**Code** (lines 254-275):

```typescript
const selectField = useCallback(
  (field, value) => {
    // Immediate local update
    setSharedSelections((prev) => ({ ...prev, [field]: selection }));

    // Then broadcast
    socket.send(JSON.stringify({ type: 'field_selected', selection }));
  },
  [socket, userId, userName]
);
```

**Impact**:

- No CRDT (Conflict-free Replicated Data Type)
- No vector clocks or timestamps used for conflict resolution
- Users may see different final states

---

### Performance Issues

#### 5. **Excessive Console Logging**

**Problem**: Production code has 30+ console.log statements.

**Impact**:

- Performance overhead
- Cluttered browser console
- Potential security leak (logs user IDs, room IDs)

**Files**:

- `collaboration.ts`: 15+ logs
- `use-shared-conflict-resolution.ts`: 20+ logs

---

#### 6. **No Message Batching**

**Problem**: Each field selection triggers individual WebSocket message.

**Scenario**: User quickly selects 5 fields → 5 separate messages

**Better Approach**: Debounce selections and batch updates

---

#### 7. **Inefficient Participant Updates**

**Problem**: Every `user_ready` message triggers full participant array map/update.

**Code** (lines 320-329):

```typescript
setParticipants((prev) => {
  const updated = prev.map((p) => (p.id === userId ? { ...p, isReady } : p));
  return updated;
});
```

**Better**: Use object lookup (Map) instead of array iteration

---

### Reliability Issues

#### 8. **No Message Acknowledgment**

**Problem**: Fire-and-forget messaging with no confirmation delivery.

**Risk**:

- Silent failures if WebSocket message drops
- Users think their selection was broadcast but it wasn't

---

#### 9. **Grace Period Race Condition**

**Problem**: 8-second grace period may be too long or too short depending on network.

**Code** (collaboration.ts, line 14):

```typescript
const RECONNECT_GRACE_PERIOD = 8000; // 8 seconds
```

**Issues**:

- Mobile users on flaky networks may need longer
- Fast refreshes trigger unnecessary disconnect warnings

---

#### 10. **No Heartbeat/Ping-Pong**

**Problem**: No active connection health checking.

**Impact**:

- Zombie connections may appear "connected" but can't receive messages
- No proactive reconnection on stale connections

---

### Code Quality Issues

#### 11. **Type Safety Gaps**

**Problem**: Message parsing has minimal validation.

**Code** (lines 91-93):

```typescript
const message: ConflictResolutionMessage = JSON.parse(data);
// ❌ No runtime validation that message.type is valid
// ❌ No validation that required fields exist
```

**Risk**: Malformed messages crash the handler

---

#### 12. **Unused Server File**

**Problem**: `server.ts` exists but serves no purpose.

**Impact**: Confusion, unnecessary code maintenance

---

## ✅ What's Working Well

1. **Reconnection Grace Period** - Smart delay before marking user as left
2. **Connection ID Mapping** - Tracks userId per connection properly
3. **Broadcast Filtering** - Excludes sender from broadcasts correctly
4. **React Hook Pattern** - Clean separation of concerns

---

## 🔧 Recommended Improvements

### High Priority

#### 1. Implement Server-Side State Persistence

```typescript
// collaboration.ts
export default class CollaborationServer implements Party.Server {
  // Add state storage
  private sharedSelections: Map<string, SharedSelection> = new Map();
  private participants: Map<string, Participant> = new Map();

  onMessage(message: string, sender: Party.Connection) {
    const parsed = JSON.parse(message);

    switch (parsed.type) {
      case 'sync_request':
        // Send current state to requester
        sender.send(
          JSON.stringify({
            type: 'sync_response',
            selections: Object.fromEntries(this.sharedSelections),
            participants: Array.from(this.participants.values()),
          })
        );
        break;

      case 'field_selected':
        // Store selection server-side
        this.sharedSelections.set(parsed.selection.field, parsed.selection);
        this.room.broadcast(message, [sender.id]);
        break;
    }
  }
}
```

#### 2. Add Message Validation

```typescript
import { z } from 'zod';

const MessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('user_joined'),
    userId: z.string().min(1),
    userName: z.string().min(1),
  }),
  z.object({
    type: z.literal('field_selected'),
    selection: z.object({
      field: z.string(),
      value: z.unknown(),
      userId: z.string(),
      userName: z.string(),
      timestamp: z.number(),
    }),
  }),
  // ... other message types
]);

// In onMessage:
try {
  const message = MessageSchema.parse(JSON.parse(data));
  // ... handle validated message
} catch (error) {
  console.error('Invalid message:', error);
  return;
}
```

#### 3. Fix Callback Dependencies

```typescript
const handleMessage = useCallback(
  (evt: MessageEvent) => {
    // ... message handling logic
  },
  [userId]
); // ✅ Add userId dependency
```

#### 4. Remove Production Logs

```typescript
// Create a debug flag
const DEBUG = process.env.NODE_ENV === 'development';

// Replace all console.log with:
if (DEBUG) console.log('[PartyKit] ...');
```

---

### Medium Priority

#### 5. Implement Optimistic UI with Rollback

```typescript
const selectField = useCallback(
  (field, value) => {
    const tempId = crypto.randomUUID();

    // Optimistic update
    setSharedSelections((prev) => ({
      ...prev,
      [field]: { ...selection, _tempId: tempId },
    }));

    // Send with temp ID
    socket.send(
      JSON.stringify({
        type: 'field_selected',
        selection,
        tempId,
      })
    );

    // Server responds with confirmation or error
    // On error: rollback using tempId
  },
  [socket, userId, userName]
);
```

#### 6. Add Heartbeat Mechanism

```typescript
// In usePartySocket:
useEffect(() => {
  if (!socket) return;

  const heartbeat = setInterval(() => {
    socket.send(JSON.stringify({ type: 'ping' }));
  }, 30000); // Every 30 seconds

  return () => clearInterval(heartbeat);
}, [socket]);

// Server responds with pong
```

#### 7. Batch Field Selections

```typescript
import { debounce } from 'lodash';

const pendingSelections = useRef<Map<keyof AnalysisData, unknown>>(new Map());

const flushSelections = useCallback(() => {
  if (pendingSelections.current.size === 0) return;

  socket.send(
    JSON.stringify({
      type: 'field_selected_batch',
      selections: Array.from(pendingSelections.current.entries()),
    })
  );

  pendingSelections.current.clear();
}, [socket]);

const debouncedFlush = useMemo(
  () => debounce(flushSelections, 300),
  [flushSelections]
);

const selectField = useCallback(
  (field, value) => {
    pendingSelections.current.set(field, value);
    debouncedFlush();
  },
  [debouncedFlush]
);
```

---

### Low Priority

#### 8. Add Performance Monitoring

```typescript
// Track message roundtrip time
const selectField = useCallback(
  (field, value) => {
    const startTime = performance.now();

    socket.send(
      JSON.stringify({
        type: 'field_selected',
        selection: { ...selection, _sentAt: startTime },
      })
    );
  },
  [socket]
);

// On receiving echo:
if (message.selection._sentAt) {
  const latency = performance.now() - message.selection._sentAt;
  console.log(`Message latency: ${latency}ms`);
}
```

#### 9. Remove Unused server.ts

```bash
# Simply delete party/server.ts if not used elsewhere
rm party/server.ts

# Update partykit.json to only have collaboration party
```

---

## 📊 Efficiency Score

| Category         | Current Score | Potential Score | Priority    |
| ---------------- | ------------- | --------------- | ----------- |
| State Sync       | 3/10          | 9/10            | 🔴 Critical |
| Message Protocol | 5/10          | 9/10            | 🔴 Critical |
| Performance      | 6/10          | 9/10            | 🟡 Medium   |
| Reliability      | 5/10          | 9/10            | 🟠 High     |
| Code Quality     | 7/10          | 10/10           | 🟡 Medium   |
| Type Safety      | 6/10          | 10/10           | 🟠 High     |

**Overall**: 5.3/10 → **Potential: 9.3/10**

---

## 🚀 Migration Path

### Phase 1 (Week 1): Critical Fixes

- [ ] Implement server-side state persistence
- [ ] Fix `sync_request`/`sync_response` flow
- [ ] Add message validation (Zod)
- [ ] Fix callback dependencies

### Phase 2 (Week 2): Reliability

- [ ] Add message acknowledgment
- [ ] Implement heartbeat/ping-pong
- [ ] Add optimistic UI with rollback
- [ ] Remove production console logs

### Phase 3 (Week 3): Performance

- [ ] Batch field selections
- [ ] Optimize participant updates (use Map)
- [ ] Add performance monitoring
- [ ] Load testing with 10+ concurrent users

### Phase 4 (Week 4): Polish

- [ ] Remove unused server.ts
- [ ] Add comprehensive error handling
- [ ] Document message protocol
- [ ] Add unit tests for message handlers

---

## 🧪 Testing Recommendations

### Unit Tests Needed

1. Message validation schemas
2. State update logic (all message types)
3. Reconnection grace period behavior
4. Participant deduplication

### Integration Tests Needed

1. Two users selecting same field simultaneously
2. User disconnect → reconnect within grace period
3. User disconnect → grace period expires
4. New user joins mid-session (should receive state)
5. WebSocket message loss simulation

### Load Tests Needed

1. 10 users, 100 field selections/minute
2. Rapid connect/disconnect (flaky network simulation)
3. Large state sync (50+ fields selected)

---

## 📚 Additional Resources

- [PartyKit Best Practices](https://docs.partykit.io/guides/best-practices/)
- [WebSocket Reliability Patterns](https://www.ably.com/topic/websocket-reliability)
- [CRDTs for Real-time Collaboration](https://crdt.tech/)

---

## 🎯 Summary

The current PartyKit implementation is **functional for basic use cases** but has **critical gaps in state synchronization** and **missing reliability features**. The most urgent fix is implementing server-side state persistence for the `sync_request`/`sync_response` flow.

**Recommendation**: Allocate 2-3 weeks to implement Phase 1 and Phase 2 improvements before launching to production with multiple concurrent users.
