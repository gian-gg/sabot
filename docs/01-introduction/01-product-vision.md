# Sabot - Product Vision

## Overview

**Sabot** is a dual-purpose platform offering:

1. **Trust & Safety for P2P Transactions**: Protect peer-to-peer marketplace transactions with AI-powered fraud detection, identity verification, and real-time safety monitoring
2. **Collaborative Agreement Creation**: Enable parties to draft, edit, and finalize legally binding agreements (MOAs, contracts, NDAs) in real-time with AI assistance

## Core Missions

### Transaction Safety

Enable safe, transparent, and verified transactions between strangers on online marketplaces by providing blockchain-like transaction transparency, AI-powered fraud detection, and real-time safety features.

### Agreement Collaboration

Empower individuals and businesses to create professional, legally sound agreements through real-time collaborative editing, AI-powered clause suggestions, and blockchain-verified signatures.

---

## Platform Features - Part A: Transaction Safety

---

## Platform Features

### 1. User Onboarding & Verification

- **Authentication**: Supabase Auth
- Secure session management

**Homepage - Public Transaction Ledger**
The homepage functions as a blockchain-style public feed displaying all confirmed transactions:

- Unique Transaction ID
- Transaction type (electronics, services, fashion, etc.)
- Blurred names of verified buyer & seller (privacy-protected)
- Timestamp

**Trust Score System**

- Each successful transaction contributes to a user's Trust Score
- Trust Score measures reliability and verified transaction history
- **Critical**: Trust Score is **only visible to buyers** viewing a seller's profile
- Not visible to sellers themselves (prevents manipulation)
- Helps buyers assess seller credibility through verified transaction patterns

**Verification Requirements**
Users must complete verification to access full platform features:

1. **Government ID Upload** - OCR-verified for authenticity
2. **Live Face Recognition** - Face match against uploaded ID
3. **Verified Status** - Unlocks transaction and AI security features

---

### 2. Invite Counterparty

**Transaction Link Generation**

- Either party (buyer or seller) can generate a unique Sabot transaction link
- Link can be shared via external platforms (Facebook Marketplace, Carousell, Instagram, etc.)

**Access Control Logic**
When an invitation link is opened:

- **Unauthenticated users**: Prompt to sign in
  - Display: _"Sign in to engage in a transaction."_

- **Authenticated but unverified users**: Prompt to complete verification
  - Display: _"Get verified to engage in a transaction."_

- **Both users must be verified** before proceeding to Transaction Preview Mode

---

### 3. Transaction Preview & AI Summary

**Upload Phase**

- Both parties upload screenshots of their conversation from the original platform
- AI automatically detects platform type based on text and visual patterns
- Each user can see if counterpart has uploaded (but cannot view the screenshots directly)
- Ensures confidentiality while maintaining transparency

**AI Processing Phase**
AI cross-references both conversation uploads to:

- Detect edited or mismatched message threads
- Identify missing messages or inconsistencies
- Highlight specific discrepancies

**Inconsistency Handling**
If discrepancies are found:

- System highlights specific messages missing on either side
- Transaction summary generation pauses
- Both parties must re-upload correct/complete data

**AI Summary Generation**
Once screenshots are validated, AI generates a structured summary:

- Item or service description
- Agreed price
- Delivery or meetup details
- Warranties or conditions mentioned
- Identified platform (used for Market Comparison)

---

### 4. AI Market Comparison

**Timing**: Appears immediately after AI Summary and before Transaction Confirmation

**Process**

- AI identifies the platform from uploaded screenshots
- Analyzes current listings from the same platform
- Assesses pricing trends and potential scam indicators

**AI Insight Panel Displays**

- Market-average price for similar listings
- Percentage difference between current deal and market average
- Contextual advisory notes

**Example Advisory**

> _"Average price for similar gadgets on Facebook Marketplace: ₱18,000. Current offer: ₱12,000 — 33% below average, potential scam indicator."_

**Purpose**: Ensures users evaluate fairness and safety before confirming transaction details

