# Transaction Invite Page (Multi-Step Verification)

## Page Overview

**Route Path:** `/transaction/invite`
**Query Parameter:** `data` (Base64 encoded invitation data)
**Purpose:** Accept transaction invitation and verify screenshots through multi-step flow

## Layout Hierarchy Tree

```
Page Root (Full-height gradient background)
├── Header
│   └── Container (Max-width wrapper)
│       └── Back Button (Link to home)
│
└── Main Content (Max-width constrained wrapper with padding)
    │
    ├── STEP 1: Review Transaction
    │   ├── Step Header (Centered)
    │   │   ├── Icon Container (Shield icon)
    │   │   ├── Page Title
    │   │   └── Inviter Name
    │   │
    │   ├── Transaction Details Card
    │   │   ├── Card Header
    │   │   └── Card Content (Grid of detail boxes)
    │   │       ├── Item Box (Checkmark icon)
    │   │       ├── Price Box (Dollar icon)
    │   │       ├── Location Box (Map pin icon)
    │   │       └── Date/Time Box (Calendar icon)
    │   │
    │   ├── Security Info Card (Blue theme)
    │   │   └── Security Features List
    │   │
    │   └── Action Buttons
    │       ├── Accept Button (Full-width)
    │       └── Decline Button (Outline)
    │
    ├── STEP 2: Upload Screenshot
    │   ├── Step Header (Centered)
    │   │   ├── Icon Container (Upload icon)
    │   │   ├── Upload Title
    │   │   └── Description
    │   │
    │   ├── Verification Card
    │   │   ├── Card Header
    │   │   └── Card Content
    │   │       ├── File Upload Zone
    │   │       │   ├── Hidden File Input
    │   │       │   └── Drop Zone (Dashed border)
    │   │       │       ├── Upload Icon
    │   │       │       └── Instructions
    │   │       ├── File Success Indicator (Conditional)
    │   │       └── Important Notice (Amber theme)
    │   │
    │   └── Action Buttons
    │       ├── Verify Button (Full-width)
    │       └── Skip Button (Testing only, outline)
    │
    └── STEP 3: Verification Results
        ├── Loading State (While verifying)
        │   ├── Spinner Icon (Animated)
        │   ├── Loading Heading
        │   └── Loading Message
        │
        └── Results State (After verification)
            ├── Step Header (Centered)
            │   ├── Icon Container (Success icon)
            │   ├── Success Title
            │   └── Success Description
            │
            ├── Verification Summary Card (Green theme)
            │   └── Match Score + Message
            │
            ├── AI Analysis Card
            │   ├── Card Header
            │   └── Card Content
            │       ├── Conversation Match Box (Green)
            │       ├── Detected Topics List
            │       ├── Screenshot Authenticity Box (Blue)
            │       └── Recommendation Box (Gray)
            │
            └── Proceed Button (Full-width)
```

## Component Breakdown

### Multi-Step Flow

- **Step 1:** Review invitation details
- **Step 2:** Upload screenshot for verification
- **Step 3:** View AI verification results

### Loading/Error States

- **Loading:** Shows while decoding invitation data
- **Error:** Shows if invitation invalid or user not authenticated
- **Redirect:** Sends to login if not authenticated

### Step 1: Review Transaction

#### Step Header

- **Icon:** Shield with checkmark (security theme)
- **Title:** "Transaction Invitation"
- **Subtitle:** Shows who sent the invitation

#### Transaction Details Card

- **Layout:** Grid of information boxes
- **Detail Boxes:**
  1. **Item Box**
     - Checkmark icon
     - "Item" label
     - Transaction type (large, bold)
     - Description (if available)
  2. **Price Box**
     - Dollar icon
     - "Price" label
     - Price amount (large, primary color)
  3. **Location Box**
     - Map pin icon
     - "Meeting Location" label
     - Address text
  4. **Date/Time Box**
     - Calendar icon
     - "Date & Time" label
     - Date and time display

#### Security Info Card

- **Theme:** Blue background
- **Icon:** Shield icon
- **Content:**
  - Bold heading
  - Bulleted list of security features
  - Checkmarks for each feature

#### Action Buttons

- **Accept:** Full-width, large, primary
- **Decline:** Outline variant, large

### Step 2: Upload Screenshot

#### Step Header

