# Feature Flags

This directory contains configuration for feature flags that can be toggled on/off.

## Available Flags

### `enableDisconnectWarning`

**Description:** Controls whether to show warnings and block transactions when the other party disconnects from the WebSocket.

**Default:** `true`

**Environment Variable:** `NEXT_PUBLIC_ENABLE_DISCONNECT_WARNING`

**When Enabled:**

- Shows toast notification when other party disconnects
- Displays red alert banner on the transaction form
- Disables Next/Submit buttons
- Prevents transaction from continuing

**When Disabled:**

- No warnings shown on disconnect
- Transaction can continue even if other party leaves
- Useful for testing or demo purposes

## How to Toggle Features

### Method 1: Environment Variables (Recommended)

Add to your `.env.local` file:

```bash
# Enable disconnect warning (default)
NEXT_PUBLIC_ENABLE_DISCONNECT_WARNING=true

# Disable disconnect warning
NEXT_PUBLIC_ENABLE_DISCONNECT_WARNING=false
```

**Note:** You must restart your dev server after changing environment variables.

### Method 2: Runtime (Advanced)

Import and check feature flags in your code:

```typescript
import { featureFlags, isFeatureEnabled } from '@/lib/config/features';

// Check a specific flag
if (featureFlags.enableDisconnectWarning) {
  // Feature is enabled
}

// Or use helper function
if (isFeatureEnabled('enableDisconnectWarning')) {
  // Feature is enabled
}
```

## Adding New Feature Flags

1. Add the environment variable to `.env.example`
2. Add the flag to `features.ts`:

```typescript
export const featureFlags = {
  // ... existing flags

  /**
   * New Feature Name
   *
   * Description of what the feature does.
   *
   * Default: true/false
   * Environment Variable: NEXT_PUBLIC_YOUR_FEATURE_FLAG
   */
  yourFeatureName: process.env.NEXT_PUBLIC_YOUR_FEATURE_FLAG !== 'false',
} as const;
```

3. Use the flag in your components/hooks
4. Document it here

## Testing

To test the disconnect warning feature:

**With Feature Enabled (default):**

```bash
# In .env.local
NEXT_PUBLIC_ENABLE_DISCONNECT_WARNING=true
```

1. Open two tabs with the same transaction
2. Close one tab
3. Other tab should show warning

**With Feature Disabled:**

```bash
# In .env.local
NEXT_PUBLIC_ENABLE_DISCONNECT_WARNING=false
```

1. Open two tabs with the same transaction
2. Close one tab
3. Other tab continues normally (no warning)
