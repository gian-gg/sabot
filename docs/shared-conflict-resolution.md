# Shared Conflict Resolution with PartyKit

The `DataConflictResolver` component now supports **real-time collaborative conflict resolution** between transaction participants.

## Features

✅ **Live Radio Button Sync** - Both users see selections in real-time  
✅ **Visual Indicators** - Shows who selected each value  
✅ **Presence Awareness** - See when other participant is online  
✅ **No Polling** - Instant updates via WebSocket  
✅ **Automatic Sync** - Selections sync automatically on connection

## Usage

```tsx
import { DataConflictResolver } from '@/components/transaction/invite/data-conflict-resolver';

function MyComponent() {
  const [userId, setUserId] = useState('user-123');
  const [userName, setUserName] = useState('John Doe');

  return (
    <DataConflictResolver
      analyses={analyzedScreenshots}
      transactionId="txn-abc-123"
      userId={userId}
      userName={userName}
      onResolve={(resolvedData) => {
        console.log('Resolved data:', resolvedData);
      }}
      onCancel={() => {
        console.log('Cancelled');
      }}
    />
  );
}
```

## How It Works

1. **Both users connect** to PartyKit room: `conflict-resolution:${transactionId}`
2. **User A selects** "iPhone 13" → Broadcasts to room
3. **User B sees** the selection instantly with badge "User A"
4. **Both users** can only proceed when all conflicts are resolved together

## Visual Indicators

- **Green border** - Your own selection
- **Blue border** - Selection made by other participant
- **Badge** - Shows who made the selection ("You" or participant name)
- **Live dot** - Connection status indicator

## Component Changes

### Required Props (NEW):

- `transactionId: string` - Unique transaction ID for PartyKit room
- `userId: string` - Current user's ID
- `userName: string` - Current user's display name

### Backend Setup

The component uses the existing PartyKit collaboration server:

- Party: `collaboration`
- Room: `conflict-resolution:${transactionId}`

No additional backend code needed! The existing `party/collaboration.ts` handles all message broadcasting.

## Benefits vs Polling

| Feature                 | Before (No Sync)   | After (PartyKit)  |
| ----------------------- | ------------------ | ----------------- |
| **Update Latency**      | N/A (no sync)      | Instant (<100ms)  |
| **Server Load**         | None               | Minimal WebSocket |
| **User Experience**     | Each decides alone | Collaborative     |
| **Conflict Resolution** | Can disagree       | Must agree        |
