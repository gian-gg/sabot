# Quick Reference: Transaction Notification System

## Import

```typescript
import { useSharedConflictResolution } from '@/hooks/use-shared-conflict-resolution';
import { ConfirmationDialog } from '@/components/transaction/confirmation-dialog';
```

## Setup

```typescript
// In your component
const conflictResolution = useSharedConflictResolution(
  transactionId,
  userId,
  userName
);
```

## Methods

### 1. Notify Field Unlock

```typescript
conflictResolution.notifyFieldUnlock(field: keyof AnalysisData)
```

**When:** User clicks unlock button (🔓)  
**Result:** Other party sees: _"User unlocked {FieldName}"_

### 2. Notify Field Change

```typescript
conflictResolution.notifyFieldChange(
  field: keyof AnalysisData,
  value: unknown,
  step?: number
)
```

**When:** User changes a field value  
**Result:** Other party sees: _"User changed {FieldName}"_

### 3. Request Confirmation (Optional)

```typescript
conflictResolution.requestConfirmation(
  field: keyof AnalysisData,
  value: unknown,
  step?: number
)
```

**When:** Critical change needs approval  
**Result:** Other party sees confirmation dialog

### 4. Respond to Confirmation

```typescript
conflictResolution.respondToConfirmation(
  messageId: string,
  confirmed: boolean
)
```

**When:** User accepts/rejects in confirmation dialog  
**Result:** Requester sees: _"Change confirmed/rejected"_

## Common Patterns

### Pattern 1: Unlock with Notification

```typescript
const toggleFieldLock = (field: keyof typeof fieldLocks) => {
  const wasLocked = fieldLocks[field];
  setFieldLocks((prev) => ({ ...prev, [field]: !prev[field] }));

  if (wasLocked && conflictResolution) {
    conflictResolution.notifyFieldUnlock(field as keyof AnalysisData);
  }
};
```

### Pattern 2: Update with Notification

```typescript
const updateFormData = (field: keyof TransactionFormData, value: string) => {
  setFormData((prev) => {
    // Only notify if value changed and in Step 3 or 4
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

### Pattern 3: Confirmation Dialog

```tsx
{
  conflictResolution && (
    <ConfirmationDialog onConfirm={conflictResolution.respondToConfirmation} />
  );
}
```

## Field Names

| Code               | Display          |
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

## State

```typescript
// Available state
conflictResolution.isConnected: boolean
conflictResolution.participants: Participant[]
conflictResolution.otherPartyDisconnected: boolean
conflictResolution.pendingConfirmations: Map<string, {...}>
```

## Toast Durations

- **Unlock:** 4 seconds (info)
- **Change:** 5 seconds (warning)
- **Confirmation:** 10 seconds (warning with action)

## Message Types

| Type                    | Purpose                         |
| ----------------------- | ------------------------------- |
| `field_unlocked`        | Field unlock notification       |
| `field_changed`         | Field value change notification |
| `confirmation_required` | Request confirmation            |
| `confirmation_response` | Accept/reject confirmation      |

## Debugging

```typescript
// Enable logging
import { createLogger } from '@/lib/utils/logger';
const logger = createLogger('ConflictResolution');

// Check connection
console.log('Connected:', conflictResolution.isConnected);
console.log('Participants:', conflictResolution.participants);

// Check for disconnection
console.log(
  'Other party disconnected:',
  conflictResolution.otherPartyDisconnected
);
```

## Common Issues

### Issue: Notifications not showing

**Check:**

- Is `conflictResolution` defined?
- Are both users in the same transaction room?
- Is WebSocket connected? (`conflictResolution.isConnected`)
- Are you in Step 3 or 4?

### Issue: Duplicate notifications

**Check:**

- Are you calling `notifyFieldChange()` multiple times?
- Is the value actually changing? (use `prev[field] !== value`)

### Issue: Confirmation dialog not appearing

**Check:**

- Is `ConfirmationDialog` component rendered?
- Is the custom event listener registered?
- Check browser console for errors

## Testing Checklist

- [ ] Open two browser windows
- [ ] Navigate to same transaction
- [ ] Test unlock notification
- [ ] Test change notification
- [ ] Test confirmation (if implemented)
- [ ] Test with disconnection/reconnection
- [ ] Verify toast durations
- [ ] Check field labels are correct

## Performance Tips

1. ✅ Only notify on actual changes
2. ✅ Debounce rapid changes
3. ✅ Check `isConnected` before calling methods
4. ✅ Use acknowledgments for critical messages
5. ✅ Limit notifications to Steps 3 and 4

## Links

- 📚 [Full Documentation](./TRANSACTION_NOTIFICATIONS.md)
- 🎨 [Visual Guide](./VISUAL_GUIDE.md)
- 📋 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- 💻 [Code Examples](./examples/confirmation-requests-example.ts)
