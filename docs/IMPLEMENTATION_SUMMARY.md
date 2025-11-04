# Transaction Notification System - Implementation Summary

## What Was Implemented

A comprehensive real-time notification system for the collaborative transaction creation flow that notifies users when:

1. The other party unlocks a field (clicks the unlock button)
2. The other party changes a field value in Steps 3 or 4
3. (Optional) A party requests confirmation for critical changes

## Files Modified

### 1. `src/hooks/use-shared-conflict-resolution.ts`

**Changes:**

- Extended `ConflictResolutionMessage` interface with new message types:
  - `field_unlocked` - Field unlock notification
  - `field_changed` - Field value change notification
  - `confirmation_required` - Request confirmation for changes
  - `confirmation_response` - Response to confirmation request
- Added `pendingConfirmations` state to track confirmation requests
- Added message handlers for the new message types
- Added new hook methods:
  - `notifyFieldUnlock(field)` - Send unlock notification
  - `notifyFieldChange(field, value, step)` - Send change notification
  - `requestConfirmation(field, value, step)` - Request confirmation
  - `respondToConfirmation(messageId, confirmed)` - Respond to confirmation

### 2. `src/components/transaction/invite/create-transaction-form.tsx`

**Changes:**

- Imported `ConfirmationDialog` component
- Updated `toggleFieldLock()` to call `notifyFieldUnlock()` when unlocking fields
- Updated `updateFormData()` to call `notifyFieldChange()` when fields change in Steps 3 or 4
- Added `ConfirmationDialog` component at the end of the form

### 3. `src/components/transaction/confirmation-dialog.tsx` (New File)

**Purpose:** Modal dialog for handling confirmation requests
**Features:**

- Listens for `transaction-confirmation-required` custom events
- Displays field name, step, and new value
- Provides Accept/Reject buttons
- Calls `respondToConfirmation()` with user's choice

## How It Works

### Field Unlock Flow

```
User A clicks unlock → notifyFieldUnlock() → WebSocket message →
User B receives toast: "User A unlocked 'Field Name'"
```

### Field Change Flow

```
User A changes value → updateFormData() → notifyFieldChange() → WebSocket message →
User B receives toast: "User A changed 'Field Name' (Updated in Step Name)"
```

### Confirmation Flow (Optional)

```
User A requests change → requestConfirmation() → WebSocket message →
User B sees toast with "Review" button → Clicks Review → Dialog opens →
User B accepts/rejects → respondToConfirmation() → WebSocket message →
User A receives confirmation response toast
```

## User Experience

### Unlock Notification

- **Icon:** ℹ️ Info toast (blue)
- **Title:** "{UserName} unlocked {FieldName}"
- **Description:** "They can now edit this field"
- **Duration:** 4 seconds

### Change Notification

- **Icon:** ⚠️ Warning toast (amber)
- **Title:** "{UserName} changed {FieldName}"
- **Description:** "Updated in {StepName}. Please review the changes."
- **Duration:** 5 seconds

### Confirmation Request

- **Icon:** ⚠️ Warning toast (amber)
- **Title:** "{UserName} wants to change {FieldName}"
- **Description:** "Please confirm or reject this change"
- **Duration:** 10 seconds
- **Action Button:** "Review" - Opens confirmation dialog

### Confirmation Dialog

- Shows field name, step name, and new value
- Two buttons: "Reject Change" (cancel) and "Accept Change" (confirm)
- Sends response back to requester

## Field Labels

The system automatically converts technical field names to user-friendly labels:

- `item_name` → "Item Name"
- `product_model` → "Product Model"
- `price` → "Price"
- `meeting_location` → "Meeting Location"
- etc.

## Step Names

- Step 1: Screenshot Analysis
- Step 2: Resolve Conflicts
- Step 3: Item Details ✅ (notifications enabled)
- Step 4: Exchange Info ✅ (notifications enabled)
- Step 5: Safety Options
- Step 6: Review

## When Notifications Are Sent

### Unlock Notifications

