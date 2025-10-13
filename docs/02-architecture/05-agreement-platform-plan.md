# Collaborative Agreement Platform - Implementation Plan

## Project Overview

Transform Sabot into a collaborative document creation platform for Memorandum of Agreements (MOA) with real-time editing, AI assistance, and Spotify-inspired dark green theme.

**Status**: Frontend-first approach - Building UI/UX before implementing backend functionalities

---

## Phase 1: Frontend Development (Current Phase)

### Goal

Create all UI pages and components with mock data and placeholder interactions. Focus on visual design, layout, and user flow without backend integration.

---

## Agreement Route Structure (Mirroring Transaction Pattern)

```
src/app/agreement/
├── new/page.tsx           # Create agreement & generate invite link
├── invite/page.tsx        # Join agreement via link (3-step flow)
├── [id]/page.tsx         # View/edit agreement with carousel sections
├── [id]/active/page.tsx  # Real-time collaborative editor
└── [id]/finalize/page.tsx # Confirmation & signature page
```

---

## Agreement Components Structure

```
src/components/agreement/
├── new/
│   ├── agreement-link.tsx      # Share link component
│   └── agreement-progress.tsx  # Progress indicator
├── invite/
│   ├── review-invitation.tsx   # Step 1: Review invite
│   ├── select-template.tsx     # Step 2: Choose MOA template
│   └── user-verification.tsx   # Step 3: Verify identity
├── id/
│   ├── document-structure.tsx  # Block-based sections
│   ├── parties-info.tsx        # Party details card
│   ├── ai-suggestions.tsx      # AI clause recommendations
│   └── agreement-details.tsx   # Terms & conditions
└── editor/
    ├── collaborative-editor.tsx # Real-time editing (BlockNote + Yjs)
    ├── cursor-overlay.tsx       # Multi-user cursors
    ├── block-menu.tsx           # Drag/drop block interface
    └── ai-assistant.tsx         # Grammar/clause suggestions
```

---

## Page-by-Page Breakdown

### 1. `/agreement/new` (Create Agreement)

**Purpose**: Generate unique shareable link and invite counterparty

**UI Elements**:

- Card with title "Create New Agreement"
- Generated link display (with copy button)
- Email invitation dialog
- "Waiting for other party..." loading state
- Warning banner about verification requirements

**Mock Data**:

```typescript
const AGREEMENT_LINK = 'http://localhost:3000/agreement/invite/xyz789';
const [copied, setCopied] = useState(false);
const [dialogOpen, setDialogOpen] = useState(false);
```

**User Flow**:

1. Page loads with auto-generated link
2. User copies link OR opens email dialog
3. Shows loading state while waiting for counterparty
4. (Future: Redirect to `/agreement/[id]` when both parties join)

---

### 2. `/agreement/invite` (Join Agreement)

**Purpose**: Multi-step onboarding for invited party

**UI Elements**:

- Card with step indicator (Step 1/3, 2/3, 3/3)
- Three sequential steps with smooth transitions

**Step 1: Review Invitation**

- Display inviter's name/email
- Agreement type preview
- "Accept" and "Decline" buttons

**Step 2: Select Template**

- Grid of MOA templates:
  - Partnership Agreement
  - Service Agreement
  - Non-Disclosure Agreement (NDA)
  - Sales Agreement
  - Custom Agreement
- Template cards with icons and descriptions
- "Continue" button

**Step 3: User Verification**

- Reuse existing verification component from transactions
- Shows verification status
- Redirect to `/agreement/[id]` on completion

**Mock Data**:

```typescript
const inviterEmail = 'john@example.com';
const [step, setStep] = useState<'review' | 'template' | 'verification'>(
  'review'
);
const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
```

---

### 3. `/agreement/[id]` (Agreement Overview)

**Purpose**: Carousel view of agreement sections before entering editor

**UI Elements**:

- Top progress bar (1/4, 2/4, etc.)
- Carousel with 4 sections:
  1. **Parties Info**: Both parties with avatars, verification badges, trust scores
  2. **Document Structure**: Block-based outline of agreement sections
  3. **AI Suggestions**: Recommended clauses based on template
  4. **Agreement Details**: Terms, duration, payment obligations
- Bottom navigation: Previous/Next buttons
- Footer with "Enter Collaborative Editor" button

**Mock Data**:

```typescript
const mockAgreement = {
  id: 'AGR-2025-001',
  type: 'Partnership Agreement',
  parties: [
    {
      name: 'John Doe',
      email: 'john@example.com',
      verified: true,
      color: '#1DB954',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      verified: true,
      color: '#FF6B6B',
    },
  ],
  sections: ['Preamble', 'Definitions', 'Terms', 'Obligations', 'Signatures'],
  status: 'draft',
};
```

**Carousel Sections**:

- Section 1: `<PartiesInfoCard parties={mockAgreement.parties} />`
- Section 2: `<DocumentStructureCard sections={mockAgreement.sections} />`
- Section 3: `<AISuggestionsCard suggestions={mockSuggestions} />`
- Section 4: `<AgreementDetailsCard agreement={mockAgreement} />`

---

### 4. `/agreement/[id]/active` (Collaborative Editor)

**Purpose**: Real-time block-based collaborative editing

**UI Elements**:

**Header**:

- Back to overview button
- Agreement title
- Avatars of both parties (with online status)
- "AI Assistant" toggle button
- "Ready to Finalize" button

**Main Editor Area**:

- Block-based editor (mimicking Notion)
- Each block has:
  - Drag handle (⋮⋮) on left
  - Content area (rich text)
  - Block menu (+ button for adding blocks)
- Block types:
  - Heading (H1, H2, H3)
  - Paragraph
  - Numbered List
  - Bullet List
  - Quote
  - Divider

**Cursor Overlay**:

- Colored cursors for each party
- Name tags following cursor
- Avatar bubbles at current editing position
- Smooth animations (150-300ms transitions)

**AI Assistant Panel (Collapsible Sidebar)**:

- Grammar suggestions with inline corrections
- "Suggest Clause" button
- Risk indicators (yellow warning icons)
- Plain-English explanations on hover

**Mock Data**:

```typescript
const mockParties = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    color: '#1DB954',
    isOnline: true,
    cursor: { x: 0, y: 0 },
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    color: '#FF6B6B',
    isOnline: true,
    cursor: { x: 0, y: 0 },
  },
];

const mockBlocks = [
  { id: '1', type: 'heading', level: 1, content: 'Partnership Agreement' },
  { id: '2', type: 'paragraph', content: 'This agreement is entered into...' },
  // etc.
];
```

**Interaction States** (Mock Behaviors):

- Click drag handle → Block outline appears
- Drag block → Ghost preview shows drop position
- Type in block → Show typing indicator for other party
- Click "AI Suggest" → Mock suggestions appear
- Hover over suggestion → Tooltip with explanation

**Note**: Real-time sync will be implemented in Phase 2. For now, use local state with mock cursor positions.

---

### 5. `/agreement/[id]/finalize` (Confirmation & Signature)

**Purpose**: Preview final document and get both parties' confirmation

**Reference**: Use the provided source code as the base template

**UI Elements**:

**Header**:

- Back to editor link
- Title: "Finalize Agreement"
- Avatar status indicators (with checkmarks when confirmed)

**Status Banners**:

- "Waiting for other parties..." (yellow, with spinner)
- "Agreement Finalized!" (green, with checkmark)

**Document Preview**:

- PDF-style card with professional formatting
- Sections:
  - Title & Effective Date
  - Preamble
  - Definitions
  - Terms and Conditions (numbered)
  - Signatures (grid of parties with confirmation status)

**Action Buttons** (if not confirmed):

- "Cancel" button (outline variant)
- "Confirm Agreement" button (primary variant)

**Party Status Card**:

- List of all parties
- Avatar + name + email
- "Confirmed" badge or "Pending" text

**Mock Data**:

```typescript
const mockParties: Party[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    color: '#1DB954',
    hasConfirmed: false,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    color: '#FF6B6B',
    hasConfirmed: false,
  },
];

const [currentUserConfirmed, setCurrentUserConfirmed] = useState(false);
const currentUserId = '1'; // Mock current user
```

**User Flow**:

1. User reviews document preview
2. Clicks "Confirm Agreement"
3. Shows "Waiting for other parties..." banner
4. (Mock) Simulate other party confirming after 3 seconds
5. Shows "Agreement Finalized!" banner
6. (Future) Enable PDF download

---

## Design System: Spotify-Inspired Dark Green Theme

### Color Palette

**Primary Colors**:

