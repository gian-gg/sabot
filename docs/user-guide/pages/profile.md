# Profile Page (Dynamic User Profile)

## Page Overview

**Route Path:** `/profile/[id]`
**Dynamic Parameter:** User ID
**Purpose:** Display detailed user profile information including stats, verification status, and transaction history

## Layout Hierarchy Tree

```
Page Root (Full-height gradient background)
├── Header
│   └── Container (Max-width wrapper)
│       └── Back Button (Link to home)
│
└── Main Content (Max-width wrapper with padding)
    ├── Profile Header Card
    │   └── Card Content
    │       └── Horizontal Layout
    │           ├── Avatar (Large circular)
    │           └── User Info Section
    │               ├── Name Row
    │               │   ├── Name (Large heading)
    │               │   └── Verification Badge (Conditional)
    │               ├── Email
    │               ├── Stats Row (Horizontal flex wrap)
    │               │   ├── Rating Display (Star icon + number)
    │               │   ├── Join Date (Calendar icon + date)
    │               │   └── Transaction Count
    │               └── Action Row
    │                   ├── Emergency Contact Button
    │                   └── Verification Status Badge
    │
    └── Transaction History Card
        ├── Card Header
        │   └── Card Title
        └── Card Content
            └── Transaction List (Conditional rendering)
                ├── Empty State (If no transactions)
                └── Transaction Items (Repeating, clickable)
                    ├── Left Section
                    │   ├── Transaction Type
                    │   └── Role + Date Info
                    └── Right Section
                        ├── Price
                        └── Status Badge
```

## Component Breakdown

### Header

- **Type:** Fixed navigation bar
- **Structure:** White background with shadow
- **Content:** Single back button linking to home

### Profile Header Card

- **Type:** Information display card
- **Layout:** Horizontal flex on desktop, stacks on mobile

#### Avatar Section

- **Component:** Large circular avatar
- **Size:** 24x24 units
- **Content:** User initials (computed from name)
- **Background:** Fallback color

#### User Info Section

- **Name Row:**
  - Large heading (3xl font)
  - Verification shield icon (conditional on verified status)
- **Email Display:**
  - Muted text color
  - Below name
- **Stats Row:**
  - Horizontal flex with wrap
  - Three stat groups:
    1. Rating (star icon + decimal number)
    2. Join date (calendar icon + formatted date)
    3. Transaction count (number + label)
- **Action Row:**
  - Emergency contact button (outline variant)
  - Verification badge (green if verified, gray if not)

### Transaction History Card

- **Type:** List container card
- **Header:** Simple title
- **Content:**
  - Empty state if no transactions
  - List of transaction items if available

#### Transaction Item (Repeating)

- **Layout:** Horizontal flex with justify-between
- **Hover Effect:** Background change on hover
- **Left Content:**
  - Transaction type (bold)
  - Role indicator ("Bought from" or "Sold to")
  - Date formatted
- **Right Content:**
  - Price (bold)
  - Status badge (color-coded)

## Interaction Summary

### Primary Actions

- **Back Navigation:** Click back button → Navigate to `/`
- **Emergency Contact:** Click button → Navigate to `/emergency`
- **View Transaction:** Click transaction item → Navigate to `/transaction/[id]`

### Dynamic Loading

- Extracts user ID from URL parameter
- Fetches user data from data source
- Shows error state if user not found
- Filters transactions by user ID (buyer or seller)

### Conditional Rendering

- Verification icon only shows if user is verified
- Verification badge changes color based on status
- Empty state shows if user has no transactions
- Transaction list shows if user has history

### Status Badge Colors

- **Completed:** Green background
- **Active:** Blue background
- **Pending:** Yellow background
- **Reported:** Red background

## Notes for Reimplementation

### Dynamic Route Handling

- Uses URL parameter for user ID
- Fetches user by ID from data source
- Handles user not found scenario
- Provides back button on error

### Data Relationships

- Links user to their transactions
- Filters transactions where user is buyer OR seller
- Determines role (bought/sold) for display

### Profile Stats Display

- Rating shown with 1 decimal place
- Date formatted for readability
- Transaction count as simple number
- Icons provide visual context

### Avatar Generation

- Computes initials from full name
- Splits name by spaces
- Takes first letter of each word
- Converts to uppercase

### Responsive Layout

- Header has responsive padding
- Profile card adapts layout on mobile
- Stats row wraps on small screens
- Transaction items stack content on mobile

### Visual Hierarchy

1. Avatar and name (primary identity)
2. Stats (social proof)
3. Actions (emergency contact, verification)
4. Transaction history (supporting detail)

### State Dependencies

- Requires user data by ID
- Requires all transactions data
- No authentication check on this page
- Read-only display (no edit functionality)

### Layout Patterns

- Gradient background consistent with app theme
- White header with shadow separation
- Card-based content sections
- Consistent spacing (mb-6 between cards)
- Icon + text patterns for stats