---

### 5. Safety Suggestions

**Interactive Suggestion System**
AI generates contextual safety suggestions based on transaction analysis:

- "Ask for warranty"
- "Request live demo"
- "Confirm delivery method"
- Custom suggestions based on transaction type

**Acknowledgment Interface**
Each suggestion displays two light bulbs:

- 💡 **Left bulb** = Buyer acknowledgment
- 💡 **Right bulb** = Seller acknowledgment

**Flow**

1. One party agrees → their bulb glows
2. Both parties agree → both bulbs glow
3. Agreed suggestions move from **"Suggestion Tab"** to **"Transaction Details Tab"**
4. Marked as mutually agreed safety conditions

---

### 6. Transaction Mode

**Activation Requirements**

- Both parties completed verification
- AI review steps completed
- Transaction summary confirmed
- Required safety suggestions accepted

**Features**

**Real-Time Map Visualization**

- Enabled only if AI Summary detects face-to-face meetup
- Both users' live locations appear on shared map
- Each user can view own position and counterpart's position
- Coordinates safe meetup logistics
- Disabled for digital transactions (delivery/service-based)

**Emergency Contact Alerts**

- Users can register emergency contacts
- Auto-report triggers:
  - Inactivity
  - Distress signals
  - Abnormal behavior detection

**Transaction Confirmation Logic**

- Both users must confirm completion
- If only one party confirms → Transaction Mode remains open
- After dual confirmation → Grace period begins for dispute handling

---

### 7. Post-Transaction & Reporting

**Grace Period**

- Duration determined by AI (e.g., 3 days based on transaction type)
- Users can file reports for:
  - Defective goods
  - Unmet conditions
  - Fraudulent behavior

**Report Submission**
When a report is filed:

1. AI generates incident documentation (structured official format)
2. Automated forwarding to cybercrime or mediation agencies
3. Case tracking system activated

**Ticket Page**
Users can:

- Track case status (Open, Under Review, Resolved)
- View AI-generated summaries and updates
- Access evidence or message history attached to report
- Communicate with support or authorities

---

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with Supabase
- **UI**: shadcn/ui with Tailwind CSS v4
- **AI Integration**: Google Generative AI for conversation analysis

---

## Design Principles for UI Development

When building any UI component for Sabot, ensure:

### 1. **Trust & Transparency**

- Clear visual hierarchy showing verification status
- Blockchain-inspired ledger aesthetics for transaction feeds
- Prominent display of security features and AI insights

### 2. **Safety-First UX**

- Warning states for pricing anomalies
- Clear distinction between verified/unverified users
- Accessible emergency features in Transaction Mode

### 3. **Progressive Disclosure**

- Guide users through verification → invitation → preview → transaction flow
- Show relevant information at each stage without overwhelming
- Use gated access patterns (authenticated → verified → transaction-ready)

### 4. **Collaborative Transparency**

- Show when counterpart has completed steps (without revealing sensitive data)
- Visual acknowledgment system (glowing light bulbs for mutual agreement)
- Shared map view for meetups

### 5. **AI-Augmented Decision Making**

- Present AI insights clearly and actionably
- Use visual comparison tools (market price vs. agreed price)
- Contextual suggestions based on transaction analysis

### 6. **Accessibility & Urgency**

- Emergency contact system must be always accessible
- Distress signals need immediate visual feedback
- Mobile-first design for on-the-go transactions

---

## Key User Flows

### New User Flow

1. Sign up (email authentication)
2. Upload government ID
3. Complete face recognition
4. Receive "Verified" status
5. Access full platform

### Transaction Initiation Flow

1. Verified user generates transaction link
2. Shares link with counterpart
3. Counterpart signs in / gets verified
4. Both proceed to Transaction Preview

### Transaction Completion Flow

1. Upload conversation screenshots
2. AI validates and generates summary
3. Review AI Market Comparison
4. Accept safety suggestions
5. Enter Transaction Mode
6. Complete transaction
7. Dual confirmation
8. Grace period for disputes