- **Spotify Green**: `#1DB954` (primary buttons, accents, success states)
- **Dark Background**: `#121212` (main background)
- **Card Background**: `#181818` (elevated surfaces)
- **Border**: `#282828` (subtle borders)

**Text Colors**:

- **Primary Text**: `#FFFFFF` (headings, important text)
- **Secondary Text**: `#B3B3B3` (descriptions, labels)
- **Muted Text**: `#6B6B6B` (placeholders, disabled)

**Accent Colors**:

- **Blue**: `#509BF5` (links, info states)
- **Red**: `#FF6B6B` (errors, warnings)
- **Yellow**: `#FFA724` (caution, pending states)
- **Purple**: `#9B59B6` (AI assistant, suggestions)

### Component Styling (Tailwind CSS v4)

**Buttons**:

```css
/* Primary */
bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold rounded-full

/* Outline */
border-2 border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954]/10 rounded-full

/* Ghost */
text-[#B3B3B3] hover:text-white hover:bg-white/5 rounded-full
```

**Cards**:

```css
bg-[#181818] border border-[#282828] rounded-lg shadow-lg
hover:border-[#1DB954]/30 transition-all duration-200
```

**Inputs**:

```css
bg-[#121212] border border-[#282828] text-white rounded-lg
focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/20
placeholder:text-[#6B6B6B]
```

**Avatars**:

```css
border-2 border-[#1DB954] rounded-full
/* Online indicator */
after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3
after:bg-[#1DB954] after:rounded-full after:border-2 after:border-[#181818]
```

### Typography

**Font Family**: Use system font stack (already in Tailwind config)

**Sizes**:

- H1: `text-3xl font-bold` (Agreement titles)
- H2: `text-xl font-semibold` (Section headings)
- H3: `text-lg font-medium` (Subsections)
- Body: `text-sm` (Regular text)
- Caption: `text-xs text-[#B3B3B3]` (Labels, timestamps)

### Animations

**Durations** (per design principles):

- Micro-interactions: `150ms`
- Standard transitions: `200ms`
- Page transitions: `300ms`

**Examples**:

```css
/* Hover states */
transition-colors duration-200

/* Cursor movements */
transition-transform duration-150 ease-out

/* Loading spinners */
animate-spin

/* Success checkmarks */
animate-in fade-in duration-200
```

---

## Mock Data Structure

### Agreement Object

```typescript
interface Agreement {
  id: string;
  type: 'Partnership' | 'Service' | 'NDA' | 'Sales' | 'Custom';
  title: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'finalized' | 'signed';
  parties: Party[];
  sections: Section[];
  aiSuggestions: AISuggestion[];
}

interface Party {
  id: string;
  name: string;
  email: string;
  color: string; // Hex color for cursor/avatar
  verified: boolean;
  hasConfirmed?: boolean;
  isOnline?: boolean;
  cursor?: { x: number; y: number };
}

interface Section {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'quote';
  level?: 1 | 2 | 3; // For headings
  content: string;
  order: number;
}

interface AISuggestion {
  id: string;
  type: 'grammar' | 'clause' | 'risk' | 'improvement';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestedText?: string;
  location: { sectionId: string; position: number };
}
```

### Mock Data Files

Create `src/lib/mock-data/agreements.ts`:

```typescript
export const mockAgreements: Agreement[] = [
  {
    id: 'AGR-2025-001',
    type: 'Partnership',
    title: 'Partnership Agreement',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    status: 'draft',
    parties: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        color: '#1DB954',
        verified: true,
        isOnline: true,
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        color: '#FF6B6B',
        verified: true,
        isOnline: true,
      },
    ],
    sections: [
      {
        id: 's1',
        type: 'heading',
        level: 1,
        content: 'Partnership Agreement',
        order: 1,
      },
      {
        id: 's2',
        type: 'paragraph',
        content: 'This agreement is entered into...',
        order: 2,
      },
      // More sections...
    ],
    aiSuggestions: [
      {
        id: 'sug1',
        type: 'clause',
        severity: 'medium',
        title: 'Add Force Majeure Clause',
        description:
          'Consider adding a force majeure clause to protect both parties from unforeseen circumstances.',
        location: { sectionId: 's5', position: 10 },
      },
    ],
  },
];
```

---

## Dependencies to Install (Phase 2)

