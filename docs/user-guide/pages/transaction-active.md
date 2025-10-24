# Active Transaction Page

## Page Overview

**Route Path:** `/transaction/[id]/active`
**Dynamic Parameter:** Transaction ID
**Purpose:** Real-time display of active transaction with prominent visual indicators and completion controls

## Layout Hierarchy Tree

```
Page Root (Full-height gradient background)
├── Header
│   └── Container (Max-width wrapper)
│       └── Back Button (Link to home)
│
└── Main Content (Max-width wrapper with padding)
    ├── Active Status Banner (Prominent card)
    │   └── Card Content (Gradient blue background)
    │       └── Horizontal Layout
    │           ├── Animated Circle Section
    │           │   ├── Main Circle (Pulse animation)
    │           │   ├── Outer Ping Ring (Animated)
    │           │   ├── Middle Ping Ring (Staggered animation)
    │           │   └── Play Icon (Centered, pulsing)
    │           └── Status Text Section
    │               ├── Large Bold Heading
    │               ├── Description Text
    │               └── Badge Row
    │                   ├── Status Badge
    │                   └── Live Indicator Dot
    │
    ├── Content Grid (2-column on desktop)
    │   ├── Transaction Details Card
    │   │   ├── Card Header
    │   │   └── Card Content (Vertical stack with icons)
    │   │       ├── Item Section (Checkmark icon)
    │   │       ├── Price Section (Dollar icon)
    │   │       ├── Location Section (Map pin icon)
    │   │       └── Date/Time Section (Calendar icon)
    │   │
    │   └── Participants Card
    │       ├── Card Header
    │       └── Card Content
    │           ├── Seller Section
    │           │   ├── Label
    │           │   └── User Display Box
    │           │       ├── Avatar Circle (Initial)
    │           │       └── User Info
    │           │           ├── Name
    │           │           └── Stats
    │           └── Buyer Section
    │               ├── Label
    │               └── User Display Box
    │                   ├── Avatar Circle (Initial)
    │                   └── User Info
    │                       ├── Name
    │                       └── Stats
    │
    └── Completion Card
        ├── Card Header
        │   ├── Card Title
        │   └── Card Description
        │
        └── Card Content
            ├── Confirm Button (Primary action)
            ├── Waiting Indicator Card (Conditional)
            │   └── Pulsing Dot + Message
            └── Info Notice Card (Blue theme)
                └── Completion Instructions
```

## Component Breakdown

### Header

- **Type:** Fixed navigation bar
- **Structure:** White background with shadow
- **Content:** Back button to home

### Active Status Banner

- **Theme:** Gradient blue background (from-blue-50 to-blue-100)
- **Border:** Blue accent
- **Prominence:** Large, eye-catching

#### Animated Circle

- **Structure:** Layered animation system
  - **Main Circle:**
    - Blue background (bg-blue-500)
    - Pulse animation
    - Contains play icon
  - **Outer Ping Ring:**
    - Absolute positioned
    - Blue with transparency
    - Ping animation (expanding)
  - **Middle Ping Ring:**
    - Absolute positioned
    - Lighter blue
    - Staggered animation delay (0.3s)
  - **Play Icon:**
    - White color
    - Large size (h-12 w-12)
    - Centered with z-index

#### Status Text

- **Heading:** Large, bold, blue text
- **Description:** Explanatory subtitle
- **Badge Row:**
  - Status badge ("Live Transaction")
  - Dot separator
  - "Active Now" indicator

### Transaction Details Card

- **Layout:** Vertical stack with consistent spacing
- **Each Section:**
  - Icon (left-aligned, primary color)
  - Label (small, muted)
  - Value (larger, prominent)

#### Detail Sections:

1. **Item**
   - Checkmark icon
   - Transaction type
   - Description (if available)
2. **Price**
   - Dollar icon
   - Large price display (primary color)
3. **Location**
   - Map pin icon
   - Address text
4. **Date/Time**
   - Calendar icon
   - Formatted date and time

### Participants Card

- **Layout:** Two user sections
- **User Display Pattern:**
  - Small muted label
  - Gray background box
  - Non-clickable (static display)
  - Avatar with initial
  - Name and stats

### Completion Card

- **Purpose:** Primary action area
- **Structure:** Form-like interaction zone

#### Confirm Button

- **State 1 (Unconfirmed):**
  - Full-width
  - Large size
  - Checkmark icon
  - "Confirm Transaction Complete" text
  - Enabled, clickable

- **State 2 (User Confirmed):**
  - Full-width
  - Large size
  - Secondary variant
  - Checkmark icon
  - "You Confirmed - Waiting" text
  - Disabled

#### Waiting Indicator (After User Confirms)

- **Theme:** Amber background
- **Elements:**
  - Pulsing amber dot (animated)
  - Waiting message with other party's name
  - Small font, medium weight

#### Info Notice Card

- **Theme:** Blue background
- **Content:** Important note about completion
- **Structure:**
  - Bold "Note:" prefix
  - Instructions text
  - Small font size

## Interaction Summary

### Primary Action: Completion Flow

1. User clicks "Confirm Transaction Complete"
2. Button changes to "You Confirmed - Waiting"
3. Button becomes disabled
4. Waiting indicator appears
5. Simulated other party confirmation (random 70% chance)
6. If both confirm: Alert + Redirect to home
7. If waiting: Show waiting message

### Visual Feedback

- **Active State:** Pulsing animations, blue theme
- **Waiting State:** Amber pulsing dot
- **Button States:** Visual changes based on confirmation

### Simulation Logic

- Random chance for other party confirmation
- Immediate feedback if both confirm
- Persistent waiting state if only one confirms

## Notes for Reimplementation

### Animation System

Multiple layered animations create prominent effect:

- **Pulse:** Main circle grows/shrinks
- **Ping:** Rings expand outward
- **Staggered Timing:** Creates wave effect
- **Opacity:** Fades as rings expand

### Visual Prominence

- Blue gradient background stands out
- Large animated circle draws attention
- High-contrast colors
- Badge system reinforces "live" state

### Single-Purpose Page

- Focus on one action: completion
- Minimal distractions
- Clear visual hierarchy
- Prominent call-to-action

### Dual Confirmation Pattern

- Requires both parties
- First confirmation shows waiting state
- Second confirmation (simulated) triggers completion
- Alert confirms success
- Auto-redirect after completion

### Static User Display

- Unlike profile page, these aren't links
- Simple information display
- No hover states
- Gray background for visual grouping

### Transaction Data

- Fetches by ID from both static and created transactions
- Falls back between data sources
- Shows error if not found
- Displays all transaction details

### Responsive Design

- Banner adapts to screen size
- Grid becomes single column on mobile
- Animations scale appropriately
- Buttons remain full-width

### Color Theme Consistency

- Blue: Active/in-progress
- Amber: Waiting/pending
- Gray: Information/static
- Green: Success (after completion)

### Information Architecture

1. Active status banner (immediate context)
2. Transaction details (what's happening)
3. Participants (who's involved)
4. Completion action (what to do)

### State Management

- Local state for user confirmation
- Local state for other party simulation
- No persistence (resets on reload)
- Auto-redirect on completion

### Visual Hierarchy

1. Animated status banner (most prominent)
2. Confirm button (primary action)
3. Transaction details (supporting info)
4. Participants (context)
5. Info notice (helper text)

### Layout Patterns

- Gradient background (consistent)
- White header with shadow
- Blue gradient banner (special)
- Card-based sections
- Grid for parallel information
- Full-width action button

### Animation Performance

- CSS animations (hardware accelerated)
- Multiple animation layers
- Staggered delays for effect
- Smooth transitions
