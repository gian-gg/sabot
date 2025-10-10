# Reports Page

## Page Overview

**Route Path:** `/reports`
**Purpose:** Dashboard displaying all transaction reports with status tracking and filtering

## Layout Hierarchy Tree

```
Page Root (Full-height gradient background)
├── Header
│   └── Container (Max-width wrapper)
│       └── Back Button (Link to home)
│
└── Main Content (Max-width wrapper with padding)
    ├── Page Header Section
    │   ├── Page Title
    │   └── Page Description
    │
    ├── Summary Cards Grid (3-column on desktop)
    │   ├── Pending Reports Card
    │   │   ├── Card Header (Label)
    │   │   └── Card Content (Count number)
    │   ├── Under Review Card
    │   │   ├── Card Header (Label)
    │   │   └── Card Content (Count number)
    │   └── Resolved Card
    │       ├── Card Header (Label)
    │       └── Card Content (Count number)
    │
    └── All Reports Card
        ├── Card Header
        │   ├── Card Title
        │   └── Card Description
        │
        └── Card Content
            ├── Empty State (If no reports)
            │   ├── Icon (Alert triangle)
            │   └── Message
            │
            └── Reports List (Space-y layout)
                └── Report Item (Repeating, hoverable)
                    ├── Header Row
                    │   ├── Left Section
                    │   │   ├── Transaction Type
                    │   │   └── Status Badge (Icon + text)
                    │   └── Report Details
                    │       ├── Transaction ID (Clickable link)
                    │       ├── Reporter Name
                    │       └── Date + Time
                    │
                    ├── Reason Section (Gray box)
                    │   ├── Label
                    │   └── Reason Text
                    │
                    ├── Notes Section (Gray box)
                    │   ├── Label
                    │   └── Notes Text
                    │
                    └── Transaction Value Row (If transaction exists)
                        └── Price Display
```

## Component Breakdown

### Header

- **Type:** Fixed navigation bar
- **Structure:** White background with shadow
- **Content:** Back button linking to home

### Page Header Section

- **Type:** Text introduction area
- **Elements:**
  - Large bold heading
  - Muted descriptive text
  - Bottom margin for spacing

### Summary Cards Grid

- **Layout:** Responsive grid (1 column mobile, 3 columns desktop)
- **Gap:** Consistent spacing between cards
- **Cards:**
  1. **Pending Reports**
     - Small gray label
     - Large bold count
  2. **Under Review**
     - Small gray label
     - Large bold count
  3. **Resolved**
     - Small gray label
     - Large bold count
- **Data:** Real-time counts from reports data

### All Reports Card

- **Type:** Main content container
- **Header:**
  - Title: "All Reports"
  - Description: Interaction hint

#### Empty State

- **Trigger:** No reports in data
- **Layout:** Centered vertical stack
- **Elements:**
  - Large alert triangle icon
  - Muted text message

#### Report Item (Repeating)

- **Layout:** Vertical stack with border
- **Hover Effect:** Background color change
- **Sections:**

1. **Header Row**
   - Transaction type (large, bold)
   - Status badge with icon
   - Details subsection:
     - Transaction ID (clickable link)
     - Reporter name
     - Timestamp

2. **Reason Section**
   - Muted background box
   - Label: "Reason"
   - Report reason text

3. **Notes Section**
   - Muted background box
   - Label: "Additional Notes"
   - Detailed notes text

4. **Transaction Value Row** (Conditional)
   - Border top separator
   - Label + price display
   - Right-aligned price

## Interaction Summary

### Primary Actions

- **Back Navigation:** Click back button → Navigate to `/`
- **View Transaction:** Click transaction ID link → Navigate to `/transaction/[id]`
- **Hover Report:** Hover report item → Background highlight

### Status Badge System

- **Pending:** Yellow background, Clock icon
- **Reviewed:** Blue background, AlertTriangle icon
- **Resolved:** Green background, CheckCircle icon

### Data Display

- Real-time count aggregation in summary cards
- Transaction details fetched by ID
- User names resolved from IDs
- Dates and times formatted for display

## Notes for Reimplementation

### Summary Statistics

- Filters reports array by status
- Counts each status type
- Displays in separate cards
- Updates reactively with data

### Report List Structure

- Maps through reports array
- Each report is self-contained item
- Preserves all report data
- Links to related transaction

### Status Icons

- Clock: Pending/waiting
- Alert Triangle: Under review/attention needed
- Check Circle: Resolved/completed
- Icons provide quick visual status

### Data Relationships

- Reports link to transactions by ID
- Reports link to users (reporter) by ID
- Fetches related data for display
- Handles missing relationships gracefully

### Responsive Grid

- Summary cards: 1-3 column responsive
- Report items: Full-width at all sizes
- Horizontal data wraps on mobile
- Consistent padding and spacing

### Visual Hierarchy

1. Summary cards (high-level overview)
2. All reports list (detailed information)
3. Individual report items (scannable cards)
4. Action links (transaction IDs)

### Color Coding

- Status badges use semantic colors
- Green = positive/resolved
- Yellow = pending/warning
- Blue = in-progress/review
- Red = reported/error (from transaction status)

### Layout Patterns

- Gradient background (consistent)
- White header with shadow
- Card-based content sections
- Grid for summary stats
- List for detailed items
- Hover states for interactivity

### Empty State Handling

- Clear message when no data
- Centered icon and text
- Uses alert icon for context
- Maintains card structure

### Information Density

- Summary cards: Minimal (number + label)
- Report items: High (all details visible)
- Expandable structure (boxes within items)
- Scannable list format

### Date/Time Formatting

- Uses utility functions for consistency
- Shows both date and time
- Readable format
- No timezone handling (demo mode)
