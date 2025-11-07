# Transaction Field Unlock & Change Notification System

## Overview

This document explains how the notification system works when users unlock fields or make changes during the collaborative transaction creation flow (Steps 3 and 4).

## Features

### 1. Field Unlock Notifications

When a user clicks the unlock button (🔓) on a locked field in **Step 3 (Item Details)** or **Step 4 (Exchange Info)**, the other party is immediately notified.

**How it works:**

- User clicks unlock button on a locked field
- System sends `field_unlocked` message via WebSocket
- Other party receives a toast notification: _"{UserName} unlocked {FieldName}"_
- Field becomes editable for the user who unlocked it

**Example:**

```
✓ John unlocked "Item Name"
  They can now edit this field
```

### 2. Field Change Notifications

When a user modifies a field value in Steps 3 or 4, the other party is notified of the change.

**How it works:**

- User changes a field value (only if it was previously filled)
- System sends `field_changed` message via WebSocket
- Other party receives a toast notification: _"{UserName} changed {FieldName}"_
- Notification includes the step name where the change occurred

**Example:**

```
⚠ Sarah changed "Price"
  Updated in Item Details. Please review the changes.
```

### 3. Confirmation Requests (Optional Feature)

For critical changes, you can request confirmation from the other party before applying changes.

**How it works:**

- User initiates a change that requires confirmation
- System sends `confirmation_required` message
- Other party receives a toast with a "Review" button
- Clicking "Review" opens a dialog showing:
  - Field name
  - Step where change occurred
  - New value
  - Accept/Reject buttons
- Other party accepts or rejects the change
- System sends `confirmation_response` back to the requester

**Example Dialog:**

```
⚠ Confirm Change Request

John wants to change the following field:

Field: Price
Step: Item Details
New Value: ₱15,000

Do you want to accept this change?

[Reject Change]  [Accept Change]
```

## Technical Implementation

### WebSocket Message Types

The system uses PartyKit for real-time WebSocket communication:

```typescript
interface ConflictResolutionMessage {
  type:
    | 'field_unlocked' // Field unlock notification
    | 'field_changed' // Field change notification
    | 'confirmation_required' // Request confirmation
    | 'confirmation_response'; // Response to confirmation
  // ... other types

  field?: keyof AnalysisData; // Field identifier
  value?: unknown; // New value (for changes)
  userId?: string; // Who triggered the action
  userName?: string; // Display name
  step?: number; // Current step (3 or 4)
  messageId?: string; // Unique message ID
  confirmed?: boolean; // Confirmation response
}
```

### Hook Methods

The `useSharedConflictResolution` hook provides these methods:

```typescript
// Notify when a field is unlocked
notifyFieldUnlock(field: keyof AnalysisData): void

// Notify when a field value changes
notifyFieldChange(field: keyof AnalysisData, value: unknown, step?: number): void

// Request confirmation for a change
requestConfirmation(field: keyof AnalysisData, value: unknown, step?: number): void

// Respond to a confirmation request
respondToConfirmation(messageId: string, confirmed: boolean): void
```

### Field Labels

The system maps technical field names to user-friendly labels:

| Field Name         | Display Label    |
| ------------------ | ---------------- |
| `item_name`        | Item Name        |
| `product_model`    | Product Model    |
| `item_description` | Description      |
| `price`            | Price            |
| `quantity`         | Quantity         |
| `condition`        | Condition        |
| `category`         | Category         |
| `meeting_location` | Meeting Location |
| `meeting_time`     | Meeting Time     |
| `delivery_address` | Delivery Address |
| `delivery_method`  | Delivery Method  |

### Step Names

| Step # | Name                |
| ------ | ------------------- |
| 1      | Screenshot Analysis |
| 2      | Resolve Conflicts   |
| 3      | Item Details        |
| 4      | Exchange Info       |
| 5      | Safety Options      |
| 6      | Review              |

## Usage Examples

### Example 1: Unlock a Field

```typescript
// In CreateTransactionForm component
const toggleFieldLock = (field: keyof typeof fieldLocks) => {
  const wasLocked = fieldLocks[field];
  setFieldLocks((prev) => ({ ...prev, [field]: !prev[field] }));

  // Notify other party when unlocking
  if (wasLocked && conflictResolution) {
    conflictResolution.notifyFieldUnlock(field as keyof AnalysisData);
  }
};
```

### Example 2: Notify on Field Change

```typescript
const updateFormData = (field: keyof TransactionFormData, value: string) => {
  setFormData((prev) => {
    // Notify if value actually changed and we're in Step 3 or 4
    if (conflictResolution && (currentStep === 3 || currentStep === 4)) {
      if (prev[field] && prev[field] !== value) {
        conflictResolution.notifyFieldChange(
          field as keyof AnalysisData,
          value,
          currentStep
        );
      }
    }

    return { ...prev, [field]: value };
  });
};
```

### Example 3: Request Confirmation (Advanced)