**Not needed for frontend-only development**, but documented here for future reference:

```bash
# Real-time collaboration
bun add @blocknote/core @blocknote/react
bun add yjs y-websocket
bun add @liveblocks/client @liveblocks/react

# PDF generation
bun add jspdf

# Additional utilities
bun add date-fns # For date formatting
bun add react-beautiful-dnd # For drag-and-drop (if not using BlockNote's built-in)
```

---

## Routes Configuration

Add to `src/constants/routes.ts`:

```typescript
export const ROUTES = {
  // ... existing routes
  AGREEMENT: {
    NEW: '/agreement/new',
    INVITE: '/agreement/invite',
    VIEW: (id: string) => `/agreement/${id}`,
    ACTIVE: (id: string) => `/agreement/${id}/active`,
    FINALIZE: (id: string) => `/agreement/${id}/finalize`,
  },
};
```

---

## Component Reusability

### From Transaction Components (Reuse/Adapt):

- `TransactionProgress` → `AgreementProgress` (update colors/labels)
- `TransactionCarousel` → `AgreementCarousel` (same carousel logic)
- `ReviewInvitation` → Reuse with prop changes
- `UserVerification` → Reuse directly

### New Agreement-Specific Components:

- `AgreementLink` (similar to TransactionLink)
- `SelectTemplate` (new: grid of template cards)
- `PartiesInfoCard` (similar to SellerInfoCard but for both parties)
- `DocumentStructureCard` (new: outline view)
- `AISuggestionsCard` (new: list of recommendations)
- `CollaborativeEditor` (new: BlockNote integration)
- `CursorOverlay` (new: real-time cursor tracking)
- `AgreementDetailsCard` (similar to TransactionDetails)

---

## Implementation Checklist (Frontend Phase)

### Step 1: Setup

- [x] Create AGREEMENT_PLATFORM_PLAN.md (this file)
- [ ] Update `src/constants/routes.ts`
- [ ] Create folder structure (`src/app/agreement/...`)
- [ ] Create folder structure (`src/components/agreement/...`)
- [ ] Create `src/lib/mock-data/agreements.ts`

### Step 2: Page Development (Sequential Order)

#### `/agreement/new`

- [ ] Create `src/app/agreement/new/page.tsx`
- [ ] Create `src/components/agreement/new/agreement-link.tsx`
- [ ] Create `src/components/agreement/new/agreement-progress.tsx`
- [ ] Test: Link generation, copy functionality, email dialog

#### `/agreement/invite`

- [ ] Create `src/app/agreement/invite/page.tsx`
- [ ] Create `src/components/agreement/invite/review-invitation.tsx`
- [ ] Create `src/components/agreement/invite/select-template.tsx`
- [ ] Reuse `src/components/transaction/invite/user-verification.tsx`
- [ ] Test: 3-step flow, template selection, transitions

#### `/agreement/[id]`

- [ ] Create `src/app/agreement/[id]/page.tsx`
- [ ] Create `src/components/agreement/id/parties-info.tsx`
- [ ] Create `src/components/agreement/id/document-structure.tsx`
- [ ] Create `src/components/agreement/id/ai-suggestions.tsx`
- [ ] Create `src/components/agreement/id/agreement-details.tsx`
- [ ] Test: Carousel navigation, section transitions, data display

#### `/agreement/[id]/active`

- [ ] Create `src/app/agreement/[id]/active/page.tsx`
- [ ] Create `src/components/agreement/editor/collaborative-editor.tsx`
- [ ] Create `src/components/agreement/editor/cursor-overlay.tsx`
- [ ] Create `src/components/agreement/editor/block-menu.tsx`
- [ ] Create `src/components/agreement/editor/ai-assistant.tsx`
- [ ] Test: Block manipulation, drag-drop UI, cursor mock, AI panel

#### `/agreement/[id]/finalize`

- [ ] Create `src/app/agreement/[id]/finalize/page.tsx`
- [ ] Test: Confirmation flow, party status updates, document preview

### Step 3: Styling & Polish

- [ ] Apply Spotify dark green theme across all agreement pages
- [ ] Verify responsive design (mobile, tablet, desktop)
- [ ] Add micro-interactions (hover states, transitions)
- [ ] Test accessibility (keyboard navigation, ARIA labels)

### Step 4: Documentation

