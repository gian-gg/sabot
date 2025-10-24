# Design System

This document describes the comprehensive design system used across Sabot, ensuring consistency and providing clear guidelines for developers adding new components or features.

The design system is built on **Tailwind CSS v4**, **shadcn/ui** components, and **Radix UI** primitives with a dark-only, minimal aesthetic focused on trust and transparency.

---

## Overview

Sabot follows an **S-Tier SaaS design standard** inspired by Stripe, Airbnb, and Linear. The system emphasizes:

- **Dark, flat, minimal aesthetics** for reduced cognitive load
- **Green accent system** for primary interactions and trust indicators
- **Smooth, purposeful animations** (150-300ms transitions)
- **Accessibility-first approach** with WCAG 2.1 AA compliance
- **Glass morphism effects** for modern, layered visual hierarchy
- **Container queries** for responsive, component-level design

For more details on component architecture and patterns, see [UI Components & Patterns](components.md).

---

## Color Palette

Sabot uses a **dark-only color system** built on OkLCH color space for perceptually uniform colors across all surfaces.

### Primary Colors

| Token                  | Value                          | Usage                                       | Notes                                                        |
| ---------------------- | ------------------------------ | ------------------------------------------- | ------------------------------------------------------------ |
| **Primary**            | `#01d06c` (bright neon green)  | Primary CTAs, accent elements, focus states | High contrast, accessible green perfect for trust indicators |
| **Primary Foreground** | `oklch(0.145 0 0)` (very dark) | Text on primary backgrounds                 | Ensures contrast for text on green buttons                   |
| **Ring**               | `#01d06c`                      | Focus rings and outlines                    | Same as primary for visual consistency                       |

### Background & Surface Colors

| Token          | Value              | Usage                            | Examples                         |
| -------------- | ------------------ | -------------------------------- | -------------------------------- |
| **Background** | `oklch(0.145 0 0)` | Main page background             | Page body, root container        |
| **Card**       | `oklch(0.205 0 0)` | Card and container backgrounds   | Transaction cards, data displays |
| **Popover**    | `oklch(0.205 0 0)` | Dropdown and tooltip backgrounds | Same as card for consistency     |

### Text & Foreground Colors

| Token                | Value                             | Usage                            | Notes                                  |
| -------------------- | --------------------------------- | -------------------------------- | -------------------------------------- |
| **Foreground**       | `oklch(0.985 0 0)` (nearly white) | Primary text color               | Default text on dark backgrounds       |
| **Card Foreground**  | `oklch(0.985 0 0)`                | Text on card surfaces            | Maintains contrast on card backgrounds |
| **Muted Foreground** | `oklch(0.708 0 0)`                | Placeholder text, secondary info | Lower contrast for secondary content   |

### Neutral & UI Element Colors

| Token         | Value              | Usage                            | Examples                              |
| ------------- | ------------------ | -------------------------------- | ------------------------------------- |
| **Secondary** | `oklch(0.269 0 0)` | Secondary component backgrounds  | Inactive states, secondary buttons    |
| **Muted**     | `oklch(0.269 0 0)` | Muted/disabled state backgrounds | Disabled inputs, inactive tabs        |
| **Accent**    | `oklch(0.269 0 0)` | Accent interactions              | Hover states, highlights              |
| **Border**    | `oklch(0.22 0 0)`  | Default border color             | Input borders, card borders, dividers |
| **Input**     | `oklch(0.22 0 0)`  | Input field background           | Form inputs, textarea, select fields  |

### Semantic Colors

| Token                      | Value                             | Usage                           | Examples                             |
| -------------------------- | --------------------------------- | ------------------------------- | ------------------------------------ |
| **Destructive**            | `oklch(0.704 0.191 22.216)` (red) | Dangerous actions, errors       | Delete buttons, error states, alerts |
| **Destructive Foreground** | `oklch(0.985 0 0)`                | Text on destructive backgrounds | White text on red backgrounds        |