- Triggered when user clicks unlock button (🔓) on a locked field
- Only in Steps 3 and 4

### Change Notifications

- Triggered when a field value changes
- Only if the field was previously filled (not initial entry)
- Only in Steps 3 and 4
- Automatically sent via `updateFormData()`

### Confirmation Requests

- Must be explicitly requested via `requestConfirmation()`
- Not automatically triggered (opt-in feature)
- Can be used for critical fields like price, location, etc.

## Testing the System

### Manual Testing Steps:

1. Open two browser windows/tabs
2. Navigate to the same transaction (use the transaction ID in URL)
3. **Test Unlock:**
   - Window A: Click unlock button on a field
   - Window B: Should see toast "User A unlocked 'Field Name'"
4. **Test Change:**
   - Window A: Change a field value in Step 3 or 4
   - Window B: Should see toast "User A changed 'Field Name'"
5. **Test Confirmation (if implemented):**
   - Window A: Request confirmation for a change
   - Window B: Should see toast with "Review" button
   - Window B: Click "Review", dialog opens
   - Window B: Accept or reject
   - Window A: Should see confirmation response toast

## WebSocket Communication

The system uses PartyKit for real-time WebSocket communication:

- **Host:** Configured via `NEXT_PUBLIC_PARTYKIT_HOST` env var
- **Party:** `collaboration`
- **Room:** `conflict-resolution:{transactionId}`
- **Message Acknowledgment:** Built-in retry mechanism (up to 3 retries)
- **Heartbeat:** Ping/pong every 30 seconds to detect disconnections

## Error Handling

- **Connection lost:** Automatic reconnection
- **Message delivery failure:** Automatic retry with exponential backoff
- **User disconnection:** Warning toast and flag set
- **Invalid messages:** Silently ignored with error logging
- **No WebSocket connection:** Methods safely return without error

## Best Practices

1. **Always check if conflictResolution exists** before calling methods
2. **Only notify on actual changes** (not initial entry)
3. **Use appropriate toast durations** (4s for info, 5s for warnings, 10s for actions)
4. **Provide context** (include step number in notifications)
5. **Don't spam** (only Steps 3 and 4)
6. **User-friendly labels** (map technical names to readable text)

## Future Enhancements

Potential improvements:

1. **Smart confirmation** - Auto-request confirmation for large price changes
2. **Field locking sync** - Lock fields that other party is editing
3. **Undo changes** - Allow reverting recent changes
4. **Change history** - Show audit trail of all changes
5. **Batch confirmations** - Group multiple changes into one confirmation
6. **Priority notifications** - Different toast styles for critical vs. minor changes
7. **Notification preferences** - Let users control which notifications they see

## Documentation

- **Main Guide:** `docs/TRANSACTION_NOTIFICATIONS.md`
- **Examples:** `docs/examples/confirmation-requests-example.ts`
- **This Summary:** `docs/IMPLEMENTATION_SUMMARY.md`

## Quick Start

To use the notification system in your code:

```typescript
// Get the conflictResolution hook
const conflictResolution = useSharedConflictResolution(
  transactionId,
  userId,
  userName
);

// Notify when unlocking a field
if (wasLocked && conflictResolution) {
  conflictResolution.notifyFieldUnlock('item_name');
}

// Notify when changing a field
if (conflictResolution && currentStep === 3) {
  conflictResolution.notifyFieldChange('price', '15000', 3);
}

// Request confirmation (optional)
if (conflictResolution) {
  conflictResolution.requestConfirmation('price', '15000', 3);
}

// Add the dialog to your component
{conflictResolution && (
  <ConfirmationDialog
    onConfirm={conflictResolution.respondToConfirmation}
  />
)}
```

## Support

For questions or issues, refer to:

- Full documentation: `docs/TRANSACTION_NOTIFICATIONS.md`
- Code examples: `docs/examples/confirmation-requests-example.ts`
- Hook implementation: `src/hooks/use-shared-conflict-resolution.ts`
