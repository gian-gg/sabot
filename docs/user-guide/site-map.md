# Site Map - P2P Transaction Verification App

## Route Structure Overview

This Next.js application uses the App Router with file-based routing. All routes are defined in the `/app` directory.

---

## Public Routes (No Authentication Required)

### `/login`

- **File:** `app/login/page.tsx`
- **Purpose:** User authentication page
- **Layout:** Centered card with login form
- **Key Features:**
  - Email and password inputs
  - Mock authentication
  - Demo credentials display
  - Link to signup page

### `/signup`

- **File:** `app/signup/page.tsx`
- **Purpose:** New user registration
- **Layout:** Centered card with registration form
- **Key Features:**
  - Full name, email, password fields
  - ID verification file upload
  - Mock user creation
  - Link to login page

---

## Protected Routes (Authentication Required)

### `/` (Home Dashboard)

- **File:** `app/page.tsx`
- **Purpose:** Main dashboard showing all transactions
- **Layout:** Header + transaction list + CTA
- **Key Features:**
  - User authentication check (redirects to login)
  - All transactions display
  - User profile link in header
  - Logout functionality
  - Create transaction button
- **Navigation:**
  - → `/profile/[id]` (user profile)
  - → `/transaction/[id]` (view transaction)
  - → `/transaction/new` (create transaction)
  - → `/login` (if not authenticated)

### `/profile/[id]`

- **File:** `app/profile/[id]/page.tsx`
- **Dynamic Route:** User ID as parameter
- **Purpose:** Display user profile and transaction history
- **Layout:** Header + profile card + transaction list
- **Key Features:**
  - User information display
  - Avatar with initials
  - Verification status badge
  - User statistics (rating, join date, transaction count)
  - Emergency contact button
  - Transaction history filtering
- **Navigation:**
  - → `/` (back to home)
  - → `/emergency` (add emergency contact)
  - → `/transaction/[id]` (view transaction)

### `/emergency`

- **File:** `app/emergency/page.tsx`
- **Purpose:** Add or update emergency contact information
- **Layout:** Header + form card
- **Key Features:**
  - Contact name, phone, relationship fields
  - Form pre-population if contact exists
  - Success state with auto-redirect
  - Informational notice about usage
- **Navigation:**
  - → `/` (back to home, or auto-redirect after save)

### `/reports`

- **File:** `app/reports/page.tsx`
- **Purpose:** View all transaction reports dashboard
- **Layout:** Header + summary cards + reports list
- **Key Features:**
  - Summary statistics (pending, reviewed, resolved)
  - Detailed report listings
  - Status badges with icons
  - Clickable transaction links
- **Navigation:**
  - → `/` (back to home)
  - → `/transaction/[id]` (view reported transaction)

---

## Transaction Routes

### `/transaction/new`

- **File:** `app/transaction/new/page.tsx`
- **Purpose:** Multi-step transaction creation with AI analysis
- **Layout:** Multi-step wizard (4 steps)
- **Key Features:**
  - **Step 1:** Upload chat screenshot
  - **Step 2:** Share invite link, wait for other party
  - **Step 3:** AI analysis loading
  - **Step 4:** Review AI-generated summary and activate
- **Navigation:**
  - → `/` (back to home)
  - → `/transaction/[id]/active` (after activation)

### `/transaction/invite`

- **File:** `app/transaction/invite/page.tsx`
- **Query Parameter:** `data` (base64 encoded invitation)
- **Purpose:** Accept invitation and verify screenshot
- **Layout:** Multi-step verification (3 steps)
- **Key Features:**
  - **Step 1:** Review invitation details
  - **Step 2:** Upload screenshot for verification
  - **Step 3:** AI verification results
  - Authentication check (redirects to login)
  - Accept/decline invitation
- **Navigation:**
  - → `/` (back to home or after decline)
  - → `/login` (if not authenticated)
  - → `/transaction/[id]` (after verification)

### `/transaction/[id]`

- **File:** `app/transaction/[id]/page.tsx`
- **Dynamic Route:** Transaction ID as parameter
- **Purpose:** View and manage transaction details
- **Layout:** Header + status card + details grid + actions
- **Key Features:**
  - Transaction status display
  - Buyer and seller information
  - Transaction details (price, location, date/time)
  - State-based UI (pending/active/completed/reported)
  - Start transaction button (pending)
  - Confirm completion (active)
  - Report issue dialog
  - Verification steps indicator (pending)
  - Active transaction indicator (active)
- **State Machine:**
  - Pending → Active (start transaction)
  - Active → Completed (both parties confirm)
  - Any → Reported (submit report)
- **Navigation:**
  - → `/` (back to home)
  - → `/profile/[id]` (view participant)

### `/transaction/[id]/active`

