# Sabot - Product Vision

## Overview

Sabot is a trust and safety platform designed to protect peer-to-peer transactions across online marketplaces. It acts as a verification and escrow-like intermediary that uses AI-powered analysis, identity verification, and real-time monitoring to reduce fraud and ensure safe exchanges.

## Core Mission

Enable safe, transparent, and verified transactions between strangers on online marketplaces by providing blockchain-like transaction transparency, AI-powered fraud detection, and real-time safety features.

---

## Platform Features

### 1. User Onboarding & Verification

**Authentication**

- Email-based authentication via better-auth
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
- **Authentication**: better-auth with email/password
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: shadcn/ui with Tailwind CSS v4
- **AI Integration**: (To be specified - likely OpenAI/Anthropic for conversation analysis)

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

## Future Considerations

- Multi-platform integration (API connections to marketplaces)
- Escrow payment system
- Reputation portability across platforms
- Community reporting and pattern detection
- Machine learning fraud detection improvements
