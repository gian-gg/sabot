# Transaction Detail Page

## Page Overview

**Route Path:** `/transaction/[id]`
**Dynamic Parameter:** Transaction ID
**Purpose:** View and manage individual transaction with state transitions and reporting

## Layout Hierarchy Tree

```
Page Root (Full-height gradient background)
├── Header
│   └── Container (Max-width wrapper)
│       └── Back Button (Link to home)
│
└── Main Content (Max-width wrapper with padding)
    ├── Status Header Card
    │   └── Card Content
    │       └── Horizontal Layout
    │           ├── Left Section
    │           │   ├── Status Icon (Dynamic by status)
    │           │   └── Transaction Info
    │           │       ├── Transaction Type (Large heading)
    │           │       └── Transaction ID
    │           └── Status Badge (Right-aligned)
    │
    ├── Content Grid (2-column on desktop)
    │   ├── Transaction Details Card
    │   │   ├── Card Header
    │   │   └── Card Content (Vertical stack)
    │   │       ├── Price Section
    │   │       ├── Location Section
    │   │       ├── Date & Time Section
    │   │       └── Description Section
    │   │
    │   └── Participants Card
    │       ├── Card Header
    │       └── Card Content
    │           ├── Seller Section
    │           │   ├── Label
    │           │   └── User Card (Clickable link)
    │           │       ├── Avatar Circle (Initial)
    │           │       └── User Info
    │           │           ├── Name
    │           │           └── Stats (Rating + Count)
    │           └── Buyer Section
    │               ├── Label
    │               └── User Card (Clickable link)
    │                   ├── Avatar Circle (Initial)
    │                   └── User Info
    │                       ├── Name
    │                       └── Stats (Rating + Count)
    │
    ├── Verification Steps Card (Status: pending)
    │   ├── Card Header
    │   └── Card Content
    │       ├── Chat Verified Step (Green box with checkmark)
    │       └── Ready to Start Step (Blue box with play icon)
    │
    ├── Active Transaction Indicator (Status: active)
    │   └── Blue Card with Animation
    │       └── Horizontal Layout
    │           ├── Animated Circle
    │           │   ├── Outer ping ring
    │           │   ├── Middle ping ring
    │           │   └── Play Icon (Pulsing)
    │           └── Status Text
    │               ├── Bold Heading
    │               └── Description
    │
    └── Actions Card
        └── Card Content
            ├── Start Button (Status: pending)
            ├── Confirm Complete Button (Status: active)
            │   └── Waiting Indicator (If user confirmed)
            ├── Report Issue Button (All non-final states)
            └── Completion Message (Status: completed)
```

## Component Breakdown

### Header

- **Type:** Fixed navigation bar
- **Structure:** White background with shadow
- **Content:** Back button to home

### Status Header Card

- **Layout:** Horizontal flex with space-between
- **Left Section:**
  - Dynamic status icon
  - Transaction type (large, bold)
  - Transaction ID (muted, smaller)
- **Right Section:**
  - Color-coded status badge

### Transaction Details Card

- **Structure:** Vertical information stack
- **Sections:**
  1. **Price**
     - Small muted label
     - Large bold price ($XXX)
  2. **Location**
     - Label
     - Address text
  3. **Date & Time**
     - Label
     - Formatted date and time
  4. **Description**
     - Label
     - Multi-line description text

### Participants Card

- **Structure:** Two user sections (Seller, Buyer)
- **User Card Pattern:**
  - Clickable link wrapper
  - Circular avatar with initial
  - User name (medium weight)
  - Rating + transaction count stats
  - Hover effect (background change)

### Verification Steps Card (Pending Status Only)

- **Type:** Progress indicator card
- **Steps:**
  1. **Chat Verified**
     - Green background
     - Checkmark icon
     - Status title
     - Description text
  2. **Ready to Start**
     - Blue background
     - Play icon
     - Status title
     - Description text

