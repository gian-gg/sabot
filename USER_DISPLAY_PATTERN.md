# User Display Pattern Documentation

## Overview

This document explains how to properly display user information (name and avatar) throughout the application, following the established pattern used in transaction participants.

## Pattern Implementation

### 1. **Avatar Display**

Use conditional rendering to show either the user's image or a fallback icon.

```tsx
{
  user_avatar_url ? (
    <Image
      src={user_avatar_url}
      alt={user_name || 'User'}
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div className="from-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br to-blue-500/20">
      <User className="h-4 w-4" />
    </div>
  );
}
```

**Key Points:**

- Use `next/image` Image component (not HTML img tag)
- Always provide `width` and `height` attributes
- Apply `rounded-full` for circular avatars
- Use `object-cover` to maintain aspect ratio
- Add `shrink-0` to prevent squishing

### 2. **Avatar Fallback**

When no image is available, show an icon in a gradient background.

```tsx
<div className="from-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br to-blue-500/20">
  <User className="h-4 w-4" />
</div>
```

**Styling:**

- `bg-linear-to-br from-primary/20 to-blue-500/20` - subtle gradient background
- Centered flex container
- User icon from lucide-react

### 3. **User Name Display**

Always have fallback logic for user names.

```tsx
<p className="text-sm font-semibold">
  {user_name || user_email || 'Unknown User'}
</p>
```

**Priority Order:**

1. `user_name` (preferred)
2. `user_email` (secondary)
3. `'Unknown User'` (fallback)

### 4. **User Email Display**

Display email with muted styling.

```tsx
<p className="text-muted-foreground text-xs">{user_email || 'No email'}</p>
```

## Complete Example

```tsx
<div className="bg-muted/20 flex items-center gap-3 rounded-lg p-3">
  {/* Avatar */}
  {comment.user_avatar_url ? (
    <Image
      src={comment.user_avatar_url}
      alt={comment.user_name || 'User'}
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div className="from-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br to-blue-500/20">
      <User className="h-4 w-4" />
    </div>
  )}

  {/* User Info */}
  <div className="flex-1">
    <p className="text-sm font-semibold">
      {comment.user_name || 'Unknown User'}
    </p>
    <p className="text-muted-foreground text-xs">
      {comment.user_email || 'No email'}
    </p>
  </div>
</div>
```

## Where This Pattern Is Used

1. **Transaction Participants Modal**
   - File: `src/components/home/components/transactions/transaction-details-modal.tsx`
   - Shows creator and invitees with their avatars and names

2. **Comment Thread**
   - File: `src/components/transaction/comment-thread.tsx`
   - Displays comment authors with their profile information

## Design Consistency

### Colors & Styling

- **Avatar size:** `h-8 w-8` or `h-10 w-10` depending on context
- **Name text:** `text-sm font-semibold`
- **Email text:** `text-muted-foreground text-xs`
- **Background:** Use `bg-muted/20` for subtle backgrounds
- **Hover:** Apply hover states for interactive elements

### Imports Required

```tsx
import Image from 'next/image';
import { User } from 'lucide-react';
```

## Best Practices

✅ **Do:**

- Always use Next.js `Image` component
- Provide width and height for images
- Use `shrink-0` on avatars to prevent scaling
- Include fallback displays
- Use semantic color classes (`text-muted-foreground`)
- Apply consistent spacing with `gap-3`

❌ **Don't:**

- Use HTML `<img>` tags
- Skip width/height on images
- Use hardcoded colors (use Tailwind classes)
- Forget email/name fallbacks
- Use Avatar component from shadcn when displaying actual images