- [ ] Update `PRODUCT_VISION.md` with agreement platform vision
- [ ] Update `CLAUDE.md` with agreement architecture
- [ ] Add comments to complex components
- [ ] Create component usage examples

### Step 5: Visual Testing

- [ ] Quick visual check on all pages
- [ ] Comprehensive design review (if needed)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

---

## Future Phases (Not Implemented Yet)

### Phase 2: Backend Integration

- Set up PostgreSQL schema for agreements
- Implement authentication/verification checks
- Create API routes for CRUD operations
- Add real-time WebSocket server (y-websocket)

### Phase 3: Real-Time Collaboration

- Integrate BlockNote with Yjs CRDT
- Implement Liveblocks for cursor presence
- Add conflict resolution logic
- Build auto-save mechanism

### Phase 4: AI Integration

- Connect to AI service (OpenAI/Anthropic)
- Implement grammar checking
- Build clause suggestion engine
- Add risk analysis features

### Phase 5: PDF & Signatures

- Implement jsPDF generation
- Add e-signature functionality
- Create blockchain hash storage
- Build email notification system

---

## Reference: Existing Transaction Structure (For Comparison)

```
src/app/transaction/
├── new/page.tsx           ✓ Existing
├── invite/page.tsx        ✓ Existing
├── [id]/page.tsx          ✓ Existing
└── [id]/active/page.tsx   ✓ Existing

src/components/transaction/
├── new/
│   ├── transaction-link.tsx         ✓ Reuse pattern
│   ├── transaction-progress.tsx     ✓ Reuse pattern
│   └── transaction-carousel.tsx     ✓ Reuse pattern
├── invite/
│   ├── review-invitation.tsx        ✓ Reuse with modifications
│   ├── upload-screenshot.tsx        ✗ Not needed for agreements
│   └── user-verification.tsx        ✓ Reuse directly
└── id/
    ├── product-info.tsx             → parties-info.tsx (adapt)
    ├── seller-info.tsx              → parties-info.tsx (adapt)
    ├── ai-changes.tsx               → ai-suggestions.tsx (adapt)
    └── transaction-details.tsx      → agreement-details.tsx (adapt)
```

---

## Key Differences: Transaction vs Agreement

| Feature         | Transaction                                                   | Agreement                                                |
| --------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| **Purpose**     | Track P2P marketplace transactions                            | Collaborative document creation                          |
| **Parties**     | Buyer & Seller                                                | Party A & Party B (equal roles)                          |
| **Main Flow**   | Upload screenshots → AI analysis → Active mode → Confirmation | Select template → Edit collaboratively → Finalize → Sign |
| **AI Role**     | Detect fraud, analyze conversations                           | Suggest clauses, check grammar, assess risk              |
| **Active Mode** | Location tracking, emergency contacts                         | Real-time document editing                               |
| **End State**   | Transaction completed, grace period                           | Agreement signed, PDF download                           |

---

## Design Inspiration Sources

Based on research, inspired by:

1. **Google Docs**: Real-time cursor visibility, character-by-character updates
2. **Notion**: Block-based drag-and-drop, clean interface
3. **Figma**: Smooth cursor animations, presence indicators
4. **Spotify**: Dark green theme, modern card layouts, rounded buttons
5. **DocuSign**: Signature confirmation flow, party status tracking
6. **Linear**: Minimalist design, smooth transitions, excellent UX

---

## Success Criteria (Frontend Phase)

**Definition of Done**:

- [ ] All 5 pages render without errors
- [ ] Mock data displays correctly
- [ ] User can navigate through full flow (new → invite → [id] → active → finalize)
- [ ] Spotify dark green theme applied consistently
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1440px)
- [ ] No console errors or warnings
- [ ] Documentation updated (PRODUCT_VISION.md, CLAUDE.md, routes.ts)
- [ ] Code follows existing patterns (uses shadcn/ui, Tailwind v4, Next.js 15)

---

## Contact & Support

For questions about this plan, refer to:

- **Project Documentation**: [CLAUDE.md](./CLAUDE.md)
- **Design Principles**: [/context/design-principles.md](/context/design-principles.md)
- **Product Vision**: [PRODUCT_VISION.md](./PRODUCT_VISION.md)

---

**Last Updated**: 2025-01-17
**Status**: Frontend development phase
**Next Milestone**: Complete all 5 page implementations with mock data