### Active Transaction Indicator (Active Status Only)

- **Theme:** Blue card with gradient
- **Animation:**
  - Pulsing circle with ping rings
  - Multiple animation layers
  - Play icon in center
- **Text:**
  - Large bold heading
  - Explanatory subtitle
  - Status badge

### Actions Card

- **Type:** Context-sensitive action container
- **Content varies by status:**

#### Pending Status

- Start Transaction button (full-width)
- Report Issue button (full-width, destructive)

#### Active Status

- Confirm Complete button
  - Shows "Waiting" state when user confirms
  - Disabled after confirmation
- Waiting indicator card (amber theme)
  - Pulsing dot animation
  - Waiting message
- Report Issue button

#### Completed Status

- Success message card (green theme)
  - Large checkmark icon
  - Completion message
  - Thank you text

## Interaction Summary

### State Transitions

1. **Pending → Active:** Click "Start Transaction"
2. **Active → Completed:** Both parties click "Confirm Complete"
3. **Any → Reported:** Click "Report Issue" and submit form

### Primary Actions

- **Back Navigation:** Navigate to home
- **View Participant:** Click user card → Navigate to `/profile/[id]`
- **Start Transaction:** Change status to active
- **Confirm Completion:** Mark as confirmed, wait for other party
- **Report Issue:** Open report dialog → Submit → Change status to reported

### Dual Confirmation Flow

1. First party clicks confirm
2. Button shows "You Confirmed - Waiting"
3. Waiting indicator appears
4. Second party confirms (simulated)
5. Transaction marked completed
6. Success message displays

## Dialogs

### Report Dialog

- **Trigger:** Click "Report Issue" button
- **Structure:**
  - Dialog Header (Title + Description)
  - Form Content
    - Reason dropdown (select)
      - No-show
      - Item mismatch
      - Payment issue
      - Safety concern
      - Other
    - Additional Notes textarea
  - Dialog Footer
    - Cancel button
    - Submit Report button (destructive)

### End Transaction Dialog (Unused in current flow)

- **Structure:**
  - Title: "End Transaction"
  - Description: Confirmation prompt
  - Actions: Cancel, Confirm

## Notes for Reimplementation

### Dynamic Status Icons

- **Completed:** Green CheckCircle
- **Active:** Blue PlayCircle
- **Pending:** Yellow AlertTriangle
- **Reported:** Red XCircle

### Status Badge Colors

- Completed: Green background
- Active: Blue background
- Pending: Yellow background
- Reported: Red background

### Animation Patterns

- **Active Status:**
  - Pulse animation on icon
  - Ping rings (staggered delays)
  - Multiple animation layers
- **Waiting State:**
  - Pulsing dot indicator
  - Amber color theme

### Conditional Rendering

- Verification steps: Only pending status
- Active indicator: Only active status
- Buttons change based on status
- Completion message: Only completed status

### Data Dependencies

- Transaction data by ID
- User data for buyer and seller
- Real-time status changes
- Form state for dialogs

### Dual-Party Simulation

- First confirmation changes button state
- Random simulation of second party
- Shows waiting state
- Auto-completes when both confirm

### Report Flow

- Modal dialog opens
- Dropdown + textarea form
- Validation (both fields required)
- Submit changes transaction status
- Alert confirms submission
- Dialog closes

### Responsive Layout

- Two-column grid on desktop
- Single column on mobile
- Cards stack vertically
- Buttons remain full-width

### User Card Pattern

- Circular avatar with initial
- Hover state for interactivity
- Links to profile page
- Shows rating and count

### Visual Hierarchy

1. Status header (current state)
2. Transaction details (key info)
3. Participants (who's involved)
4. Status-specific indicators (progress/active)
5. Actions (what to do next)

### Layout Patterns

- Gradient background
- White header with shadow
- Card-based sections
- Grid for parallel info
- Consistent spacing (mb-6)
- Status-specific color themes