---

---

## Platform Features - Part B: Collaborative Agreement Creation

### 1. Agreement Initiation & Invitation

**Agreement Link Generation**

- Either party can generate a unique agreement creation link
- Link can be shared via email, messaging apps, or copied directly
- Both parties must be authenticated to access

**Invitation Flow**

1. **Review Invitation**: View inviter details and agreement type
2. **Select Template**: Choose from pre-built templates (Partnership, Service, NDA, Sales, Custom)
3. **Verification**: Complete identity verification (reuses transaction verification)

**Template Types**

- **Partnership Agreement**: For business partnerships and joint ventures
- **Service Agreement**: Define service delivery terms and payment
- **Non-Disclosure Agreement (NDA)**: Protect confidential information
- **Sales Agreement**: Formalize goods/services sales with payment terms
- **Custom Agreement**: Start from blank canvas

---

### 2. Agreement Overview

**Four-Section Carousel**
Before entering the collaborative editor, parties review:

1. **Parties Information**
   - Display both parties with avatars, verification badges
   - Show trust scores and verification status
   - Confirm contact information

2. **Document Structure**
   - Expandable tree view of agreement sections
   - Standard sections: Preamble, Definitions, Terms, Obligations, Signatures
   - Visual hierarchy with headings and subsections

3. **AI Suggestions**
   - Clause recommendations based on template and context
   - Risk warnings for missing critical sections
   - Severity indicators (Low, Medium, High)
   - Apply/Dismiss functionality

4. **Agreement Details**
   - Agreement type, status, creation date
   - Duration and effective date
   - Last updated timestamp

**Navigation**

- Carousel with Previous/Next buttons
- Progress indicator (1/4, 2/4, etc.)
- "Enter Collaborative Editor" button to begin real-time editing

---

### 3. Collaborative Editor (Active Mode)

**Real-Time Block-Based Editing**

- Notion-style block editor with drag-and-drop
- Each block represents a section, paragraph, heading, list, or quote
- Drag handles (⋮⋮) for reordering blocks
- Plus (+) button to add new blocks

**Block Types**

- Heading (H1, H2, H3)
- Paragraph (rich text)
- Numbered List
- Bullet List
- Quote (with left border accent)
- Divider

**Collaborative Features**

- **Cursor Presence**: See counterpart's cursor in real-time with color-coded avatar
- **Typing Indicators**: "User is typing..." below their avatar
- **Live Updates**: Character-by-character synchronization
- **Conflict Resolution**: Automatic CRDT-based merging (future: Yjs integration)

**AI Assistant Sidebar**
Collapsible panel with three tabs:

1. **Grammar**: Auto-detected grammar and spelling corrections
   - Inline suggestions with "Apply" button
   - Corrects typos, punctuation, capitalization

2. **Suggestions**: Context-aware clause recommendations
   - "Add Force Majeure Clause"
   - "Include Termination Terms"
   - "Specify Dispute Resolution"
   - Shows suggested text and reasoning

3. **Risks**: High-priority warnings
   - "Missing Termination Clause"
   - "Vague Obligations"
   - Highlighted in yellow/red with severity badges

**Header Controls**

- Back to Overview link
- Agreement title display
- Party avatars with online status indicators
- "AI Assistant" toggle button
- "Ready to Finalize" button (navigates to finalization page)

---

### 4. Finalization & Signatures

**Document Preview**

- PDF-style professional formatting
- Displays complete agreement with all sections
- Shows effective date and party information
- Signature section at bottom

**Dual Confirmation System**
Similar to transaction confirmation:

- Each party must click "Confirm Agreement"
- Avatars show checkmarks when confirmed
- Status banner: "Waiting for other parties..." or "Agreement Finalized!"

**Confirmation States**

1. **Pending**: Neither party confirmed
2. **Partial**: One party confirmed, waiting for other
3. **Finalized**: Both parties confirmed, agreement locked

**Party Status Card**

- List of all parties with avatars
- Confirmation status: "Confirmed" badge or "Pending" text
- Email and name display