### Chart Colors

Used for data visualization and analytics:

| Token       | Value                        | Color   | Hue  |
| ----------- | ---------------------------- | ------- | ---- |
| **Chart 1** | `oklch(0.488 0.243 264.376)` | Purple  | 264° |
| **Chart 2** | `oklch(0.696 0.17 162.48)`   | Cyan    | 162° |
| **Chart 3** | `oklch(0.769 0.188 70.08)`   | Yellow  | 70°  |
| **Chart 4** | `oklch(0.627 0.265 303.9)`   | Magenta | 303° |
| **Chart 5** | `oklch(0.645 0.246 16.439)`  | Orange  | 16°  |

### Sidebar Colors

| Token                          | Value                        | Usage                  |
| ------------------------------ | ---------------------------- | ---------------------- |
| **Sidebar**                    | `oklch(0.205 0 0)`           | Sidebar background     |
| **Sidebar Foreground**         | `oklch(0.985 0 0)`           | Sidebar text           |
| **Sidebar Primary**            | `oklch(0.488 0.243 264.376)` | Active sidebar items   |
| **Sidebar Primary Foreground** | `oklch(0.985 0 0)`           | Text on active items   |
| **Sidebar Accent**             | `oklch(0.269 0 0)`           | Hover/accent states    |
| **Sidebar Accent Foreground**  | `oklch(0.985 0 0)`           | Text on accents        |
| **Sidebar Border**             | `oklch(1 0 0 / 10%)`         | Subtle sidebar borders |
| **Sidebar Ring**               | `oklch(0.556 0 0)`           | Focus states           |

### Implementing Custom Colors

All colors are defined as CSS custom properties in [src/styles/globals.css](../../src/styles/globals.css). To use colors in components:

```tsx
// Using Tailwind utilities
<div className="bg-primary text-primary-foreground">Primary Button</div>

// Using CSS variables (for dynamic styling)
<div style={{ color: 'var(--primary)' }}>Primary Text</div>

// In CSS modules or globals
.myElement {
  background-color: var(--card);
  color: var(--card-foreground);
}
```

---

## Typography

Sabot uses the **Roobert** font family across all components, providing a modern, geometric aesthetic optimized for UI.

### Font Family

**Primary Font:** Roobert

- **Fallbacks:** -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
- **CSS Variable:** `--font-sans` (used throughout Tailwind config)
- **Display Strategy:** `font-display: swap` for optimal web font loading

### Font Weights & Variants

| Weight             | File                 | Usage                    | Examples                     |
| ------------------ | -------------------- | ------------------------ | ---------------------------- |
| **300** (Light)    | Roobert-Light.otf    | Headings, light emphasis | Display text, large titles   |
| **400** (Regular)  | Roobert-Regular.otf  | Body text, default       | Paragraphs, standard text    |
| **500** (Medium)   | Roobert-Medium.otf   | Emphasized text, labels  | Form labels, small headings  |
| **600** (SemiBold) | Roobert-SemiBold.otf | Important content        | Section headings, highlights |
| **700** (Bold)     | Roobert-Bold.otf     | Strong emphasis          | Page titles, badges, alerts  |

### Font Size & Hierarchy

Sabot uses Tailwind's default type scale. Common sizes:

| Size     | Value    | Usage                    | Tailwind Class |
| -------- | -------- | ------------------------ | -------------- |
| **XS**   | 0.75rem  | Small labels, timestamps | `text-xs`      |
| **SM**   | 0.875rem | Secondary text, captions | `text-sm`      |
| **BASE** | 1rem     | Body text (default)      | `text-base`    |
| **LG**   | 1.125rem | Large body text, labels  | `text-lg`      |
| **XL**   | 1.25rem  | Subheadings              | `text-xl`      |
| **2XL**  | 1.5rem   | Section titles           | `text-2xl`     |
| **3XL**  | 1.875rem | Page titles              | `text-3xl`     |
| **4XL**  | 2.25rem  | Major headings           | `text-4xl`     |

