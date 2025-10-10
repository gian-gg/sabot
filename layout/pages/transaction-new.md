# New Transaction Page (Multi-Step Flow)

## Page Overview

**Route Path:** `/transaction/new`
**Purpose:** Multi-step workflow for creating transactions with AI screenshot analysis and verification

## Layout Hierarchy Tree

```
Page Root (Full-height gradient background)
├── Header
│   └── Container (Max-width wrapper)
│       └── Back Button (Link to home)
│
└── Main Content (Max-width constrained wrapper with padding)
    │
    ├── STEP 1: Upload Screenshot
    │   ├── Step Header (Centered)
    │   │   ├── Icon Container (Circular, Upload icon)
    │   │   ├── Page Title
    │   │   └── Description
    │   │
    │   ├── Upload Card
    │   │   ├── Card Header
    │   │   │   ├── Card Title
    │   │   │   └── Card Description
    │   │   │
    │   │   └── Card Content
    │   │       ├── File Upload Area
    │   │       │   ├── Hidden File Input
    │   │       │   └── Drop Zone (Dashed border)
    │   │       │       ├── Upload Icon (Large)
    │   │       │       └── Upload Instructions
    │   │       │
    │   │       ├── File Success Indicator (Conditional)
    │   │       │   ├── Image Icon
    │   │       │   ├── File Name
    │   │       │   └── Checkmark Icon
    │   │       │
    │   │       └── Info Card (Blue background)
    │   │           ├── Feature List Title
    │   │           └── Feature List (AI capabilities)
    │   │
    │   └── Upload Button (Full-width)
    │
    ├── STEP 2: Waiting for Other Party
    │   ├── Step Header (Centered)
    │   │   ├── Icon Container (Spinner icon)
    │   │   ├── Status Title (Dynamic)
    │   │   └── Description (Dynamic)
    │   │
    │   ├── Your Screenshot Card
    │   │   ├── Card Header
    │   │   └── Card Content (Success indicator)
    │   │
    │   ├── Share Invite Card
    │   │   ├── Card Header
    │   │   ├── Card Content
    │   │   │   └── Link Input + Copy Button
    │   │
    │   ├── Waiting Indicator (Conditional)
    │   │   └── Pulsing Dot + Message
    │   │
    │   └── Proceed Button (Conditional, when both uploaded)
    │
    ├── STEP 3: Analyzing
    │   ├── Centered Loading State
    │   │   ├── Spinner Icon (Large, animated)
    │   │   ├── Loading Heading
    │   │   └── Loading Message
    │
    └── STEP 4: Summary & Activation
        ├── Step Header (Centered)
        │   ├── Icon Container (Success icon)
        │   ├── Success Title
        │   └── Description
        │
        ├── Verification Card (Green theme)
        │   └── Verification Score + Message
        │
        ├── AI Summary Card
        │   ├── Card Header
        │   └── Card Content
        │       ├── Item Display Box
        │       ├── Details Grid (2-column)
        │       │   ├── Price Box
        │       │   └── Date/Time Box
        │       ├── Location Box
        │       ├── Description Box
        │       └── AI Summary Box (Blue theme)
        │
        └── Action Buttons
            ├── Activate Button (Full-width, gradient)
            └── Secondary Button Group
                ├── Done Button
                └── Create Another Button
```

## Component Breakdown

### Multi-Step State Machine

- **Step 1:** Upload screenshot
- **Step 2:** Wait for other party upload
- **Step 3:** AI analysis animation
- **Step 4:** Review and activate

### Step 1: Upload Screenshot

#### Step Header

- **Layout:** Centered text with icon
- **Icon:** Circular container with upload icon
- **Text:** Large title + descriptive subtitle

#### Upload Card

- **File Upload Zone:**
  - Dashed border (drag-drop visual)
  - Large upload icon
  - Click-to-upload instructions
  - Hidden file input (triggered by label)
- **Success State:**
  - Green box when file selected
  - Shows filename
  - Checkmark icon
- **Info Card:**
  - Blue background
  - Lists AI extraction features
  - Bulleted list with checkmarks

#### Action Button

- Full-width upload button
- Disabled until file selected
- Upload icon + text