**Post-Finalization** (Future Phase 2)

- Download PDF with signatures
- Blockchain hash for immutable verification
- Email notification to all parties
- Store in user's agreement history

---

### 5. Agreement Management (Future)

**Agreement Dashboard**

- List of all agreements (Draft, Active, Finalized, Signed)
- Filter by status, type, date
- Search by party name or agreement title

**Version History**

- Track all changes with timestamps
- User attribution for each edit
- Revert to previous versions
- Diff view between versions

**Access Control**

- Only invited parties can view/edit
- Time-limited access links
- Revocation capability

---

## Design Principles for Agreement Platform

### 1. **Spotify-Inspired Dark Theme**

- Primary color: Spotify Green (#1DB954)
- Dark background (#121212) with elevated cards (#181818)
- Smooth transitions (150-300ms)
- Rounded buttons (rounded-full)

### 2. **Real-Time Collaboration**

- Visible cursors with color-coded name tags
- Smooth cursor animations
- Online/offline status indicators
- Typing indicators for active users

### 3. **Block-Based Flexibility**

- Drag-and-drop reordering
- Easy addition/deletion of sections
- Nested block structures
- Translates to clean rich text output

### 4. **AI-Augmented Drafting**

- Context-aware suggestions
- Risk analysis and warnings
- Grammar auto-corrections
- Plain-English explanations

### 5. **Professional Output**

- PDF-quality document preview
- Legal document formatting standards
- Structured sections (Preamble, Definitions, Terms, Signatures)
- Ready for legal submission

---

## Key User Flows - Agreement Platform

### New Agreement Flow

1. User clicks "Create Agreement"
2. System generates unique link
3. User shares link with counterparty
4. Both parties sign in / verify identity
5. Invitee selects template
6. Both proceed to Agreement Overview

### Agreement Drafting Flow

1. Review agreement overview (4-section carousel)
2. Enter collaborative editor
3. Add/edit blocks in real-time
4. Apply AI suggestions as needed
5. Toggle AI Assistant for grammar/risk checks
6. Click "Ready to Finalize" when complete

### Finalization Flow

1. Review document preview
2. First party confirms agreement
3. System shows "Waiting for other party..." banner
4. Second party confirms agreement
5. "Agreement Finalized!" banner appears
6. Download PDF (future) or view locked document

---

## Technology Stack - Agreement Platform

**Existing Infrastructure**:

- Next.js 15 with App Router
- PostgreSQL with Supabase
- Authentication via Supabase Auth
- Tailwind CSS v4 with shadcn/ui

**Future Dependencies** (Phase 2):

- **Tiptap**: Block-based editor (built on ProseMirror)
- **Yjs**: CRDT for real-time collaboration
- **y-websocket**: WebSocket server for sync
- **Liveblocks** (optional): Managed real-time infrastructure
- **jsPDF**: PDF generation with signatures

**Current Implementation** (Phase 1 - Frontend Only):

- Mock data for agreements, parties, sections, AI suggestions
- Placeholder components ready for UI generation
- Static blocks (no real-time sync yet)
- Mock cursor positions and typing indicators

---

## Routes - Agreement Platform

```
/agreement/new              - Create new agreement
/agreement/invite           - Join via invitation link
/agreement/[id]             - Agreement overview (carousel)
/agreement/[id]/active      - Collaborative editor
/agreement/[id]/finalize    - Confirmation & signatures
```

---

## Future Considerations

**Transaction Safety**:

- Multi-platform integration (API connections to marketplaces)
- Escrow payment system
- Reputation portability across platforms
- Community reporting and pattern detection
- Machine learning fraud detection improvements

**Agreement Platform**:

- Real-time WebSocket synchronization (Yjs + y-websocket)
- E-signature integration (DocuSign/HelloSign)
- PDF generation with blockchain verification
- Legal clause library with jurisdiction-specific templates
- AI-powered contract review and risk scoring
- Multi-party agreements (3+ collaborators)
- Agreement templates marketplace
