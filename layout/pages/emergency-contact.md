# Emergency Contact Page

## Page Overview

**Route Path:** `/emergency`
**Purpose:** Form to add or update emergency contact information for safety during transactions

## Layout Hierarchy Tree

```
Page Root (Full-height gradient background)
├── Header
│   └── Container (Max-width wrapper)
│       └── Back Button (Link to home)
│
└── Main Content (Max-width constrained wrapper with padding)
    └── Card
        ├── Card Header
        │   ├── Card Title (Icon + text)
        │   └── Card Description
        │
        └── Card Content (Conditional rendering)
            ├── Success State (If saved)
            │   ├── Success Icon (Large, centered)
            │   ├── Confirmation Heading
            │   └── Confirmation Message
            │
            └── Form State (If not saved)
                ├── Contact Name Field Group
                │   ├── Label
                │   └── Input (Text type)
                │
                ├── Phone Number Field Group
                │   ├── Label
                │   └── Input (Tel type)
                │
                ├── Relationship Field Group
                │   ├── Label
                │   └── Select Dropdown
                │       ├── Placeholder option
                │       ├── Family Member option
                │       ├── Friend option
                │       ├── Partner option
                │       ├── Colleague option
                │       └── Other option
                │
                ├── Info Notice Box
                │   └── Explanation text
                │
                └── Button Group
                    ├── Save Button (Primary, flex-1)
                    └── Cancel Button (Outline variant)
```

## Component Breakdown

### Header

- **Type:** Fixed navigation bar
- **Structure:** White background with shadow
- **Content:** Back button with arrow icon

### Card Container

- **Width:** Max-width constrained for form readability
- **Structure:** Standard card with header and content

### Card Header

- **Title:** Icon + "Emergency Contact" text
- **Icon:** UserPlus icon
- **Description:** Explains purpose of emergency contact

### Form Section (Initial State)

- **Layout:** Vertical stack with consistent spacing
- **Fields:**
  1. **Contact Name**
     - Label: "Contact Name"
     - Text input
     - Required field
  2. **Phone Number**
     - Label: "Phone Number"
     - Tel type input
     - Placeholder with format example
     - Required field
  3. **Relationship**
     - Label: "Relationship"
     - Native select dropdown
     - Options: Family Member, Friend, Partner, Colleague, Other
     - Required field

### Info Notice Box

- **Type:** Informational alert
- **Background:** Blue tint
- **Border:** Blue border
- **Content:** Explains when contact will be notified
- **Layout:** Paragraph with bold "Note:" prefix

### Button Group

- **Layout:** Horizontal flex with gap
- **Buttons:**
  1. **Save Button**
     - Flex-1 (takes available space)
     - Primary variant
     - Submit type
  2. **Cancel Button**
     - Fixed width
     - Outline variant
     - Returns to previous page

### Success State

- **Layout:** Centered vertical stack
- **Elements:**
  1. **Success Icon**
     - Large checkmark circle
     - Green color
     - Centered with margin below
  2. **Confirmation Heading**
     - Large text
     - "Contact Saved!" message
  3. **Confirmation Message**
     - Muted color
     - Explains what was saved

## Interaction Summary

### Primary Actions

- **Fill Form:** Enter contact name, phone, and relationship
- **Save Contact:** Submit form → Store in global state → Show success → Auto-redirect after 2s
- **Cancel:** Click cancel → Navigate back to previous page
- **Return Home:** Back button → Navigate to `/`

### Form Flow

1. User fills three required fields
2. User clicks Save button
3. Data stored in global emergency contact state
4. Success state displays
5. Automatic redirect to home after 2 seconds

### State Management

- Pre-fills form if emergency contact already exists
- Local state for form fields
- Local state for saved status
- Global store for persistence

## Notes for Reimplementation

### Form Pre-population

- Checks global store for existing emergency contact
- Pre-fills form fields if data exists
- Allows updating existing contact

### Success Flow

- Shows immediate visual feedback (success icon)
- Brief message confirmation
- Auto-redirect with timeout
- User doesn't need to manually navigate away

### Dropdown Options

- Native HTML select element
- Clear relationship categories
- "Other" as catch-all option
- Placeholder prompts selection

### Info Notice Pattern

- Blue color scheme (informative, not warning)
- Explains system behavior
- Addresses potential user questions
- Positioned before action buttons

### Responsive Design

- Card centers on page
- Form fields stack vertically
- Button group adjusts on mobile
- Consistent padding and margins

### Visual Hierarchy

1. Card title with icon (context)
2. Form fields (input area)
3. Info notice (contextual help)
4. Action buttons (primary focus)
5. Success state (confirmation)

### Security Note

- No validation of phone format
- No verification of contact
- Demo implementation (no backend)
- Data stored in client-side state only

### Accessibility Considerations

- Labels properly associated with inputs
- Required fields marked
- Clear field types (tel for phone)
- Visible focus states

### Layout Patterns

- Gradient background (consistent with app)
- White header with shadow
- Centered card layout
- Standard form field spacing (space-y-4)
- Info box with distinct styling
