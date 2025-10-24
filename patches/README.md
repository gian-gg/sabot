# TipTap Race Condition Patches

## Overview

This directory contains patches that fix critical race conditions in TipTap and its dependencies. These patches are automatically applied during `npm install` or `bun install`.

## Patches

### 1. @tiptap/react ReactNodeViewRenderer.tsx

**Issue:** Race condition where `handleSelectionUpdate` callback is triggered before the React renderer DOM is fully initialized.

**Root Cause:** The `editor.on('selectionUpdate', ...)` subscription was called before `updateElementAttributes()`, which initializes the DOM element's attributes.

**Fix:** Reorder initialization sequence:

```typescript
// BEFORE (causes crash):
this.renderer = new ReactRenderer(...)
this.editor.on('selectionUpdate', this.handleSelectionUpdate)  // ← Too early!
this.updateElementAttributes()

// AFTER (safe):
this.renderer = new ReactRenderer(...)
this.updateElementAttributes()  // ← Initialize DOM first
this.editor.on('selectionUpdate', this.handleSelectionUpdate)  // ← Subscribe after
```

**Impact:** Prevents crashes when:

- Adding new lines before tags
- Destroying and recreating nodes
- Rapid selection changes during collaborative editing

**Files Modified:**

- `node_modules/@tiptap/react/src/ReactNodeViewRenderer.tsx` (lines 167-168)

## How Patches Are Applied

The patches are automatically applied via the `postinstall` hook when you run:

```bash
bun install
# or
npm install
```

### Manual Application

If you need to manually apply patches:

```bash
node patches/apply-patches.js
```

## Verifying Patches

To verify that patches are correctly applied:

1. Check that `ReactNodeViewRenderer.tsx` has the correct line order:

   ```bash
   grep -A2 "this.renderer = new ReactRenderer" node_modules/@tiptap/react/src/ReactNodeViewRenderer.tsx
   ```

   Should show:

   ```
   this.updateElementAttributes()
   this.editor.on('selectionUpdate', this.handleSelectionUpdate)
   ```

2. Run the application and verify no crashes occur when:
   - Adding content to the editor
   - Rapidly selecting and deselecting nodes
   - Collaborative editing with multiple users

## Troubleshooting

### Patches Not Applied

If patches aren't applied after `bun install`:

1. Delete `node_modules` and `.bun`:

   ```bash
   rm -rf node_modules .bun
   bun install
   ```

2. Manually run patch script:
   ```bash
   node patches/apply-patches.js
   ```

### Patch Conflicts After Upgrade

If `@tiptap/react` is upgraded and patches fail:

1. Check the new version's `ReactNodeViewRenderer.tsx`
2. Verify if the issue still exists
3. Update `apply-patches.js` accordingly

## Related Issues

- TipTap Issue: [Crash when handling selection updates in custom node views](https://github.com/ueberdosis/tiptap/issues)
- y-webrtc + TipTap: Race conditions during collaborative editing startup
- ProseMirror: Node view lifecycle timing issues

## Notes

- These patches are **non-invasive** - they only reorder existing code, no new logic is added
- Patches are **version-specific** and may need updates if `@tiptap/react` version changes significantly
- The fix follows best practices for React component initialization order
- Similar to Vue's `$nextTick` pattern - ensures DOM is ready before subscribing to events

## Testing Checklist

- [ ] Run `bun install` without errors
- [ ] Verify patches are applied: `node patches/apply-patches.js`
- [ ] Build project: `bun run build`
- [ ] Start dev server: `bun run dev`
- [ ] Open editor in two windows
- [ ] Add content and verify no crashes
- [ ] Test collaborative editing with multiple users
- [ ] Rapid node creation/deletion - no crashes

## License

These patches are provided as-is for the Sabot project. They fix upstream issues in TipTap that will eventually be resolved in the library's releases.
