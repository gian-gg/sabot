# UI Components & Patterns

This section describes common component patterns and references to code.

Component organization

- `src/components/ui/` — low-level primitives (Button, Input, Popover, Tooltip, etc.).
- `src/components/home/` & `src/components/user/` — page-specific compositions.

Button pattern

- The `Button` component (see `src/components/ui/button.tsx`) uses `class-variance-authority` for variants and `clsx` + `twMerge` for class composition. This enables:
  - Variant-driven styles (default, destructive, outline, ghost, link)
  - Size variants (sm, default, lg, icon)

Accessibility

- Favor Radix UI primitives for complex interactions (menus, dialogs, popovers).
- Ensure keyboard focus states and aria attributes are present on interactive components.

Design tokens

- Tailwind config (not included here) should expose design tokens for colors, spacing, and radii. Keep UI consistent by referencing those tokens instead of arbitrary values.

Examples

Button usage:

```tsx
<Button variant="secondary">Start</Button>
<Button asChild>
  <a href="/signup">Sign up</a>
</Button>
```

Pattern: server component usage

- Use server components for data fetching and render stable UI on the server, hydrate client interactivity only where needed.
