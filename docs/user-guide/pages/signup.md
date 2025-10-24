# Signup Page

## Page Overview

**Route Path:** `/signup`
**Purpose:** User registration page with ID upload functionality for new account creation

## Layout Hierarchy Tree

```
Page Root (Full-height gradient background, centered flex)
└── Card (Centered, max-width constrained)
    ├── Card Header
    │   ├── Card Title
    │   └── Card Description
    │
    ├── Form (Card Content)
    │   ├── Full Name Field Group
    │   │   ├── Label
    │   │   └── Input (Text type)
    │   │
    │   ├── Email Field Group
    │   │   ├── Label
    │   │   └── Input (Email type)
    │   │
    │   ├── Password Field Group
    │   │   ├── Label
    │   │   └── Input (Password type)
    │   │
    │   ├── Confirm Password Field Group
    │   │   ├── Label
    │   │   └── Input (Password type)
    │   │
    │   └── ID Verification Field Group
    │       ├── Label
    │       ├── File Input Container
    │       │   ├── File Input
    │       │   └── Upload Icon
    │       └── Helper Text
    │
    └── Card Footer
        ├── Submit Button (Full-width)
        └── Login Prompt (Text with link)
```

## Component Breakdown

### Page Container

- **Type:** Full-viewport centered layout
- **Background:** Gradient (blue to indigo)
- **Alignment:** Centered both horizontally and vertically

### Card Container

- **Width:** Full-width with max-width constraint
- **Padding:** Responsive
- **Shadow:** Default card shadow

### Card Header

- **Title:** Account creation heading
- **Description:** Platform joining message

### Form Section (Card Content)

- **Layout:** Vertical stack with consistent spacing (space-y-4)
- **Fields:**
  1. **Full Name Field**
     - Label: "Full Name"
     - Text input
     - Required field
  2. **Email Field**
     - Label: "Email"
     - Email type validation
     - Required field
  3. **Password Field**
     - Label: "Password"
     - Password type (hidden)
     - Required field
  4. **Confirm Password Field**
     - Label: "Confirm Password"
     - Password type (hidden)
     - Required field
  5. **ID Upload Field**
     - Label: "ID Verification (Mock)"
     - File input with icon
     - Accepts images only
     - Helper text explaining requirement

### Card Footer

- **Layout:** Vertical flex with gaps
- **Elements:**
  1. **Submit Button**
     - Full-width
     - Primary action
  2. **Login Prompt**
     - Small text
     - Link to login page
     - "Already have an account?" message

## Interaction Summary

### Primary Actions

- **Submit Registration:** Fill form → Submit → Create mock user → Redirect to home
- **Upload ID:** Click file input → Select image file → Store file reference
- **Navigate to Login:** Click login link → Navigate to `/login`

### Form Flow

1. User fills all required fields
2. User uploads ID document (optional file)
3. User submits form
4. Mock user object created with timestamp ID
5. User set in global store
6. Redirect to home page

### File Upload Behavior

- Accepts image files only
- Shows upload icon next to input
- Stores file reference in local state
- No actual upload occurs (demo mode)

## Notes for Reimplementation

### Form Structure

- Vertical stacking pattern
- Consistent label-input pairs
- Uniform spacing between groups
- Full-width inputs

### ID Verification Section

- Special field with file input
- Visual upload icon indicator
- Helper text explaining purpose
- Marked as "(Mock)" for demo clarity

### Mock Registration Process

- Generates timestamp-based unique ID
- Creates user with default values:
  - verified: false
  - joinedDate: current date
  - transactionCount: 0
  - rating: 0
- No backend API call
- Immediate authentication post-registration

### Responsive Design

- Card adapts to viewport
- Form fields stack vertically
- Full-width button for mobile
- Padding adjusts for screen size

### Visual Hierarchy

1. Card title (primary focus)
2. Form fields (sequential fill)
3. ID upload (special attention)
4. Submit button (call-to-action)
5. Login link (secondary action)

### State Management

- Local state for all form fields
- Local state for file reference
- Sets current user globally on submit
- No form validation beyond required fields

### Field Types

- Text input (name)
- Email input (email)
- Password inputs (password, confirm)
- File input (ID upload)
- All required except file upload
