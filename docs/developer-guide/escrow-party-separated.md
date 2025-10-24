# Escrow Feature - Party-Separated Deliverables

## Overview

The escrow system has been refined to **separate deliverables by party** and **only show value fields for payment types**. This creates a clearer structure where each party's obligations are explicitly tracked.

---

## Key Changes

### 1. **Deliverables Separated by Party** 👥

Each deliverable now explicitly tracks which party is responsible:

```typescript
interface Deliverable {
  id: string;
  type: EscrowType;
  description: string;
  quantity?: number;
  value?: number;
  currency?: string;
  party_responsible: 'initiator' | 'participant'; // ← NEW
}
```

### 2. **Digital Transfer Added** 💳

New deliverable type for digital payments:

```typescript
type EscrowType =
  | 'cash' // Cash payment
  | 'digital_transfer' // Digital/bank transfer payment ← NEW
  | 'item' // Physical item
  | 'service' // Service delivery
  | 'digital' // Digital deliverable
  | 'document' // Documents
  | 'mixed';
```

### 3. **Conditional Value Fields** 💰

Value and currency fields **only appear** for payment types:

- ✅ Show for: `cash`, `digital_transfer`
- ❌ Hide for: `service`, `item`, `digital`, `document`

### 4. **Removed Global Payment Method** 🗑️

- No more single "payment method" field
- Payment method is implicit in deliverable type (cash vs digital_transfer)
- Cleaner, more explicit structure

---

## UI Structure

### Before: Single List

```
Deliverables
├─ Deliverable 1: Service
├─ Deliverable 2: Payment ($5,000)
└─ Deliverable 3: Document

Payment Method: [Bank Transfer ▼]
```

### After: Party-Separated

```
Deliverables

Initiator's Obligations                    [+ Add]
├─ Deliverable 1: Service
│  └─ Develop mobile application
├─ Deliverable 2: Digital Asset
│  └─ Provide source code
└─ Deliverable 3: Document
   └─ Project documentation

Participant's Obligations                  [+ Add]
└─ Deliverable 1: Digital Transfer
   ├─ Pay upon completion
   ├─ Amount: $5,000
   └─ Currency: USD
```

---

## Auto-Inference

The system now determines **which party is responsible** based on keywords:

### Initiator Keywords

- `provide`, `deliver`, `supply`, `transfer`, `give`
- `seller`, `developer`, `freelancer`, `provider`

### Participant Keywords

- `pay`, `payment`, `purchase`
- `buyer`, `client`, `customer`, `receive`

### Example

**Agreement**:

```
The developer will create a mobile app and provide source code.
The client will pay $5,000 via bank transfer upon delivery.
```

**Auto-Generated**:

```json
[
  {
    "id": "del-1",
    "type": "service",
    "description": "The developer will create a mobile app",
    "party_responsible": "initiator"
  },
  {
    "id": "del-2",
    "type": "digital",
    "description": "provide source code",
    "party_responsible": "initiator"
  },
  {
    "id": "del-3",
    "type": "digital_transfer",
    "description": "The client will pay $5,000 via bank transfer",
    "value": 5000,
    "currency": "USD",
    "party_responsible": "participant"
  }
]
```

---

## Deliverable Types

### Non-Payment Types (No Value Field)

#### Service

```json
{
  "type": "service",
  "description": "Complete web application development",
  "party_responsible": "initiator"
}
```

#### Physical Item

```json
{
  "type": "item",
  "description": "MacBook Pro 2023",
  "quantity": 1,
  "party_responsible": "initiator"
}
```

#### Digital Asset

```json
{
  "type": "digital",
  "description": "Source code and repository access",
  "party_responsible": "initiator"
}
```

#### Document

```json
{
  "type": "document",
  "description": "Signed transfer papers",
  "quantity": 3,
  "party_responsible": "initiator"
}
```

### Payment Types (Requires Value Field)

#### Cash Payment

```json
{
  "type": "cash",
  "description": "Pay upon inspection",
  "value": 1500,
  "currency": "USD",
  "party_responsible": "participant"
}
```

#### Digital Transfer

```json
{
  "type": "digital_transfer",
  "description": "Bank transfer upon completion",
  "value": 5000,
  "currency": "USD",
  "party_responsible": "participant"
}
```

---

## UI Components

### Value Field (Conditional)

The value field only renders for payment types:

```tsx
{
  /* Amount field - only for payment types */
}
{
  (deliverable.type === 'cash' || deliverable.type === 'digital_transfer') && (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="space-y-2 sm:col-span-2">
        <Label>
          Amount <span className="text-destructive">*</span>
        </Label>
        <Input type="number" value={deliverable.value || ''} required />
      </div>
      <div className="space-y-2">
        <Label>Currency</Label>
        <Select value={deliverable.currency || 'USD'}>
          <SelectItem value="USD">USD</SelectItem>
          <SelectItem value="EUR">EUR</SelectItem>
          <SelectItem value="GBP">GBP</SelectItem>
          <SelectItem value="PHP">PHP</SelectItem>
        </Select>
      </div>
    </div>
  );
}
```

### Party Sections

Deliverables are filtered and displayed by party:

```tsx
{
  /* Initiator's Obligations */
}
<div>
  <h4>Initiator's Obligations</h4>
  <Button onClick={() => addDeliverable('initiator')}>Add</Button>

  {escrowData.deliverables
    .filter((d) => d.party_responsible === 'initiator')
    .map((deliverable) => (
      <DeliverableCard {...deliverable} />
    ))}
</div>;

{
  /* Participant's Obligations */
}
<div>
  <h4>Participant's Obligations</h4>
  <Button onClick={() => addDeliverable('participant')}>Add</Button>

  {escrowData.deliverables
    .filter((d) => d.party_responsible === 'participant')
    .map((deliverable) => (
      <DeliverableCard {...deliverable} />
    ))}
</div>;
```

---

## Real-World Examples

### Example 1: Freelance Development

**Agreement**:

```
Developer will:
- Build mobile app with authentication
- Provide source code and documentation
- Offer 30 days of support

Client will:
- Pay $8,000 via bank transfer in two installments
- Provide branding assets
```

**Escrow Deliverables**:

**Initiator (Developer)**:

```json
[
  {
    "type": "service",
    "description": "Build mobile app with authentication",
    "party_responsible": "initiator"
  },
  {
    "type": "digital",
    "description": "Provide source code and documentation",
    "party_responsible": "initiator"
  },
  {
    "type": "service",
    "description": "Offer 30 days of support",
    "party_responsible": "initiator"
  }
]
```

**Participant (Client)**:

```json
[
  {
    "type": "digital_transfer",
    "description": "First installment payment",
    "value": 4000,
    "currency": "USD",
    "party_responsible": "participant"
  },
  {
    "type": "digital_transfer",
    "description": "Final installment payment",
    "value": 4000,
    "currency": "USD",
    "party_responsible": "participant"
  },
  {
    "type": "digital",
    "description": "Provide branding assets",
    "party_responsible": "participant"
  }
]
```

### Example 2: Item Sale

**Agreement**:

```
Seller will:
- Deliver laptop in excellent condition
- Include original box and charger
- Provide receipt and warranty papers

Buyer will:
- Pay $1,200 cash upon inspection
- Pick up item from seller's location
```

**Escrow Deliverables**:

**Initiator (Seller)**:

```json
[
  {
    "type": "item",
    "description": "Laptop in excellent condition",
    "quantity": 1,
    "party_responsible": "initiator"
  },
  {
    "type": "item",
    "description": "Original box and charger",
    "party_responsible": "initiator"
  },
  {
    "type": "document",
    "description": "Receipt and warranty papers",
    "party_responsible": "initiator"
  }
]
```

**Participant (Buyer)**:

```json
[
  {
    "type": "cash",
    "description": "Pay upon inspection",
    "value": 1200,
    "currency": "USD",
    "party_responsible": "participant"
  }
]
```

---

## Database Schema

### Updated Structure

```sql
CREATE TABLE escrows (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,

  -- Deliverables with party responsibility
  -- Each JSON: {
  --   id, type, description, quantity?,
  --   value?, currency?, party_responsible
  -- }
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- No payment_method field (removed)

  expected_completion_date TIMESTAMPTZ,
  -- ... other fields
);
```

### Example JSONB Data

```json
[
  {
    "id": "del-1",
    "type": "service",
    "description": "Complete web development",
    "party_responsible": "initiator"
  },
  {
    "id": "del-2",
    "type": "digital_transfer",
    "description": "Payment upon completion",
    "value": 5000,
    "currency": "USD",
    "party_responsible": "participant"
  }
]
```

---

## Benefits

### 1. **Clear Accountability** ✅

Each deliverable explicitly states who's responsible - no ambiguity.

### 2. **Better Organization** 📊

UI naturally groups obligations by party for easier review.

### 3. **Cleaner Data Model** 🗂️