### Step 2: Waiting State

#### Dynamic Header

- **Initial State:** Amber spinner, "Waiting" title
- **Complete State:** Green checkmark, "Ready" title

#### Screenshot Confirmation Card

- Shows uploaded filename
- Green success indicator

#### Invite Link Card

- Read-only text input with link
- Copy button with state toggle
- Shows "Copied" feedback

#### Waiting Indicator

- Pulsing amber dot
- Waiting message
- Only shows before other party uploads

#### Proceed Button

- Appears when both parties uploaded
- Full-width primary button

### Step 3: Analyzing

#### Loading State

- **Layout:** Centered vertical stack
- **Spinner:** Large animated loader icon
- **Text:** Loading heading + explanatory message
- **Duration:** Simulated delay (2-3 seconds)

### Step 4: Summary & Activation

#### Verification Card

- **Theme:** Green success
- **Content:**
  - Checkmark icon
  - Match percentage
  - Verification message

#### AI Summary Card

- **Item Box:** Transaction type/description
- **Details Grid:**
  - Price (large, emphasized)
  - Date and time
- **Location Box:** Meeting place
- **Description Box:** Item details
- **AI Summary Box:**
  - Blue theme
  - Full analysis text
  - Authenticity details

#### Action Buttons

- **Activate Transaction:**
  - Full-width
  - Gradient background
  - Play icon
  - Primary action
- **Secondary Actions:**
  - Done button (outline)
  - Create Another button (ghost)
  - Horizontal layout

## Interaction Summary

### Step 1: Upload Flow

1. User clicks upload zone
2. File picker opens
3. User selects image
4. Filename displays with success indicator
5. Upload button enabled
6. Click upload → Generate invite link → Move to step 2

### Step 2: Collaboration Flow

1. Screenshot confirmed
2. Invite link generated and displayed
3. User copies and shares link
4. Waiting indicator shows
5. Simulated other party upload (3-5s delay)
6. Status changes to "Ready"
7. Proceed button appears
8. Click proceed → Move to step 3

### Step 3: Processing Flow

1. Loading animation displays
2. Simulated AI analysis (2-3s)
3. Auto-advance to step 4

### Step 4: Finalization Flow

1. Review AI-generated details
2. View verification score
3. Options:
   - Activate → Create transaction → Navigate to active page
   - Done → Return home
   - Create Another → Reset to step 1

## Notes for Reimplementation

### State Machine Implementation

- Local state tracks current step
- Each step renders conditionally
- State progresses sequentially
- No step skipping in normal flow

### File Upload Handling

- Uses hidden file input
- Label triggers file picker
- Stores file reference in state
- No actual upload (demo mode)

### Invite Link Generation

- Encodes transaction data in base64
- Includes transaction ID, inviter info, timestamp
- Full URL with query parameter
- Clipboard API for copying

### AI Simulation

- Mock data replaces real AI
- Realistic delays with setTimeout
- Predetermined responses
- Authenticity score generated

### Transaction Creation

- Generates timestamp-based ID
- Stores in global state
- Creates with "active" status
- Redirects to active transaction page

### Multi-Step Visual Flow

- Each step has distinct icon and color
- Progress indicated by step state
- Clear transitions between states
- Loading states for processing

### Responsive Design

- Cards adapt to screen size
- Grid breaks to single column on mobile
- Buttons stack on small screens
- Consistent padding throughout

### Copy-to-Clipboard Pattern

- Shows immediate feedback
- Icon changes to checkmark
- Text changes to "Copied"
- Auto-resets after 2 seconds

### Info and Feedback Boxes

- Blue boxes for information
- Green boxes for success
- Amber boxes for waiting/pending
- Consistent styling and spacing

### Layout Patterns

- Gradient background throughout
- White header with shadow
- Centered content for focus
- Max-width constraints for readability
- Card-based section separation

### Loading and Processing States

- Spinner animations
- Clear messaging
- No user interaction needed
- Auto-progression

### Data Flow

- Step 1: File capture
- Step 2: Link generation + sharing
- Step 3: Mock AI processing
- Step 4: Data presentation + confirmation
- Final: Transaction creation + navigation
