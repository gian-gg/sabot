# User Profile Feature - Quick Reference

## Routes

### View User Profile

```
/user/[id]
```

**Examples:**

- `/user/user-1` - Juan Dela Cruz
- `/user/user-2` - Maria Santos
- `/user/user-3` - Carlos Martinez
- `/user/user-4` - Anna Lopez
- `/user/user-5` - Sofia Rodriguez

## Component Hierarchy

```
UserProfilePage (/user/[id]/page.tsx)
│
├─ BackButton
│
├─ ProfileHeader
│  ├─ UserAvatar (with verification overlay)
│  ├─ Name & Verification Badge
│  ├─ Quick Stats (rating, completion rate)
│  ├─ Trust Score Panel
│  ├─ Bio (optional)
│  └─ Badges (optional)
│
├─ Row: Actions & Status
│  ├─ ProfileActions
│  │  ├─ Message Button
│  │  ├─ Share Button
│  │  └─ More Menu (Report, Copy Link)
│  │
│  └─ Card: UserStatus
│     └─ Online/Away/Offline indicator
│
├─ ProfileStats
│  ├─ Stat Cards (Total, Completed, Active, etc.)
│  └─ Performance Metrics (progress bars)
│
├─ TransactionHistoryList
│  ├─ Tabs (All, Completed, Active, Issues)
│  ├─ Sort Controls
│  └─ Transaction Items
│
└─ About Card (if bio exists)
```

## Status Indicators

### Activity Status Colors

- 🟢 **Online**: Green (`#10b981`) with ping animation
- 🟡 **Away**: Yellow (`#f59e0b`)
- ⚪ **Offline**: Gray (muted)

### Transaction Status Colors

- 🟢 **Completed**: Green
- 🔵 **Active**: Blue/Primary
- 🟡 **Pending**: Yellow
- 🟠 **Reported**: Orange
- 🔴 **Disputed**: Red
- ⚪ **Cancelled**: Gray

## Trust Score Ranges

| Score  | Indicator | Color   |
| ------ | --------- | ------- |
| 90-100 | Excellent | Green   |
| 70-89  | Good      | Primary |
| 50-69  | Fair      | Yellow  |
| 0-49   | Low       | Orange  |

## Mock User IDs

| ID       | Name            | Status  | Trust | Transactions | Special                         |
| -------- | --------------- | ------- | ----- | ------------ | ------------------------------- |
| `user-1` | Juan Dela Cruz  | Online  | 92%   | 24           | Trusted Seller badge            |
| `user-2` | Maria Santos    | Away    | 95%   | 18           | Top Rated badge                 |
| `user-3` | Carlos Martinez | Offline | 88%   | 15           | -                               |
| `user-4` | Anna Lopez      | Online  | 85%   | 12           | -                               |
| `user-5` | Sofia Rodriguez | Online  | 94%   | 20           | Fast Responder + Fashion Expert |

## Component Props Quick Reference

### ProfileHeader

```tsx
<ProfileHeader
  profile={PublicUserProfile}
  showTrustScore={boolean} // default: true
/>
```

### ProfileStats

```tsx
<ProfileStats stats={UserProfileStats} />
```

### UserStatus

```tsx
<UserStatus
  activity={UserActivity}
  variant="inline" | "card" | "badge" // default: "inline"
  showLastActive={boolean} // default: true
/>
```

### TransactionHistoryList

```tsx
<TransactionHistoryList
  transactions={ProfileTransaction[]}
  showFilter={boolean} // default: true
/>
```

### ProfileActions

```tsx
<ProfileActions userId={string} userName={string} />
```

## Responsive Breakpoints

| Breakpoint | Width    | Grid Columns |
| ---------- | -------- | ------------ |
| Mobile     | < 768px  | 2            |
| Tablet     | ≥ 768px  | 3            |
| Desktop    | ≥ 1024px | 4            |

## Keyboard Shortcuts (Future)

| Key   | Action        |
| ----- | ------------- |
| `m`   | Message user  |
| `s`   | Share profile |
| `r`   | Report user   |
| `esc` | Close dialogs |

## Testing Checklist

- [ ] Profile loads correctly
- [ ] Trust score displays (if applicable)
- [ ] Activity status shows with correct color
- [ ] Transaction history renders
- [ ] Tabs filter correctly (All, Completed, Active, Issues)
- [ ] Sort by date works
- [ ] Sort by amount works
- [ ] Sort order toggles (asc/desc)
- [ ] Share button copies link
- [ ] Message button shows toast
- [ ] Report button shows toast
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768-1024px)
- [ ] Responsive on desktop (> 1024px)
- [ ] Unknown user returns 404
- [ ] Empty transaction state shows
- [ ] Badges display (if user has them)
- [ ] Bio displays (if user has it)

## Common Issues & Solutions

### Trust score not showing

- Check `showTrustScore` prop is `true`
- Verify `stats.trustScore` exists in profile data

### Transactions not filtering

- Ensure `status` field matches enum values
- Check tab value matches filter logic

### Status not updating

- Phase 1 uses static data
- Real-time updates in Phase 2

### 404 on valid user

- Check user ID in mock data
- Verify route parameter format

## File Structure

```
src/
├── app/user/[id]/page.tsx          # Main page
├── components/user/
│   ├── profile-header.tsx          # Header component
│   ├── profile-stats.tsx           # Stats grid
│   ├── user-status.tsx             # Status indicator
│   ├── transaction-history-list.tsx # History list
│   ├── profile-actions.tsx         # Action buttons
│   ├── user-avatar.tsx             # Avatar (existing)
│   └── verification-badge.tsx      # Badge (existing)
├── lib/mock-data/
│   └── profiles.ts                 # Mock data
└── types/
    └── profile.ts                  # Type definitions
```

## Integration Points (Phase 2)

### API Endpoints (Future)

```
GET  /api/user/[id]/profile
GET  /api/user/[id]/transactions
POST /api/user/[id]/message
POST /api/user/[id]/report
GET  /api/user/[id]/activity-status
```

### Real-time Updates (Future)

- WebSocket connection for activity status
- Server-Sent Events for transaction updates
- Optimistic UI updates for actions

---

**Quick Start**: Visit `/user/user-1` to see the feature in action!
