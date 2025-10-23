# Escrow Components

A comprehensive collection of UI components for the Sabot Escrow feature.

## Quick Start

```tsx
import {
  EscrowDetailsCard,
  EscrowStatusBadge,
  EscrowTimeline,
  ConfirmCompletionModal,
  RequestArbiterModal,
  CreateEscrowForm,
  EnableEscrowButton,
} from '@/components/escrow';
```

## Components

### EscrowStatusBadge

Displays a colored badge indicating the current escrow status.

```tsx
import { EscrowStatusBadge } from '@/components/escrow/escrow-status-badge';

<EscrowStatusBadge status="active" size="md" />;
```

**Props:**

- `status`: `EscrowStatus` - Current escrow status
- `size?`: `'sm' | 'md' | 'lg'` - Badge size (default: 'md')

**Statuses:**

- `pending` - Waiting for participant
- `active` - Transaction in progress
- `awaiting_confirmation` - One party confirmed
- `completed` - Both parties confirmed
- `disputed` - Dispute raised
- `arbiter_review` - Arbiter reviewing
- `cancelled` - Transaction cancelled
- `expired` - Escrow expired

---

### EscrowDetailsCard

Comprehensive card displaying all escrow information.

```tsx
import { EscrowDetailsCard } from '@/components/escrow/escrow-details-card';

<EscrowDetailsCard
  escrow={escrowWithParticipants}
  currentUserRole="initiator"
/>;
```

**Props:**

- `escrow`: `EscrowWithParticipants` - Escrow data with participant info
- `currentUserRole?`: `'initiator' | 'participant'` - Current user's role

**Displays:**

- Transaction details (amount, deliverables, dates)
- Party information with verification badges
- Confirmation status for both parties
- Arbiter information (if applicable)
- Timeline information
- Verification requirements

---

### EscrowTimeline

Chronological timeline of escrow events.

```tsx
import { EscrowTimeline } from '@/components/escrow/escrow-timeline';

<EscrowTimeline events={escrowEvents} />;
```

**Props:**

- `events`: `EscrowEvent[]` - Array of escrow events

**Features:**

- Sorted chronologically (newest first)
- Color-coded event types
- Event icons
- Detailed event information
- Notes and additional details

---

### ConfirmCompletionModal

Modal for confirming escrow completion.

```tsx
import { ConfirmCompletionModal } from '@/components/escrow/confirm-completion-modal';

const [open, setOpen] = useState(false);

const handleConfirm = async (notes?: string) => {
  await fetch('/api/escrow/confirm', {
    method: 'POST',
    body: JSON.stringify({
      escrow_id: escrowId,
      confirmation_notes: notes,
    }),
  });
};

<ConfirmCompletionModal
  open={open}
  onOpenChange={setOpen}
  onConfirm={handleConfirm}
  escrowTitle="Laptop Purchase Escrow"
  isOtherPartyConfirmed={false}
/>;
```

**Props:**

- `open`: `boolean` - Modal open state
- `onOpenChange`: `(open: boolean) => void` - Open state handler
- `onConfirm`: `(notes?: string) => Promise<void>` - Confirm handler
- `escrowTitle`: `string` - Title for display
- `isOtherPartyConfirmed`: `boolean` - Whether other party confirmed

**Features:**

- Optional confirmation notes
- Different messaging based on other party's status
- Loading states
- Error handling
- Warning about consequences

---

### RequestArbiterModal

Modal for requesting arbiter intervention.

```tsx
import { RequestArbiterModal } from '@/components/escrow/request-arbiter-modal';

const [open, setOpen] = useState(false);

const handleRequest = async (reason: string, details: string) => {
  await fetch('/api/escrow/request-arbiter', {
    method: 'POST',
    body: JSON.stringify({
      escrow_id: escrowId,
      dispute_reason: reason,
      dispute_details: details,
    }),
  });
};

<RequestArbiterModal
  open={open}
  onOpenChange={setOpen}
  onRequest={handleRequest}
  escrowTitle="Laptop Purchase Escrow"
/>;
```

**Props:**

- `open`: `boolean` - Modal open state
- `onOpenChange`: `(open: boolean) => void` - Open state handler
- `onRequest`: `(reason: string, details: string) => Promise<void>` - Request handler
- `escrowTitle`: `string` - Title for display

**Features:**

- Predefined dispute reasons
- Detailed explanation field
- Validation (minimum 20 characters)
- Important notices about arbiter process
- Loading states
- Error handling

**Dispute Reasons:**

- Non-delivery
- Incorrect/misrepresented item
- Quality issues
- Incomplete service
- Terms violation
- Suspected fraud
- Other

---

### CreateEscrowForm

Complete form for creating a new escrow.

```tsx
import { CreateEscrowForm } from '@/components/escrow/create-escrow-form';

<CreateEscrowForm />;
```

**No props required** - Handles all state internally and redirects on success.

**Features:**

- Escrow type selection (cash, item, service, digital, document, mixed)
- Title and description inputs
- Amount and currency selection
- Deliverable description
- Expected completion date
- Verification requirement toggle
- Optional participant invitation
- Form validation
- Success state with redirect
- Error handling

**Form Fields:**