### Line Height & Spacing

```tsx
// Heading hierarchy with optimal line height
<h1 className="text-4xl font-bold leading-tight">Main Title</h1>        // 1.25
<h2 className="text-2xl font-semibold leading-snug">Section</h2>        // 1.375
<h3 className="text-xl font-semibold leading-normal">Subsection</h3>    // 1.5
<p className="text-base leading-normal">Body paragraph</p>             // 1.5
<p className="text-sm leading-relaxed text-muted-foreground">Meta</p>  // 1.625
```

### Font Usage Patterns

```tsx
// Page titles
<h1 className="text-4xl font-bold">Transaction Details</h1>

// Section headings
<h2 className="text-2xl font-semibold">Verification Status</h2>

// Subsection headings
<h3 className="text-lg font-semibold">Safety Indicators</h3>

// Body text
<p className="text-base leading-normal">Standard paragraph text with information.</p>

// Small emphasis
<span className="text-sm font-medium">Important detail</span>

// Muted secondary text
<p className="text-sm text-muted-foreground">Secondary information</p>

// Labels and form text
<label className="text-sm font-medium">Field Label</label>
```

---

## Spacing & Layout

Sabot uses **Tailwind's default spacing scale** with custom radius configurations for consistent, predictable layouts.

### Spacing Scale

Spacing is based on an 8px grid system (Tailwind default):

| Scale  | Value          | Tailwind       | Examples         |
| ------ | -------------- | -------------- | ---------------- |
| **0**  | 0              | `p-0`, `m-0`   | No spacing       |
| **1**  | 0.25rem (4px)  | `p-1`, `m-1`   | Tight spacing    |
| **2**  | 0.5rem (8px)   | `p-2`, `m-2`   | Standard spacing |
| **3**  | 0.75rem (12px) | `p-3`, `m-3`   | —                |
| **4**  | 1rem (16px)    | `p-4`, `m-4`   | Common padding   |
| **6**  | 1.5rem (24px)  | `p-6`, `m-6`   | Card padding     |
| **8**  | 2rem (32px)    | `p-8`, `m-8`   | Section spacing  |
| **12** | 3rem (48px)    | `p-12`, `m-12` | Large gaps       |
| **16** | 4rem (64px)    | `p-16`, `m-16` | Major sections   |

### Radius Configuration

Custom radius variants provide fine-grained control:

| Token  | Formula               | Value | Usage                                 |
| ------ | --------------------- | ----- | ------------------------------------- |
| **sm** | `var(--radius) - 4px` | 4px   | Small, subtle corners                 |
| **md** | `var(--radius) - 2px` | 6px   | Medium components                     |
| **lg** | `var(--radius)`       | 8px   | Default corner radius (cards, modals) |
| **xl** | `var(--radius) + 4px` | 12px  | Large UI components                   |

```tsx
// Applying radius
<div className="rounded-sm">Small radius (4px)</div>        // Checkboxes, small inputs
<div className="rounded-md">Medium radius (6px)</div>      // Buttons, select boxes
<div className="rounded-lg">Large radius (8px)</div>       // Cards, modals (default)
<div className="rounded-xl">Extra large radius (12px)</div> // Large containers
```

### Layout Patterns

#### Container with Header

When implementing pages that use the [Header component](../../../src/components/core/header.tsx), **always add `pt-18` (72px) to your main container** to account for the fixed header (56px height + 16px buffer).

```tsx
// ✅ CORRECT: Pages with fixed header
<main className="container mx-auto mt-20 h-full w-full px-4 py-8">
  {/* Content here */}
</main>

// Or for full-width containers with header
<div className="pt-18 min-h-screen">
  {/* Your content */}
</div>
```

#### Responsive Containers

```tsx
// Max-width container with responsive padding
<div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
  {/* Header content */}
</div>

// Mobile-first responsive grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* Grid items */}
</div>
```

### Breakpoints

