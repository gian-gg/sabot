# Login Page

## Page Overview

**Route Path:** `/login`
**Purpose:** Authentication page for existing users with mock login functionality

## Layout Hierarchy Tree

```
Page Root (Full-height gradient background, centered flex)
└── Card (Centered, max-width constrained)
    ├── Card Header
    │   ├── Card Title
    │   └── Card Description
    │
    ├── Form (Card Content)
    │   ├── Email Field Group
    │   │   ├── Label
    │   │   └── Input (Email type)
    │   │
    │   ├── Password Field Group
    │   │   ├── Label
    │   │   └── Input (Password type)
    │   │
    │   └── Forgot Password Link
    │
    └── Card Footer
        ├── Submit Button (Full-width)
        ├── Sign-up Prompt (Text with link)
        └── Demo Credentials Notice (Info box)
```

## Component Breakdown

### Page Container

- **Type:** Full-viewport centered layout
- **Background:** Gradient (blue to indigo)
- **Alignment:** Centered both horizontally and vertically

### Card Container

- **Width:** Full-width with max-width constraint
- **Padding:** Responsive (p-4 on container)
- **Shadow:** Default card shadow

### Card Header

- **Title:** Large text welcoming users back
- **Description:** Explains the login context

### Form Section (Card Content)

- **Layout:** Vertical stack with consistent spacing
- **Fields:**
  1. **Email Field**
     - Label above input
     - Email type validation
     - Placeholder text
     - Required field
  2. **Password Field**
     - Label above input
     - Password type (hidden text)
     - Placeholder text
     - Required field
  3. **Forgot Password Link**
     - Small text size
     - Primary color with hover underline

### Card Footer

- **Layout:** Vertical flex with gaps
- **Elements:**
  1. **Submit Button**
     - Full-width
     - Default variant
     - Primary action
  2. **Sign-up Prompt**
     - Small text with link to signup
     - "Don't have an account?" message
  3. **Demo Credentials Box**
     - Secondary background
     - Small text
     - Lists example email for testing

## Interaction Summary

### Primary Actions

- **Login Submit:** Enter email → Submit form → Validate user → Redirect to home
- **Navigate to Signup:** Click signup link → Navigate to `/signup`
- **Forgot Password:** Click forgot password link (currently no-op)

### Form Validation

- Both fields required
- Email format validation
- Finds user by email in mock data
- Alert shown if user not found

### Navigation Flow

- Successful login → Redirect to `/`
- Unsuccessful login → Alert with example email
- Click signup link → Navigate to `/signup`

## Notes for Reimplementation

### Centered Layout Pattern

- Uses flex center on full viewport height
- Card positioned in middle of screen
- Responsive padding around card

### Form Structure

- Vertical field stacking
- Consistent label-input grouping
- Spacing between field groups (space-y-4)
- Full-width submit button

### Demo Mode Notice

- Prominent info box at bottom
- Secondary background color
- Lists example credentials
- Helps users understand mock authentication

### Accessibility Considerations

- Labels properly associated with inputs
- Required field indicators
- Clear error messaging
- Keyboard navigable form

### Visual Hierarchy

1. Card title (primary focus)
2. Form fields (interaction area)
3. Submit button (call-to-action)
4. Secondary links (lower priority)
5. Demo notice (contextual help)

### State Management

- Local state for email and password
- Sets current user in global store on success
- No password validation (demo mode)