- **File:** `app/transaction/[id]/active/page.tsx`
- **Dynamic Route:** Transaction ID as parameter
- **Purpose:** Active transaction page with prominent live indicators
- **Layout:** Header + animated status banner + details + completion controls
- **Key Features:**
  - Prominent animated status indicator
  - Transaction details display
  - Participant information
  - Dual-party completion flow
  - Waiting state indicators
- **Navigation:**
  - → `/` (back to home or auto-redirect after completion)

---

## Route Hierarchy

```
/
├── login
├── signup
├── profile/
│   └── [id]
├── emergency
├── reports
└── transaction/
    ├── new
    ├── invite
    ├── [id]
    └── [id]/
        └── active
```

---

## Dynamic Segments

### User ID: `[id]`

- Used in: `/profile/[id]`
- Format: String identifier (e.g., "user-1", "user-2")
- Source: User data from `data/users.json` or newly created users

### Transaction ID: `[id]`

- Used in: `/transaction/[id]`, `/transaction/[id]/active`
- Format: String identifier (e.g., "tx-1", "tx-2", "tx-1234567890")
- Source: Transaction data from `data/transactions.json` or created transactions

---

## Query Parameters

### Invite Link Data

- Route: `/transaction/invite`
- Parameter: `data`
- Format: Base64 encoded JSON string
- Contains:
  - `transactionId`: Transaction identifier
  - `invitedBy`: Inviter's user ID
  - `invitedByName`: Inviter's display name
  - `timestamp`: Invitation creation time

### Verification Flag

- Route: `/transaction/[id]`
- Parameter: `verified` (optional)
- Format: Boolean string
- Purpose: Indicates transaction came from verification flow

---

## Navigation Patterns

### Primary Navigation

- **App Logo/Title** (in header) → Home dashboard
- **Back Buttons** → Previous page or home
- **User Profile Button** → `/profile/[currentUser.id]`
- **Logout Button** → Clears session → `/login`

### Transaction Flow Navigation

1. Home → Create Transaction
2. Upload Screenshot → Wait for Other Party
3. AI Analysis → Review Summary
4. Activate → Active Transaction Page
5. Confirm Complete → Home (with success)

### Invite Flow Navigation

1. Receive Invite Link → `/transaction/invite?data=...`
2. Review Details → Upload Screenshot
3. Verify → View Results
4. Proceed → Transaction Detail Page

### Report Flow

1. Transaction Detail → Click Report Issue
2. Fill Report Form → Submit
3. Status Changes to Reported
4. View in Reports Dashboard

---

## Authentication Flow

### Login Process

- User enters email (no password validation)
- System finds user in mock data
- Sets current user in global state
- Redirects to home dashboard

### Protected Route Pattern

- Check for current user on mount
- Redirect to `/login` if not authenticated
- Render null while checking
- Show content when authenticated

### Logout Process

- Clear current user from state
- Clear active transaction from state
- Redirect to `/login`

---

## Layout Inheritance

### Root Layout

- **File:** `app/layout.tsx`
- **Applies to:** All routes
- **Provides:**
  - HTML structure
  - Font configuration (Inter)
  - Global styles
  - Metadata (title, description)

### Page-Level Patterns

- **Header:** Present on most pages (white bar with shadow)
- **Main Content:** Max-width container with responsive padding
- **Background:** Gradient (blue to indigo) on most pages
- **Cards:** Primary content containers

---

## Special Routes

### Root Route (`/`)

- Default landing page
- Requires authentication
- Shows all transactions (proof of concept mode)
- Primary entry point after login

### Error States

- User not found: Shows card with error message + back button
- Transaction not found: Shows card with error message + home button
- Invalid invite: Shows error message + home link

---

## Route Categories by Purpose

### Authentication

- `/login`
- `/signup`

### User Management

- `/profile/[id]`
- `/emergency`

### Transaction Management

- `/transaction/new` (creation)
- `/transaction/invite` (invitation handling)
- `/transaction/[id]` (viewing/management)
- `/transaction/[id]/active` (live transaction)

### Reporting & Monitoring

- `/reports` (all reports dashboard)

### Dashboard

- `/` (main overview)

---

## Notes

### Client-Side Routing

- All navigation uses Next.js `<Link>` component or `useRouter()` hook
- No full page reloads for internal navigation
- Maintains SPA behavior

### Data Loading

- All pages use "use client" directive
- Data fetched from JSON files in `/data` directory
- No server-side data fetching
- Real-time state updates via Zustand store

### Route Protection

- Implemented at page level (not layout)
- Uses `useEffect` hook for auth check
- Redirects handled by `useRouter().push()`
- No middleware-based protection

### URL Structure

- Clean, semantic paths
- RESTful resource naming
- Dynamic segments for IDs
- Query parameters for data passing