Sabot uses Tailwind's standard breakpoints:

| Prefix  | Size   | Use Case               |
| ------- | ------ | ---------------------- |
| (none)  | —      | Mobile-first (< 640px) |
| **sm**  | 640px  | Small tablets          |
| **md**  | 768px  | Tablets                |
| **lg**  | 1024px | Desktops               |
| **xl**  | 1280px | Large desktops         |
| **2xl** | 1536px | Extra large screens    |

```tsx
// Mobile-first responsive design
<div className="px-4 sm:px-6 lg:px-8">
  <div className="text-sm sm:text-base md:text-lg lg:text-xl">
    Responsive text
  </div>
</div>
```

---

## Component Styling

Sabot's components follow consistent patterns for visual and interactive design. All components are built with [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/) primitives.

### Common Component Patterns

#### Button Variants

Buttons use **Class Variance Authority (CVA)** for variant management:

```tsx
import { Button } from '@/components/ui/button';

// Variants
<Button>Default (primary)</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button>Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

**Button States:**

- **Default**: Green primary color (`#01d06c`), full opacity
- **Hover**: `opacity-90` (slightly transparent)
- **Active**: `scale-[0.98]` (slight scale down for tactile feedback)
- **Focus**: `ring-[3px]` green focus ring with `ring-ring/50` transparency

#### Input Fields

```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="Type here..." />
<Input type="email" />
<Input disabled />
<Input aria-invalid="true" /> {/* Shows validation error state */}
```

**Input States:**

- **Default**: Dark background (`bg-input`), subtle border
- **Focus**: Green ring (3px), border updated to ring color
- **Invalid**: Red border + red ring with `ring-destructive/20`
- **Disabled**: Reduced opacity

#### Card Layout

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>;
```

**Card Structure:**

- **Background**: `bg-card` with border
- **Padding**: `py-6` vertical, `px-6` horizontal (CardContent)
- **Gap**: `gap-6` between sections
- **Radius**: `rounded-xl` (12px)
- **Shadow**: `shadow-sm` (subtle depth)

#### Badge

```tsx
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

**Badge States:**

- **Inline display**: `inline-flex` with fixed width `w-fit`
- **Size**: `text-xs` with `px-2 py-0.5` padding
- **Shape**: `rounded-md` corners
- **No wrap**: `whitespace-nowrap` + `shrink-0`

#### Checkbox & Interactive Elements

```tsx
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox />
<Checkbox disabled />
<Checkbox defaultChecked />
```

**Checkbox States:**

- **Default**: Border, light background
- **Checked**: `bg-primary` with white checkmark
- **Focus**: `ring-[3px]` green focus ring
- **Size**: `size-4` (16px square)

#### Alert/Toast

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

<Alert>
  <AlertTitle>Title</AlertTitle>
  <AlertDescription>Description</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

**Alert Variants:**

- **Default**: Card background with grid layout for icons
- **Destructive**: Red text, error styling

#### Select & Dropdown

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1">Option 1</SelectItem>
    <SelectItem value="opt2">Option 2</SelectItem>
  </SelectContent>
</Select>;
```

**Select States:**

- **Trigger**: Border with green focus ring
- **Content**: Slide/fade animations (`data-[state=open]:animate-in`)
- **Items**: Hover with `bg-accent` background

#### Dialog & Modals

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>;
```

**Dialog Properties:**

- **Overlay**: `bg-black/50` semi-transparent
- **Content**: Centered, max-width responsive
- **Animations**: `zoom-in-95`, `fade-in-0` on open
- **Close Button**: Subtle opacity with hover effect

---

## UI Behavior & Interaction

### Focus States

All interactive elements include visible focus states for accessibility:

```tsx
// Focus ring pattern used across components
className = 'focus-visible:ring-ring/50 focus-visible:ring-[3px]';
```

- **Ring Width**: 3px for visibility
- **Ring Color**: Primary green (`--ring: #01d06c`)
- **Ring Opacity**: 50% transparency for subtle look
- **Applied on**: Buttons, inputs, interactive components