- **Type\*** (required): Select escrow type
- **Title\*** (required): Escrow title
- **Description** (optional): Additional context
- **Amount** (optional): Transaction amount
- **Currency** (optional): Default USD
- **Deliverable Description\*** (required): What needs to be delivered
- **Expected Completion Date** (optional): When deliverable is expected
- **Require Verification** (toggle): Whether to require identity verification
- **Participant Email** (optional): Invite specific participant

---

### EnableEscrowButton

Button to enable escrow protection for transactions/agreements.

```tsx
import { EnableEscrowButton } from '@/components/escrow/enable-escrow-button';

// For a transaction
<EnableEscrowButton transactionId={transactionId} />

// For an agreement
<EnableEscrowButton agreementId={agreementId} />

// Standalone
<EnableEscrowButton variant="default" size="lg" />
```

**Props:**

- `transactionId?`: `string` - Transaction ID to link
- `agreementId?`: `string` - Agreement ID to link
- `variant?`: `'default' | 'outline' | 'secondary' | 'ghost'` - Button variant
- `size?`: `'default' | 'sm' | 'lg' | 'icon'` - Button size
- `className?`: `string` - Additional CSS classes

**Features:**

- Dialog explaining escrow benefits
- Automatic redirect with context
- Loading states
- Benefits list
- Context preservation (transaction/agreement ID)

---

## Usage Examples

### Complete Escrow Detail Page

```tsx
'use client';

import { useEffect, useState } from 'react';
import {
  EscrowDetailsCard,
  EscrowTimeline,
  EscrowStatusBadge,
  ConfirmCompletionModal,
  RequestArbiterModal,
} from '@/components/escrow';
import { Button } from '@/components/ui/button';

export default function EscrowPage({ params }) {
  const [data, setData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [arbiterOpen, setArbiterOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/escrow/${params.id}/status`)
      .then((res) => res.json())
      .then(setData);
  }, [params.id]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <EscrowStatusBadge status={data.escrow.status} />

      <EscrowDetailsCard
        escrow={data.escrow}
        currentUserRole={data.current_user_role}
      />

      {data.can_confirm && (
        <Button onClick={() => setConfirmOpen(true)}>Confirm Completion</Button>
      )}

      {data.can_dispute && (
        <Button onClick={() => setArbiterOpen(true)}>Request Arbiter</Button>
      )}

      <EscrowTimeline events={data.events} />

      <ConfirmCompletionModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
        escrowTitle={data.escrow.title}
        isOtherPartyConfirmed={checkOtherPartyStatus()}
      />

      <RequestArbiterModal
        open={arbiterOpen}
        onOpenChange={setArbiterOpen}
        onRequest={handleRequestArbiter}
        escrowTitle={data.escrow.title}
      />
    </div>
  );
}
```

### Adding Escrow to Transaction Page

```tsx
import { EnableEscrowButton } from '@/components/escrow/enable-escrow-button';

export default function TransactionPage({ transaction }) {
  return (
    <div>
      {/* Transaction details */}

      <div className="mt-4">
        <EnableEscrowButton transactionId={transaction.id} variant="outline" />
      </div>
    </div>
  );
}
```

### Creating Escrow from Scratch

```tsx
import { CreateEscrowForm } from '@/components/escrow/create-escrow-form';

export default function NewEscrowPage() {
  return (
    <div className="container max-w-2xl py-8">
      <CreateEscrowForm />
    </div>
  );
}
```

---

## Styling

All components use Tailwind CSS and Shadcn UI components, ensuring:

- Consistent design language
- Dark mode support
- Responsive layouts
- Accessible color contrasts
- Mobile-first approach

### Customization

Components accept `className` props for additional styling:

```tsx
<EnableEscrowButton className="mt-4 w-full" variant="outline" />
```

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- Semantic HTML
- ARIA labels where appropriate
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast compliance

---

## Best Practices

### Error Handling

Always wrap API calls in try-catch:

```tsx
const handleConfirm = async (notes?: string) => {
  try {
    await confirmEscrow(escrowId, notes);
    toast.success('Confirmed successfully');
  } catch (error) {
    toast.error(error.message);
    throw error; // Re-throw for modal to handle
  }
};
```

### Loading States

Show loading indicators during async operations:

```tsx
{
  isLoading ? (
    <Skeleton className="h-64 w-full" />
  ) : (
    <EscrowDetailsCard escrow={data.escrow} />
  );
}
```

### Type Safety

Always use TypeScript types:

```tsx
import type {
  EscrowWithParticipants,
  EscrowEvent,
  EscrowStatus,
} from '@/types/escrow';
```

---

## Testing

Example test for escrow components:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EscrowStatusBadge } from './escrow-status-badge';

describe('EscrowStatusBadge', () => {
  it('renders correct status', () => {
    render(<EscrowStatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies correct variant for completed status', () => {
    const { container } = render(<EscrowStatusBadge status="completed" />);
    expect(container.firstChild).toHaveClass('bg-green');
  });
});
```

---

## Support

For issues or questions:

1. Check the main [Escrow Feature Documentation](../../../docs/ESCROW_FEATURE.md)
2. Review [Component Documentation](../../../docs/components.md)
3. Open an issue on GitHub
4. Contact: dev@sabot.app

---

**Last Updated**: October 21, 2025
**Version**: 1.0.0
