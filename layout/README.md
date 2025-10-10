# Layout Documentation

This directory contains comprehensive structural documentation for the P2P Transaction Verification App. The documentation focuses exclusively on **layout, component hierarchy, and structural patterns** — not on visual design, styling, or content.

## Purpose

This documentation serves as a reference for:

- **Rebuilding** the application in a different framework
- **Redesigning** the UI while preserving structural logic
- **Migrating** to new design systems or component libraries
- **Understanding** page composition and component relationships
- **Onboarding** new developers to the codebase structure

## What This Documentation Covers

✅ **Included:**

- Page layout hierarchies
- Component nesting and relationships
- UI element grouping and organization
- Interaction points (buttons, links, modals)
- Route structure and navigation flows
- Dynamic segments and parameters
- Conditional rendering patterns
- Multi-step workflows
- State-based UI variations

❌ **Excluded:**

- CSS classes and Tailwind tokens
- Colors, fonts, and visual styling
- Text content and copy
- Brand names and icons (except structural role)
- Image assets
- Animation implementation details (concept only)

## Documentation Structure

```
docs/layout/
├── README.md                      # This file
├── site-map.md                    # Complete route overview
├── layout-architecture.json       # Machine-readable structure
└── pages/                         # Individual page documentation
    ├── home.md
    ├── login.md
    ├── signup.md
    ├── profile.md
    ├── emergency-contact.md
    ├── reports.md
    ├── transaction-new.md
    ├── transaction-detail.md
    ├── transaction-invite.md
    └── transaction-active.md
```

## File Descriptions

### `site-map.md`

Complete overview of all routes in the application:

- Route paths and file locations
- Authentication requirements
- Dynamic segments and query parameters
- Navigation patterns and flows
- Route categories and purposes
- Authentication flow
- Layout inheritance

### `layout-architecture.json`

Machine-readable JSON structure containing:

- All routes with metadata
- Component hierarchies
- Reusable UI components
- Layout patterns
- Navigation flows
- Data relationships
- State management structure

### `pages/*.md`

Individual page documentation, each containing:

- **Page Overview:** Route, purpose, authentication
- **Layout Hierarchy Tree:** ASCII tree showing component nesting
- **Component Breakdown:** Detailed section descriptions
- **Interaction Summary:** User actions and flows
- **Notes for Reimplementation:** Patterns, dependencies, considerations

## Page Documentation Format

Each page document follows this structure:

```markdown
# Page Name

## Page Overview

- Route path
- Purpose
- Authentication requirements

## Layout Hierarchy Tree

ASCII tree showing component nesting

## Component Breakdown

Detailed descriptions of each section

## Interaction Summary

User actions and navigation flows

## Notes for Reimplementation

Implementation patterns and considerations
```

## How to Use This Documentation

### For Redesign Projects

1. Read `site-map.md` to understand overall structure
2. Review individual page docs for layout patterns
3. Use hierarchy trees to maintain component relationships
4. Reference interaction summaries to preserve user flows

### For Framework Migration

1. Start with `layout-architecture.json` for programmatic parsing
2. Map existing components to new framework equivalents
3. Use page docs to verify component nesting
4. Preserve navigation flows and state transitions

### For Onboarding

1. Begin with `site-map.md` for route overview
2. Read 2-3 page docs to understand documentation style
3. Reference specific pages as needed during development
4. Use hierarchy trees to locate components in codebase

### For Component Library Migration

1. Identify reusable components in `layout-architecture.json`
2. Map existing UI components to new library
3. Use component breakdown sections for variant requirements
4. Maintain layout patterns during migration

## Key Concepts

### Layout Patterns

**Centered Card**

- Full-height container with centered card
- Used for: Login, Signup, Emergency Contact
- Mobile-friendly single-column layout

**Full-Page with Header**

- Fixed header navigation bar
- Main content area with max-width constraint
- Used for: Home, Profile, Reports, Transaction pages

**Two-Column Grid**

- Responsive grid (2 columns desktop, 1 mobile)
- Parallel information display
- Used for: Transaction Detail, Active Transaction

**Multi-Step Wizard**

- Sequential step-based flow
- State-driven UI changes
- Used for: Create Transaction, Invite Flow

### Common Components

**Card System**

- Primary content container
- Variants: Header, Title, Description, Content, Footer
- Used across all pages

**Button System**

- Multiple variants: default, outline, ghost, destructive
- Size variants: sm, default, lg
- Consistent interaction pattern

**Status Badges**

- Color-coded status indicators
- Standard colors: green, blue, yellow, red
- Used for transaction and report statuses

**User Cards**

- Avatar + name + stats pattern
- Clickable links to profiles
- Consistent across pages

### Navigation Patterns

**Primary Flows**

1. Create Transaction: Home → New → Active → Complete
2. Accept Invitation: Invite → Verify → Transaction → Active
3. View Transaction: Home → Detail → Actions → Complete
4. Report Issue: Transaction → Report Dialog → Reports

**Back Navigation**

- Consistent back button in headers
- Returns to home or previous page
- Clear escape routes from all pages

## Generic Component Names

This documentation uses generic component names that can be mapped to any framework:

| Generic Name | Current (React/Next.js) | Example Alt Framework                       |
| ------------ | ----------------------- | ------------------------------------------- |
| Card         | `<Card>`                | `<v-card>` (Vue), `<mat-card>` (Angular)    |
| Button       | `<Button>`              | `<button>` (HTML), `<b-button>` (Bootstrap) |
| Input        | `<Input>`               | `<input>` (HTML), `<TextField>` (MUI)       |
| Header       | `<header>`              | `<AppBar>` (MUI), `<Navbar>` (Bootstrap)    |
| Grid         | CSS Grid                | Flexbox, Bootstrap Grid                     |
| Dialog       | `<Dialog>`              | `<Modal>` (Bootstrap), `<v-dialog>` (Vue)   |

## State Machine Documentation

Transaction status transitions are documented as state machines:

```
pending → active → completed
   ↓                   ↓
reported ← ← ← ← ← ← ←
```

Each page document notes:

- Available states
- Transition triggers
- UI changes per state
- Conditional rendering rules

## Responsive Patterns

All layouts follow these responsive patterns:

- **Desktop:** Full layout with grids and columns
- **Tablet:** Collapsed grids, maintained spacing
- **Mobile:** Single-column stacking, full-width buttons

Specific breakpoints are documented in page files where relevant.

## Data Flow Documentation

Each page document includes:

- **Data Dependencies:** What data is needed
- **State Management:** Local vs global state
- **Dynamic Loading:** How data is fetched
- **Error States:** Handling missing data

## Authentication Flow

Authentication patterns documented:

- **Public Routes:** `/login`, `/signup`
- **Protected Routes:** Most pages, redirect to login
- **Optional Auth:** `/profile/[id]` (read-only)

## Contributing to This Documentation

When adding new pages or features:

1. **Create page documentation** in `pages/[name].md`
2. **Update `site-map.md`** with new route
3. **Update `layout-architecture.json`** with structure
4. **Follow existing format** for consistency
5. **Focus on structure**, not styling
6. **Use generic component names**
7. **Document all interaction flows**

## Version Information

- **Last Updated:** 2025-10-10
- **Codebase Version:** Initial release
- **Framework:** Next.js 14+ (App Router)
- **Documentation Format:** Markdown + JSON

## Questions?

This documentation describes **what** components exist and **how** they're organized, not **why** design decisions were made. For design rationale, see separate design documentation (if available).

For implementation details, refer to the actual codebase at:

- `/app` - Page components
- `/components/ui` - Reusable UI components
- `/lib` - Utilities and state management