### Transitions & Animations

Smooth transitions enhance user experience. Standard timing:

| Duration      | Use Case              | Examples                             |
| ------------- | --------------------- | ------------------------------------ |
| **100ms**     | Fast interactions     | Opacity changes, hover effects       |
| **150-200ms** | Standard interactions | Tooltip appearance, menu transitions |
| **300ms**     | Significant changes   | Dialog opens, full page transitions  |

```tsx
// Standard transition utility
className="transition-all"              // All properties
className="transition-opacity"          // Opacity only
className="transition-[color,box-shadow]" // Specific properties

// With custom timing
style={{ transition: 'background 100ms ease-out' }}
```

### Button Interaction Flow

```tsx
// Visual feedback on interaction
1. Hover: opacity-90 (slightly faded)
2. Active: scale-[0.98] (slightly pressed)
3. Focus: ring-[3px] focus ring visible
4. Disabled: opacity-50, pointer-events-none
```

### Input Validation

```tsx
// Input with validation
<Input
  aria-invalid={hasError}
  className="aria-invalid:ring-destructive/20 aria-invalid:border-destructive"
/>
```

### Custom Utility Classes

Reusable CSS utilities for common patterns:

```css
/* Glass morphism effect */
.glass {
  @apply bg-card/50 border-border border backdrop-blur-xl;
}

/* Quick button styles */
.btn-primary {
  @apply rounded-md bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] transition-all hover:opacity-90 active:scale-[0.98];
}

.btn-outline {
  @apply rounded-md border border-[var(--primary)] px-4 py-2 text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)];
}

/* Card styling */
.card {
  @apply bg-card border-border rounded-xl border p-4;
}

/* Muted text */
.text-muted {
  @apply text-[var(--muted-foreground)];
}
```

### Scrollbar Styling

Custom scrollbars maintain design consistency:

```css
/* Standard scrollbar (all browsers) */
scrollbar-width: thin;
scrollbar-color: var(--primary) var(--background);

/* Webkit browsers (Chrome, Safari, Edge) */
scrollbar-width: 8px;
scrollbar-background: var(--background);
scrollbar-thumb: var(--primary) with hover: color-mix(in srgb, var(--primary) 80%, white);
```

---

## Header Component & Layout

The [Header component](../../../src/components/core/header.tsx) is fixed at the top of the viewport:

```tsx
import { Header } from '@/components/core/header';

export default function Layout() {
  return (
    <>
      <Header />
      {/* Main content with pt-18 for spacing */}
      <main className="pt-18">{/* Page content */}</main>
    </>
  );
}
```

### Header Properties

| Property       | Value             | Purpose                      |
| -------------- | ----------------- | ---------------------------- |
| **Position**   | `fixed`           | Stays at top while scrolling |
| **Height**     | `h-14` (56px)     | Compact header               |
| **Background** | `.glass` effect   | Frosted glass with blur      |
| **Z-index**    | `z-50`            | Above all content            |
| **Border**     | Animated gradient | Mouse-reactive border        |

### Required Container Padding

**⚠️ CRITICAL**: When using the Header, always add `pt-18` (72px top padding) to your main content container:

```tsx
// ✅ Correct - Pages with Header
<div className="pt-18">
  <div className="mx-auto max-w-7xl px-4">{/* Page content */}</div>
</div>;

// Components receiving header style
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-18">{children}</main>
    </>
  );
}
```

The 72px accounts for:

- Header height: 56px (`h-14`)
- Visual breathing room: 16px

---

## Design Tokens Reference

All design tokens are centralized in [src/styles/globals.css](../../src/styles/globals.css) and exposed via Tailwind CSS.

### CSS Custom Properties

Use CSS variables for dynamic styling or when standard utilities don't apply:

```tsx
// Using CSS variables directly
const styles = {
  backgroundColor: 'var(--card)',
  color: 'var(--card-foreground)',
  borderColor: 'var(--border)',
};

// In inline styles
<div style={{ color: 'var(--primary)' }}>Primary Green Text</div>;
```

### Accessing Colors in Tailwind

All colors are available as Tailwind utilities:

```tsx
// Background colors
className = 'bg-primary bg-secondary bg-card bg-background';

// Text colors
className = 'text-primary text-foreground text-muted-foreground';

// Border colors
className = 'border-border';

// Ring colors (focus states)
className = 'ring-ring';
```

### Animation Utilities

Sabot includes `tw-animate-css` for additional animation utilities:

```tsx
// Available animation utilities
className = 'animate-fade-in animate-slide-in animate-scale-in';

// Custom scroll animation
className = 'animate-scroll';

// Hover state
className = 'animate-scroll:hover:animation-pause-state';
```

---

## Responsive Design

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```tsx
// Mobile-first responsive layout
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Grid adapts: 1 col → 2 cols → 3 cols → 4 cols */}
</div>
```

### Common Breakpoint Patterns

```tsx
// Text responsiveness
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>

// Padding responsiveness
<div className="px-4 sm:px-6 md:px-8 lg:px-12">
  {/* Container with responsive padding */}
</div>

// Display responsiveness
<div className="flex-col sm:flex-row lg:flex-col">
  {/* Changes layout direction */}
</div>

// Width responsiveness
<div className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
  {/* Responsive width */}
</div>
```

---

## Implementation Guidelines

### Creating New Components

When adding new components, follow these principles:

1. **Use shadcn/ui primitives** - Don't reinvent components already in the system
2. **Respect the color system** - Use design tokens, not hardcoded colors
3. **Follow spacing rhythm** - Use 8px-based spacing scale
4. **Include focus states** - All interactive elements need visible focus rings
5. **Add smooth transitions** - Use 100-300ms timing based on interaction type
6. **Support variants** - Use CVA for component variants (default, secondary, etc.)
7. **Test responsiveness** - Verify at 375px, 768px, and 1440px viewports
8. **Ensure accessibility** - WCAG 2.1 AA compliance minimum

### Component Template

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const componentVariants = cva(
  // Base styles
  'rounded-lg transition-all focus-visible:ring-ring/50 focus-visible:ring-[3px]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-border hover:bg-accent',
      },
      size: {
        sm: 'px-3 py-1 text-sm',
        default: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ComponentProps extends VariantProps<typeof componentVariants> {
  className?: string;
}

export function MyComponent({ variant, size, className }: ComponentProps) {
  return (
    <div className={cn(componentVariants({ variant, size }), className)}>
      {/* Component content */}
    </div>
  );
}
```

### Styling Best Practices

```tsx
// ✅ DO: Use design tokens
<div className="bg-card text-card-foreground border border-border">

// ❌ DON'T: Hardcode colors
<div style={{ backgroundColor: '#333', color: '#fff', borderColor: '#666' }}>

// ✅ DO: Use Tailwind utilities
<button className="rounded-md px-4 py-2 transition-all hover:opacity-90">

// ❌ DON'T: Use inline styles for standard properties
<button style={{ borderRadius: '6px', padding: '8px 16px' }}>

// ✅ DO: Use custom utilities
<div className="glass">

// ❌ DON'T: Repeat complex style patterns
<div className="bg-card/50 border-border border backdrop-blur-xl">
```

---

## Related Documentation

- [UI Components & Patterns](components.md) - Detailed component library reference
- [Development Workflow](development.md) - Code quality and testing standards
- [Tech Stack](tech-stack.md) - Technology choices and dependencies
- [Component Architecture](components.md#component-organization) - How components are organized

For visual design principles and detailed UX patterns, refer to the project's design review documentation and S-Tier SaaS standards.

---

## Resources

- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **Radix UI**: https://www.radix-ui.com
- **OkLCH Color Space**: https://oklch.com
- **Figma Design System**: (internal design documentation)
