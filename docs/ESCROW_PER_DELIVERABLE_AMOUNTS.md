# Escrow Feature - Per-Deliverable Amounts

## Overview

The escrow system now supports **per-deliverable amounts** instead of a single transaction amount. This allows for more granular tracking of value, especially in complex agreements with multiple deliverables.

---

## Key Changes

### Before: Single Transaction Amount

```typescript
{
  title: "Web Development",
  amount: 5000,
  currency: "USD",
  deliverables: [
    { type: "service", description: "Build website" },
    { type: "digital", description: "Provide source code" }
  ]
}
```

**Problem**: Hard to track which deliverable is worth what.

### After: Per-Deliverable Amounts

```typescript
{
  title: "Web Development",
  deliverables: [
    {
      type: "service",
      description: "Build website",
      value: 4000,
      currency: "USD"
    },
    {
      type: "digital",
      description: "Provide source code",
      value: 1000,
      currency: "USD"
    }
  ]
}
```

**Benefits**:

- ✅ Clear value attribution
- ✅ Different currencies per deliverable
- ✅ Optional amounts (some deliverables may be non-monetary)
- ✅ More accurate escrow tracking

---

## Updated Data Structure

### Deliverable Interface

```typescript
export interface Deliverable {
  id: string;
  type: EscrowType;
  description: string;
  quantity?: number;
  value?: number; // Amount for THIS deliverable
  currency?: string; // Currency for THIS deliverable (USD, EUR, etc.)
}
```

### Escrow Interface

```typescript
export interface Escrow {
  // ... other fields

  // REMOVED:
  // amount?: number;
  // currency?: string;

  // Each deliverable has its own value/currency
  deliverables: Deliverable[];
  payment_method?: PaymentMethod; // Applies to all deliverables

  // ... other fields
}
```

---

## Auto-Inference

The system now intelligently assigns amounts to the **correct deliverable** based on context.

### Example 1: Single Amount

**Agreement**:

```
The developer will build a mobile app. The client will pay $5,000 upon completion.
```

**Inferred Deliverables**:

```json
[
  {
    "id": "del-1",
    "type": "service",
    "description": "The developer will build a mobile app",
    "value": null,
    "currency": null
  },
  {
    "id": "del-2",
    "type": "cash",
    "description": "The client will pay $5,000 upon completion",
    "value": 5000,
    "currency": "USD"
  }
]
```

### Example 2: Multiple Amounts

**Agreement**:

```
Seller will deliver:
1. Laptop for $1,200
2. Mouse and keyboard for $50
3. Original receipts

Buyer will pay $1,250 cash upon inspection.
```

**Inferred Deliverables**:

```json
[
  {
    "id": "del-1",
    "type": "item",
    "description": "Laptop for $1,200",
    "value": 1200,
    "currency": "USD"
  },
  {
    "id": "del-2",
    "type": "item",
    "description": "Mouse and keyboard for $50",
    "value": 50,
    "currency": "USD"
  },
  {
    "id": "del-3",
    "type": "document",
    "description": "Original receipts",
    "value": null,
    "currency": null
  },
  {
    "id": "del-4",
    "type": "cash",
    "description": "Buyer will pay $1,250 cash upon inspection",
    "value": 1250,
    "currency": "USD"
  }
]
```

### Example 3: Different Currencies

**Agreement**:

```
Designer will provide logo design for €500 and brand guide for $300.
Client will make payments in respective currencies via bank transfer.
```

**Inferred Deliverables**:

```json
[
  {
    "id": "del-1",
    "type": "digital",
    "description": "logo design for €500",
    "value": 500,
    "currency": "EUR"
  },
  {
    "id": "del-2",
    "type": "document",
    "description": "brand guide for $300",
    "value": 300,
    "currency": "USD"
  }
]
```

---

## UI Changes

### Deliverable Card UI

Each deliverable now has its own value/currency fields:

```
┌─────────────────────────────────────────────┐
│ Deliverable 1                          [×]  │
├─────────────────────────────────────────────┤
│ Type: [Service ▼]  Quantity: [1]          │
│                                             │
│ Description:                                │
│ ┌─────────────────────────────────────────┐│
│ │ Build mobile app with authentication    ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Value (Optional):    Currency:             │
│ ┌─────────────┐     ┌────────┐            │
│ │ 4000.00     │     │ USD ▼  │            │
│ └─────────────┘     └────────┘            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Deliverable 2                          [×]  │
├─────────────────────────────────────────────┤
│ Type: [Digital ▼]  Quantity: [1]          │
│                                             │
│ Description:                                │
│ ┌─────────────────────────────────────────┐│
│ │ Provide source code repository          ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Value (Optional):    Currency:             │
│ ┌─────────────┐     ┌────────┐            │
│ │ 1000.00     │     │ USD ▼  │            │
│ └─────────────┘     └────────┘            │
└─────────────────────────────────────────────┘

Payment Method (applies to all): [Bank Transfer ▼]
```

### Auto-Fill Indication

When amounts are auto-detected:

```
┌─────────────────────────────────────────────┐
│ ✨ Value auto-detected from agreement       │
└─────────────────────────────────────────────┘

Value: [$5,000.00]  Currency: [USD]
       ^^^^^^^^^^ auto-filled
```

---

## Database Schema

### Updated `escrows` Table

```sql
CREATE TABLE escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Transaction details
  title TEXT NOT NULL,
  description TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'digital_wallet', 'other')),

  -- REMOVED:
  -- amount DECIMAL(15, 2)
  -- currency TEXT

  -- Deliverables with individual amounts
  -- Each JSON object: {id, type, description, quantity?, value?, currency?}
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- ... other fields
);
```

### Example JSONB Data

```json
[
  {
    "id": "del-1",
    "type": "service",
    "description": "Complete web application development",
    "quantity": 1,
    "value": 4000,
    "currency": "USD"
  },
  {
    "id": "del-2",
    "type": "digital",
    "description": "Provide source code and documentation",
    "quantity": 1,
    "value": 1000,
    "currency": "USD"
  },
  {
    "id": "del-3",
    "type": "document",
    "description": "Transfer ownership certificates",
    "quantity": 3
    // No value - non-monetary deliverable
  }
]
```

---

## API Changes

### POST `/api/escrow/create`

**Request Body**:

```typescript
{
  title: string,
  description?: string,
  deliverables: Deliverable[],    // Each has optional value/currency
  payment_method?: PaymentMethod,
  expected_completion_date?: string,
  arbiter_required?: boolean,
  arbiter_id?: string,
  agreement_id?: string

  // REMOVED:
  // amount?: number
  // currency?: string
}
```

**Example Request**:

```json
{
  "title": "Freelance Design Work",
  "deliverables": [
    {
      "id": "del-1",
      "type": "digital",
      "description": "Logo design in vector format",
      "value": 500,
      "currency": "USD"
    },
    {
      "id": "del-2",
      "type": "document",
      "description": "Brand style guide PDF",
      "value": 300,
      "currency": "USD"
    }
  ],
  "payment_method": "bank_transfer",
  "agreement_id": "agr-123"
}
```

---

## Use Cases

### 1. Service + Payment

**Scenario**: Web developer provides service, client pays upon completion.

**Deliverables**:

1. Service delivery (no specific value, depends on agreement terms)
2. Payment of $5,000 (has value)

```json
[
  {
    "type": "service",
    "description": "Complete web application",
    "value": null
  },
  {
    "type": "cash",
    "description": "Payment of $5,000 upon completion",
    "value": 5000,
    "currency": "USD"
  }
]
```

### 2. Multiple Items with Different Values

**Scenario**: Selling multiple items as a package.

```json
[
  {
    "type": "item",
    "description": "MacBook Pro 2023",
    "value": 2000,
    "currency": "USD"
  },
  {
    "type": "item",
    "description": "Magic Mouse and Keyboard",
    "value": 150,
    "currency": "USD"
  },
  {
    "type": "item",
    "description": "USB-C cables and adapters",
    "value": 50,
    "currency": "USD"
  }
]

// Total: $2,200 (calculated from sum of deliverables)
```

### 3. International Transaction (Multi-Currency)

**Scenario**: Designer in Europe, client in US, separate invoices.

```json
[
  {
    "type": "digital",
    "description": "UI Design in Figma",
    "value": 1500,
    "currency": "EUR"
  },
  {
    "type": "service",
    "description": "Implementation support (3 days)",
    "value": 1200,
    "currency": "USD"
  }
]

// Payment method: bank_transfer (handles currency conversions)
```

