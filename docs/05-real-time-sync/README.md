# Real-Time Synchronization Documentation

This directory contains comprehensive documentation for real-time synchronization in Sabot.

## Overview

Sabot uses **two different synchronization approaches** optimized for their specific use cases:

### 1. Transaction Synchronization

**Technology:** Supabase Broadcast Channels + Polling Hybrid  
**Use Case:** Real-time updates between transaction participants (buyer and seller)  
**Key Features:**

- Instant updates via broadcast (<500ms)
- Reliable fallback via polling (5s)
- Works on all Supabase plans
- Zero configuration required

📄 **[Read Transaction Sync Documentation](./TRANSACTION_REALTIME_SYNC.md)**

---

### 2. Agreement Collaboration

**Technology:** y-webrtc + Yjs CRDT  
**Use Case:** Real-time collaborative document editing  
**Key Features:**

- Peer-to-peer synchronization (<100ms)
- Automatic conflict resolution
- User presence and cursors
- Offline support with auto-sync

📄 **[Read Agreement Sync Documentation](./AGREEMENT_REALTIME_SYNC.md)**

---

## Quick Comparison

| Aspect                | Transaction Sync       | Agreement Collaboration |
| --------------------- | ---------------------- | ----------------------- |
| **Architecture**      | Centralized (Supabase) | Peer-to-peer (WebRTC)   |
| **Primary Transport** | Broadcast Channels     | WebRTC                  |
| **Fallback**          | Polling (5s)           | Automatic reconnection  |
| **Latency**           | ~500ms                 | ~50-100ms               |
| **Server Load**       | Low (polling)          | Zero (P2P)              |
| **Use Case**          | Status updates         | Real-time editing       |
| **Conflict Handling** | Last-write-wins        | CRDT merge              |
| **Offline Support**   | Limited                | Full support            |
| **Scalability**       | Server-limited         | Peer-limited (10-20)    |

---

## When to Use Which?

### Use **Transaction Sync** for:

- ✅ Status updates between parties
- ✅ Transaction state changes
- ✅ Oracle verification results
- ✅ Deliverable completion notifications
- ✅ Simple real-time updates

### Use **Agreement Collaboration** for:

- ✅ Real-time collaborative editing
- ✅ Document co-authoring
- ✅ Seeing other users' cursors
- ✅ Concurrent text editing
- ✅ Low-latency interactions

---

## Architecture Diagrams

### Transaction Sync Architecture

```
User A ←→ Supabase Broadcast Channel ←→ User B
  ↓              ↓                       ↓
Polling API ←→ Status Endpoint    ←→ Polling API
(every 5s)     (cached)              (every 5s)
```

### Agreement Collaboration Architecture

```
User A ←→ WebRTC P2P Connection ←→ User B
  ↓                                   ↓
Yjs Doc                           Yjs Doc
(CRDT)                           (CRDT)
  ↓                                   ↓
TipTap Editor                    TipTap Editor
```

---

## Getting Started

### For Transaction Development

1. Import the hook:

   ```typescript
   import { useTransactionStatus } from '@/hooks/useTransactionStatus';
   ```

2. Use in your component:

   ```typescript
   const { status, loading, refetch } = useTransactionStatus(transactionId);
   ```

3. Broadcast updates from API routes:
   ```typescript
   const channel = supabase.channel(`transaction:${transactionId}`);
   await channel.send({
     type: 'broadcast',
     event: 'transaction_update',
     payload: {
       /* your data */
     },
   });
   ```

📖 **[Full Transaction Sync Guide](./TRANSACTION_REALTIME_SYNC.md)**

---

### For Agreement Development

1. Import the hook:

   ```typescript
   import { useCollaboration } from '@/lib/collaboration/use-collaboration';
   ```

2. Use in your component:

   ```typescript
   const { ydoc, provider, awareness, isConnected } = useCollaboration(
     agreementId,
     user
   );
   ```

3. Configure TipTap:
   ```typescript
   const editor = useEditor({
     extensions: [
       Collaboration.configure({ document: ydoc }),
       CollaborationCursor.configure({ provider }),
     ],
   });
   ```

📖 **[Full Agreement Collaboration Guide](./AGREEMENT_REALTIME_SYNC.md)**

---

## Testing

### Test Transaction Sync

1. Open two browser windows
2. Navigate to same transaction: `/transaction/[id]/active`
3. Make changes in one window
4. Verify updates appear in other window within 5 seconds

### Test Agreement Collaboration

1. Open two browser windows
2. Navigate to same agreement: `/agreement/[id]/active`
3. Type in one window
4. Verify text appears **instantly** in other window
5. Check for colored cursor presence

---

## Troubleshooting

### Transaction Sync Issues

**Updates not appearing:**

1. Check browser console for broadcast logs
2. Verify polling requests in Network tab
3. Check Supabase connection status
4. Verify transaction ID matches

**Slow updates:**

- Expected: Up to 5 seconds is normal
- If slower: Check network connection
- Check API response times

📖 **[Transaction Troubleshooting](./TRANSACTION_REALTIME_SYNC.md#troubleshooting)**

---

### Agreement Collaboration Issues

**Text not syncing:**

1. Verify WebRTC connection status in console
2. Check both windows have same agreement ID
3. Verify signaling server is accessible
4. Check browser WebRTC support

**Crashes or errors:**

- Verify patches applied: `node patches/apply-patches.js`
- Check for race condition errors
- Ensure proper initialization order

📖 **[Agreement Troubleshooting](./AGREEMENT_REALTIME_SYNC.md#troubleshooting)**

---

## Performance Expectations

### Transaction Sync

- **Instant updates:** ~500ms (via broadcast)
- **Fallback updates:** ~2500ms average (via polling)
- **Worst case:** 5 seconds
- **Server load:** 0.2 req/s per active user

### Agreement Collaboration

- **Typing latency:** <100ms
- **Cursor updates:** Real-time
- **Large documents:** ~100-200ms
- **Server load:** Zero (P2P)

---

## Related Documentation

- [High-Level Architecture](../02-architecture/01-high-level-architecture.md)
- [Flow Diagram](../02-architecture/02-flow-diagram.md)
- [Real-time Architecture](../02-architecture/03-realtime-architecture.md)
- [Tech Stack](../03-developer-guide/01-tech-stack.md)

---

## Support

For issues or questions:

1. Check the specific sync documentation
2. Review console logs for errors
3. Test in isolation (two browser windows)
4. Verify network connectivity
5. Check browser compatibility

---

**Last Updated:** 2025-11-04  
**Maintained By:** Sabot Development Team
