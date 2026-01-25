const fs = require('fs');
const path = require('path');

/**
 * Apply patches for TipTap race condition fix
 * This ensures the selectionUpdate event subscription happens AFTER
 * the renderer is fully initialized, preventing crashes.
 */

const tiptapReactPath = path.join(
  __dirname,
  '../node_modules/@tiptap/react/src/ReactNodeViewRenderer.tsx'
);

function applyTiptapReactPatch() {
  if (!fs.existsSync(tiptapReactPath)) {
    console.log('⚠️  @tiptap/react not installed yet, skipping patch');
    return;
  }

  try {
    let content = fs.readFileSync(tiptapReactPath, 'utf8');

    // Check if patch is already applied
    if (
      content.includes('this.updateElementAttributes()\n    this.editor.on')
    ) {
      console.log('✅ @tiptap/react patch already applied');
      return;
    }

    // Apply the patch: move updateElementAttributes before editor.on
    const pattern =
      /this\.editor\.on\('selectionUpdate', this\.handleSelectionUpdate\)\s+this\.updateElementAttributes\(\)/;
    const replacement =
      "this.updateElementAttributes()\n    this.editor.on('selectionUpdate', this.handleSelectionUpdate)";

    if (content.match(pattern)) {
      content = content.replace(pattern, replacement);
      fs.writeFileSync(tiptapReactPath, content, 'utf8');
      console.log(
        '✅ @tiptap/react ReactNodeViewRenderer patch applied successfully'
      );
    } else {
      console.log(
        '⚠️  Could not find pattern to patch in ReactNodeViewRenderer.tsx'
      );
      console.log(
        '   This might be OK if already patched or different version'
      );
    }
  } catch (error) {
    console.error('❌ Error applying @tiptap/react patch:', error.message);
    process.exit(1);
  }
}

// Apply patches
applyTiptapReactPatch();