- **Icon:** Upload icon
- **Title:** "Upload Chat Screenshot"
- **Subtitle:** Verification explanation

#### Verification Card

- **File Upload Zone:**
  - Dashed border drop area
  - Large upload icon
  - Click instructions
  - File size limit
  - Hidden file input
- **Success Indicator:**
  - Green box when file selected
  - Image icon + filename
  - Checkmark icon
- **Important Notice:**
  - Amber theme (warning color)
  - Alert triangle icon
  - Instructions about screenshot content

#### Action Buttons

- **Verify Button:**
  - Full-width
  - Disabled until file selected
  - Primary action
- **Skip Button:**
  - Outline variant
  - Small size
  - Testing/demo only

### Step 3: Verification Results

#### Loading State

- **Layout:** Centered vertical stack
- **Spinner:** Large animated loader
- **Text:** Loading heading + message
- **Duration:** Simulated 2-3 second delay

#### Results State

##### Verification Summary Card

- **Theme:** Green success
- **Content:**
  - Checkmark icon
  - Match percentage (large)
  - Verification message

##### AI Analysis Card

- **Conversation Match Section:**
  - Green background box
  - Checkmark icon
  - Confidence score
  - Summary text

- **Detected Topics:**
  - List heading
  - Bulleted items
  - Primary color bullets
  - Each topic on new line

- **Authenticity Section:**
  - Blue background box
  - Shield icon
  - Authenticity heading
  - No manipulation message

- **Recommendation Section:**
  - Gray background box
  - Small text label
  - Checkmark + recommendation text

##### Proceed Button

- Full-width
- Large size
- Primary action

## Interaction Summary

### Step 1: Review Flow

1. Invitation data decoded from URL
2. Transaction details displayed
3. Security features explained
4. User choices:
   - Accept → Move to step 2
   - Decline → Return home

### Step 2: Upload Flow

1. User clicks upload zone
2. File picker opens
3. User selects screenshot
4. Success indicator shows
5. Verify button enabled
6. Click verify → Move to step 3 (loading)
7. Alternative: Skip for testing

### Step 3: Verification Flow

1. Loading state displays
2. Simulated AI analysis (2-3s)
3. Results displayed:
   - Match confidence
   - Conversation summary
   - Detected topics
   - Authenticity check
   - Recommendation
4. Click proceed → Create transaction → Navigate to transaction page

### Authentication Check

- Runs on page mount
- Redirects to login if not authenticated
- Blocks access without valid session

## Notes for Reimplementation

### Invitation Data Decoding

- Reads `data` query parameter
- Base64 decodes invitation
- Parses JSON structure
- Contains: transactionId, invitedBy, invitedByName, timestamp
- Error handling for invalid data

### Multi-Step State Management

- Local state tracks current step
- Each step renders conditionally
- Progressive disclosure pattern
- Clear step transitions

### File Upload Handling

- Hidden file input pattern
- Label triggers picker
- Stores file reference
- No actual upload (demo mode)

### AI Verification Simulation

- Mock analysis with timeout
- Predetermined high confidence
- Realistic conversation summary
- Topic extraction
- Authenticity checks
- All simulated data

### Transaction Creation

- Combines invitation data with screenshot
- Generates new transaction ID
- Sets status as "pending"
- Stores in global state
- Links buyer (current user) and seller (inviter)

### Skip Functionality

- Testing shortcut
- Bypasses verification
- Creates transaction immediately
- Alert indicates testing mode

### Responsive Design

- Detail boxes stack on mobile
- Buttons remain full-width
- Card adapts to viewport
- Consistent padding throughout

### Visual Flow

- Each step has distinct icon color
- Green = success/verified
- Blue = information/security
- Amber = warning/attention
- Gradient backgrounds throughout

### Security Features Display

- Lists platform capabilities
- Builds trust with invitee
- Explains verification process
- Uses checkmarks for features

### Information Architecture

1. Who invited (context)
2. What's being transacted (details)
3. Why it's secure (trust)
4. Upload proof (action)
5. Verify authenticity (validation)
6. Proceed to transaction (completion)

### Error Handling

- Invalid invitation link
- Missing user authentication
- Decoding failures
- All show error state with home link

### Layout Patterns

- Gradient background throughout
- White header with shadow
- Centered step headers
- Card-based content sections
- Icon + text patterns
- Consistent spacing (mb-6)