```typescript
// When user wants to make a critical change
const handleCriticalChange = (field: keyof AnalysisData, newValue: unknown) => {
  if (conflictResolution) {
    conflictResolution.requestConfirmation(field, newValue, currentStep);

    // Listen for confirmation response
    // (handled automatically by the hook and ConfirmationDialog component)
  }
};
```

## Components

### ConfirmationDialog

A modal dialog that appears when a confirmation is required:

**Location:** `src/components/transaction/confirmation-dialog.tsx`

**Features:**

- Listens for `transaction-confirmation-required` custom events
- Displays field name, step, and new value
- Provides Accept/Reject buttons
- Calls `respondToConfirmation` with user's choice

**Usage:**

```tsx
{
  conflictResolution && (
    <ConfirmationDialog onConfirm={conflictResolution.respondToConfirmation} />
  );
}
```

## Toast Notifications

The system uses `sonner` for toast notifications:

### Unlock Notification

```typescript
toast.info(`${userName} unlocked "${fieldLabel}"`, {
  description: 'They can now edit this field',
  duration: 4000,
});
```

### Change Notification

```typescript
toast.warning(`${userName} changed "${fieldLabel}"`, {
  description: `Updated in ${stepName}. Please review the changes.`,
  duration: 5000,
});
```

### Confirmation Request

```typescript
toast.warning(`${userName} wants to change "${fieldLabel}"`, {
  description: 'Please confirm or reject this change',
  duration: 10000,
  action: {
    label: 'Review',
    onClick: () => {
      // Open confirmation dialog
    },
  },
});
```

## Message Flow Diagrams

### Field Unlock Flow

```
User A                          WebSocket                    User B
  |                                |                            |
  |-- Clicks Unlock Button ------->|                            |
  |                                |                            |
  |-- toggleFieldLock() ---------->|                            |
  |                                |                            |
  |-- notifyFieldUnlock() -------->|                            |
  |                                |                            |
  |                                |-- field_unlocked --------->|
  |                                |                            |
  |                                |                Toast: "User A unlocked X"
  |                                |                            |
```

### Field Change Flow

```
User A                          WebSocket                    User B
  |                                |                            |
  |-- Changes field value -------->|                            |
  |                                |                            |
  |-- updateFormData() ----------->|                            |
  |                                |                            |
  |-- notifyFieldChange() -------->|                            |
  |                                |                            |
  |                                |-- field_changed ---------->|
  |                                |                            |
  |                                |                Toast: "User A changed X"
  |                                |                            |
```

### Confirmation Flow

```
User A                          WebSocket                    User B
  |                                |                            |
  |-- Requests change ------------>|                            |
  |                                |                            |
  |-- requestConfirmation() ------>|                            |
  |                                |                            |
  |                                |-- confirmation_required -->|
  |                                |                            |
  |                                |                Toast with "Review" button
  |                                |                            |
  |                                |                User clicks "Review"
  |                                |                            |
  |                                |                Dialog opens
  |                                |                            |
  |                                |                User clicks Accept/Reject
  |                                |                            |
  |                                |<-- confirmation_response --|
  |                                |                            |
  |<-- Message received -----------|                            |
  |                                |                            |
  Toast: "Change accepted/rejected"                            |
  |                                |                            |
```

## Best Practices

1. **Only notify on actual changes**: Check if the value changed before sending notifications
2. **Provide context**: Always include the step number so users know where the change occurred
3. **User-friendly labels**: Map technical field names to readable labels
4. **Appropriate toast durations**:
   - Unlock: 4 seconds
   - Change: 5 seconds
   - Confirmation: 10 seconds (user needs time to act)
5. **Handle disconnections**: Check if conflictResolution is available before calling methods
6. **Don't spam**: Only send notifications for Steps 3 and 4 (Item Details and Exchange Info)

## Error Handling

The system includes robust error handling:

- **Connection lost**: Automatic reconnection via PartyKit
- **Message delivery failures**: Automatic retry with exponential backoff (up to 3 retries)
- **User disconnection**: Warning toast and otherPartyDisconnected flag
- **Invalid messages**: Silently ignored with error logging

## Extending the System

To add notifications for new steps or fields:

1. **Add new message type** (if needed) in `use-shared-conflict-resolution.ts`
2. **Add field label** to fieldLabels map in message handlers
3. **Call notification methods** in the appropriate component handlers
4. **Test with two browser windows** to verify real-time sync

## Testing

To test the notification system:

1. Open two browser windows/tabs
2. Navigate to the same transaction creation flow
3. In Window A: Click an unlock button → Window B should show toast
4. In Window A: Change a field value → Window B should show toast
5. (If confirmation enabled) Request a change → Window B should show dialog

## Files Modified

- `src/hooks/use-shared-conflict-resolution.ts` - Added message types and handlers
- `src/components/transaction/invite/create-transaction-form.tsx` - Integrated notifications
- `src/components/transaction/confirmation-dialog.tsx` - New confirmation dialog component

## Related Documentation

- [PartyKit Documentation](https://docs.partykit.io/)
- [Sonner Toast Library](https://sonner.emilkowal.ski/)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