### 4. Non-Monetary Deliverables

**Scenario**: Some deliverables don't have monetary value.

```json
[
  {
    "type": "service",
    "description": "Website development",
    "value": 5000,
    "currency": "USD"
  },
  {
    "type": "document",
    "description": "Project documentation and handover notes",
    "value": null // No monetary value
  },
  {
    "type": "digital",
    "description": "1-year technical support access",
    "value": null // Included in main service
  }
]
```

---

## Calculating Total Value

For display and tracking purposes, you can calculate the total:

```typescript
function calculateTotalEscrowValue(
  deliverables: Deliverable[]
): Map<string, number> {
  const totals = new Map<string, number>();

  deliverables.forEach((deliverable) => {
    if (deliverable.value && deliverable.currency) {
      const current = totals.get(deliverable.currency) || 0;
      totals.set(deliverable.currency, current + deliverable.value);
    }
  });

  return totals;
}
```

**Example**:

```typescript
const deliverables = [
  { value: 1000, currency: 'USD' },
  { value: 500, currency: 'EUR' },
  { value: 2000, currency: 'USD' },
];

const totals = calculateTotalEscrowValue(deliverables);
// Map { 'USD' => 3000, 'EUR' => 500 }

// Display: "Total: $3,000 USD + €500 EUR"
```

---

## Benefits Summary

### 1. **Granular Tracking** 📊

- Know exactly what each deliverable is worth
- Track partial completions
- Calculate escrow releases per deliverable

### 2. **Multi-Currency Support** 🌍

- Each deliverable can have its own currency
- No need to pre-convert everything
- Support international agreements naturally

### 3. **Flexibility** 🔧

- Optional amounts (some deliverables are non-monetary)
- Mix monetary and non-monetary obligations
- Clear value attribution

### 4. **Better Auto-Inference** 🧠

- System extracts amounts from the right context
- Matches amounts to specific deliverables
- More accurate parsing

### 5. **Clearer Disputes** ⚖️

- Arbiter can release funds per-deliverable
- Partial dispute resolution
- Fair compensation for partial completion

---

## Migration Notes

### For Existing Code

If you have existing escrow code using top-level amounts:

**Before**:

```typescript
const escrow = {
  amount: 5000,
  currency: 'USD',
  deliverables: [...]
};
```

**After**:

```typescript
const escrow = {
  deliverables: [
    {
      ...,
      value: 5000,
      currency: 'USD'
    }
  ]
};
```

### Database Migration

The migration automatically handles the schema change. No manual data migration needed for new escrows.

---

## Testing

### Test Case 1: Single Deliverable with Amount

```typescript
const agreement = 'Developer will create app for $5,000';
const deliverables = parseDeliverablesFromAgreement(agreement);

expect(deliverables).toHaveLength(1);
expect(deliverables[0].value).toBe(5000);
expect(deliverables[0].currency).toBe('USD');
```

### Test Case 2: Multiple Deliverables with Different Amounts

```typescript
const agreement = 'Seller will deliver laptop for $1,200 and mouse for $50';
const deliverables = parseDeliverablesFromAgreement(agreement);

expect(deliverables).toHaveLength(2);
expect(deliverables[0].value).toBe(1200);
expect(deliverables[1].value).toBe(50);
```

### Test Case 3: No Amount (Non-Monetary)

```typescript
const agreement = 'Developer will provide source code and documentation';
const deliverables = parseDeliverablesFromAgreement(agreement);

expect(deliverables[0].value).toBeUndefined();
expect(deliverables[0].currency).toBeUndefined();
```

---

## Summary

The per-deliverable amount system provides:

- ✅ **Granular value tracking**
- ✅ **Multi-currency support**
- ✅ **Optional amounts** (non-monetary deliverables)
- ✅ **Better auto-inference**
- ✅ **Clearer escrow management**
- ✅ **More flexible agreements**

This makes the escrow system **more powerful and accurate** for complex, real-world agreements!

---

**Last Updated**: October 21, 2025  
**Version**: 3.1.0 (Per-Deliverable Amounts)  
**Status**: ✅ Complete