- No redundant payment_method field
- Payment method implicit in deliverable type
- Value fields only where needed

### 4. **Better Validation** ✓

- Payment types **must** have amount
- Non-payment types **don't** show amount fields
- Prevents user confusion

### 5. **Dispute Resolution** ⚖️

Arbiter can easily see which party failed to deliver what:

```
Initiator delivered: ✅ Service, ✅ Digital Asset
Participant delivered: ❌ Payment (missing)
→ Decision: Release escrow back to initiator
```

---

## API Changes

### Request Body

```typescript
POST /api/escrow/create

{
  "title": "Web Development Escrow",
  "deliverables": [
    {
      "id": "del-1",
      "type": "service",
      "description": "Build website",
      "party_responsible": "initiator"
    },
    {
      "id": "del-2",
      "type": "digital_transfer",
      "description": "Payment",
      "value": 5000,
      "currency": "USD",
      "party_responsible": "participant"
    }
  ],
  "expected_completion_date": "2025-12-31",
  "arbiter_id": "arb-123",
  "agreement_id": "agr-456"

  // REMOVED: payment_method
}
```

---

## Migration Notes

### Type Updates

**Added**:

```typescript
type EscrowType = ... | 'digital_transfer';
type PartyResponsible = 'initiator' | 'participant';
```

**Removed**:

```typescript
type PaymentMethod = ...; // Deleted
```

### Interface Updates

**Deliverable**:

```typescript
// Added
party_responsible: PartyResponsible;

// Clarified
value?: number;      // Only for cash/digital_transfer
currency?: string;   // Only for cash/digital_transfer
```

**Escrow**:

```typescript
// Removed
payment_method?: PaymentMethod;
```

### Database Migration

```sql
-- Removed column
-- payment_method TEXT

-- Updated comment on deliverables JSONB
-- Now includes party_responsible field
```

---

## Testing

### Test Case 1: Party Separation

```typescript
const deliverables = [
  { ..., party_responsible: 'initiator' },
  { ..., party_responsible: 'participant' }
];

const initiatorDeliverables = deliverables.filter(
  d => d.party_responsible === 'initiator'
);
const participantDeliverables = deliverables.filter(
  d => d.party_responsible === 'participant'
);

expect(initiatorDeliverables).toHaveLength(1);
expect(participantDeliverables).toHaveLength(1);
```

### Test Case 2: Value Field Visibility

```typescript
// Service type - no value field
<DeliverableCard type="service" />
expect(screen.queryByLabelText('Amount')).toBeNull();

// Cash type - shows value field
<DeliverableCard type="cash" />
expect(screen.getByLabelText('Amount')).toBeInTheDocument();

// Digital transfer - shows value field
<DeliverableCard type="digital_transfer" />
expect(screen.getByLabelText('Amount')).toBeInTheDocument();
```

### Test Case 3: Auto-Inference

```typescript
const terms = 'Developer will build app. Client will pay $5,000.';
const deliverables = parseDeliverablesFromAgreement(terms);

const devDeliverable = deliverables.find((d) =>
  d.description.includes('build')
);
const paymentDeliverable = deliverables.find((d) =>
  d.description.includes('pay')
);

expect(devDeliverable.party_responsible).toBe('initiator');
expect(paymentDeliverable.party_responsible).toBe('participant');
expect(paymentDeliverable.value).toBe(5000);
```

---

## Summary

### What Changed

1. ✅ **Added `party_responsible`** to each deliverable
2. ✅ **Added `digital_transfer`** deliverable type
3. ✅ **Removed `payment_method`** field
4. ✅ **Value field now conditional** - only for payment types
5. ✅ **UI separated by party** - clear visual distinction

### Benefits

- 🎯 **Clearer structure** - explicit party responsibility
- 🧹 **Cleaner data** - no redundant fields
- 💡 **Better UX** - value fields only where relevant
- ⚖️ **Easier disputes** - clear accountability
- 📊 **Better tracking** - obligations grouped by party

### Impact

- **Data clarity**: ⬆️⬆️⬆️ Much clearer who owes what
- **User confusion**: ⬇️⬇️⬇️ No more "why do I need to enter an amount for a service?"
- **Dispute resolution**: ⬆️⬆️⬆️ Arbiter can easily identify failed obligations
- **Code complexity**: ➡️ Same (just reorganized)

This refinement makes the escrow system **more intuitive and precise** for real-world agreements! 🎉

---

**Last Updated**: October 21, 2025  
**Version**: 3.2.0 (Party-Separated)  
**Status**: ✅ Complete
