# Home Page (Dashboard)

## Page Overview

**Route Path:** `/`
**Purpose:** Main dashboard displaying all platform transactions with user authentication check and navigation controls

## Layout Hierarchy Tree

```
Page Root (Full-height gradient background container)
├── Header
│   └── Container (Max-width wrapper)
│       ├── Brand Section (Logo + Title)
│       └── Navigation Section
│           ├── Profile Button (Link to user profile)
│           └── Logout Button
│
└── Main Content (Max-width wrapper with padding)
    ├── Welcome Section
    │   ├── Heading (Personalized greeting)
    │   └── Subheading
    │
    ├── Transactions Card
    │   ├── Card Header
    │   │   ├── Card Title
    │   │   └── Card Description
    │   └── Card Content
    │       └── Transaction List (Space-y layout)
    │           └── Transaction Item (Repeating, clickable link)
    │               ├── Left Section (Item details)
    │               │   ├── Transaction Type
    │               │   ├── Participants Info
    │               │   └── Location + Date/Time
    │               └── Right Section
    │                   ├── Price Display
    │                   └── Status Badge
    │
    └── Action Section (Centered)
        └── Create Transaction Button (Full-width constrained)
```

## Component Breakdown

### Header

- **Type:** Fixed navigation bar
- **Structure:** White background with shadow and border
- **Left Side:** Brand logo icon + application title
- **Right Side:** User profile button + logout button
- **Behavior:** Displays current user name, links to profile page

### Welcome Section

- **Type:** Text display area
- **Elements:** Large heading with user's first name, descriptive subheading
- **Purpose:** Personalized greeting and context

### Transactions Card

- **Type:** Container card with header and scrollable content
- **Header:** Title and description explaining the list
- **Content:**
  - Vertically stacked transaction items
  - Each item is a clickable link to transaction detail page
  - Hover effect on items

### Transaction Item (Repeating Element)

- **Layout:** Horizontal flex layout with space-between
- **Left Content:**
  - Transaction type (prominent text)
  - Seller → Buyer names
  - Location, date, and time
- **Right Content:**
  - Price (bold, large)
  - Status badge with color coding

### Create Transaction Button

- **Type:** Call-to-action button
- **Position:** Centered at bottom
- **Icon:** Plus icon
- **Links to:** `/transaction/new`

## Interaction Summary

### Primary Actions

- **Profile Access:** Click user name button → Navigate to `/profile/[id]`
- **Logout:** Click logout button → Clear session and redirect to login
- **View Transaction:** Click any transaction item → Navigate to `/transaction/[id]`
- **Create Transaction:** Click CTA button → Navigate to `/transaction/new`

### Authentication Flow

- Page checks for current user on mount
- Redirects to `/login` if not authenticated
- Renders nothing while checking authentication

### Status Badge Colors

- **Completed:** Green background
- **Active:** Blue background
- **Pending:** Yellow background
- **Reported:** Red background

## Notes for Reimplementation

### Responsive Behavior

- Header uses responsive padding (sm, lg breakpoints)
- Main content has max-width constraint (max-w-7xl)
- Transaction items stack vertically on mobile

### Data Dependencies

- Requires user authentication state
- Fetches all transactions from data source
- Maps user IDs to user names for display

### State Management

- Uses global store for current user
- Logout action clears user and active transaction
- Authentication check triggers redirect

### Visual Hierarchy

1. Header (navigation)
2. Welcome message (personalized)
3. Transaction list (scrollable primary content)
4. Create button (prominent call-to-action)

### Key Layout Patterns

- Gradient background (blue to indigo)
- White header with shadow separation
- Card-based content containers
- Consistent spacing (margin-bottom: 8 units)
- Icon + text button patterns
