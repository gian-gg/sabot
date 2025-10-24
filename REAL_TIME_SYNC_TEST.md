# Real-Time Sync Testing Guide

## Issue Fixed ✅

**Problem:** Text was not syncing in real-time between two browser windows
**Root Cause:** The `use-collaboration.ts` file was still using the OLD `SupabaseProvider` instead of the new `WebrtcProvider`
**Solution:** Completely rewrote the file to use y-webrtc with proper Yjs document synchronization

---

## How to Test

### **Step 1: Start Dev Server**

```bash
cd c:\Users\Administrator\Documents\Coding\Projects\sabot
bun run dev
```

### **Step 2: Open Two Browser Windows**

**Window 1 (Creator):**

1. Navigate to: `http://localhost:3000/agreement/test-collaboration/active`
2. Keep this window open

**Window 2 (Collaborator):**

1. Open NEW browser window (or tab in different profile)
2. Navigate to: `http://localhost:3000/agreement/test-collaboration/active` (SAME ID)
3. Position side-by-side with Window 1

---

## **Step 3: Test Real-Time Sync**

### **Console Logs (Verify Connection)**

Open DevTools (F12) → Console tab in BOTH windows

**You should see:**

```
✅ [y-webrtc] Awareness state set successfully
✅ [y-webrtc] Connection status: CONNECTED
✅ [y-webrtc] Peers changed: { added: [...], totalPeers: 1 }
✅ [Yjs] Document updated: 234 bytes
✅ [TiptapEditor] Collaboration state: { hasYdoc: true, hasAwareness: true, isConnected: true ... }
✅ [TiptapEditor] Editor fully initialized and ready for events
```

---

### **Functional Test #1: Basic Typing**

**Action:**

1. Click in editor Window 1
2. Type: "Hello from Window 1"

**Expected Result:**

- ✅ Text appears in Window 1 editor
- ✅ Text appears **instantly** in Window 2 editor
- ✅ Console shows `[Yjs] Document updated: X bytes` in both windows

---

### **Functional Test #2: Collaborative Typing**

**Action:**

1. Window 1: Type "This is " (with space at end)
2. Window 2: Type "amazing" (at the end of the text)

**Expected Result:**

- ✅ Both edits merge correctly (order may vary)
- ✅ Final text: "This is amazing" or "amazingThis is "
- ✅ No conflicts or crashes

---

### **Functional Test #3: See Other User's Cursor**

**Action:**

1. In Window 1: Move cursor/click in editor
2. Look at Window 2

**Expected Result:**

- ✅ See colored cursor appear in Window 2
- ✅ Cursor has user name label (e.g., "Guest-3421")
- ✅ Cursor position matches where you clicked in Window 1

---

### **Functional Test #4: Rapid Typing**

**Action:**

1. Window 1: Type quickly: "The quick brown fox"
2. Window 2: Type quickly: "jumps over the lazy dog"
3. Let both complete simultaneously

**Expected Result:**

- ✅ All text appears (no loss)
- ✅ Text merges via Yjs CRDT (order may vary)
- ✅ No crashes or errors
- ✅ Console shows multiple `[Yjs] Document updated` logs

---

### **Functional Test #5: Add New Lines**

**Action:**

1. Window 1: Click before "brown"
2. Window 1: Press Enter to create new line

**Expected Result:**

- ✅ New line appears in Window 1
- ✅ New line appears **instantly** in Window 2
- ✅ No "Cannot read properties of undefined" crash

---

### **Functional Test #6: Delete Content**

**Action:**

1. Window 1: Select "quick" and press Delete
2. Watch Window 2

**Expected Result:**

- ✅ "quick" deleted from Window 1
- ✅ "quick" deleted **instantly** from Window 2
- ✅ Surrounding text remains intact

---

### **Functional Test #7: Network Interruption**

**Action:**

1. Type in Window 1 while connected
2. Close Window 2 (simulate disconnect)
3. Type more in Window 1
4. Reopen Window 2 (reconnect)

**Expected Result:**

- ✅ Window 1 continues to work offline
- ✅ When Window 2 reconnects, it syncs all missing updates
- ✅ All edits are present in both windows
- ✅ No content loss

---

## **Debugging: If Sync Doesn't Work**

### **Check 1: Connection Status**

Open DevTools Console and type:

```javascript
console.log('Checking WebRTC status...');
```

You should see in console:

```
✅ [y-webrtc] Connection status: CONNECTED
✅ [y-webrtc] Peers changed: { totalPeers: 1 }
```

**If showing DISCONNECTED:**

- ❌ Check signaling server: `wss://signaling.yjs.dev`
- ❌ Verify both windows have SAME agreement ID in URL
- ❌ Check browser WebRTC support (Chrome, Firefox, Edge, Safari)

---

### **Check 2: Agreement ID Matching**

Both windows MUST have identical URLs:

```
http://localhost:3000/agreement/test-collaboration/active
                                 ^^^^^^^^^^^^^^^^^^^^^^^^^
                                 MUST BE SAME!
```

**Common mistake:** Using different IDs like:

- Window 1: `/agreement/test-123/active`
- Window 2: `/agreement/test-456/active` ❌ WRONG!

---

### **Check 3: Document Update Logs**

Watch the console for:

```
[Yjs] Document updated: 234 bytes
[Yjs] Document updated: 512 bytes
[Yjs] Document updated: 301 bytes
```

If you DON'T see these:

- ❌ Yjs document isn't initialized
- ❌ Collaboration extension not configured
- ❌ Content property overwriting Yjs state

---

### **Check 4: Browser Compatibility**

WebRTC requires modern browser:

- ✅ Chrome/Edge 60+
- ✅ Firefox 55+
- ✅ Safari 14+
- ✅ Opera 47+

**Not supported:**

- ❌ IE 11
- ❌ Very old browser versions

---

## **Performance Expectations**

| Test               | Expected    | Actual     |
| ------------------ | ----------- | ---------- |
| Type 1 character   | <100ms sync | **\_\_\_** |
| Type 10 characters | <500ms sync | **\_\_\_** |
| Rapid typing       | No lag      | **\_\_\_** |
| See cursor         | <200ms      | **\_\_\_** |
| Reconnect sync     | <2s         | **\_\_\_** |

---

## **Success Checklist**

- [ ] Both windows show connection logs
- [ ] Typing in one window appears in other instantly
- [ ] See colored cursors from other user
- [ ] Console shows no errors
- [ ] No "Cannot read properties of undefined" crashes
- [ ] Content merges correctly with concurrent edits
- [ ] Network reconnection syncs correctly
- [ ] No data loss

---

## **If Still Not Working**

1. **Check the imports in use-collaboration.ts:**

   ```bash
   grep "WebrtcProvider" src/lib/collaboration/use-collaboration.ts
   ```

   Should output: `import { WebrtcProvider } from 'y-webrtc';`

2. **Verify Yjs is initialized:**

   ```bash
   grep "new Y.Doc()" src/lib/collaboration/use-collaboration.ts
   ```

   Should find the line creating Yjs document

3. **Check TiptapEditor has Collaboration extension:**

   ```bash
   grep "Collaboration.configure" src/components/agreement/editor/tiptap-editor.tsx
   ```

   Should find the extension configuration

4. **Rebuild fresh:**
   ```bash
   rm -rf .next
   bun run build
   bun run dev
   ```

---

## **Common Issues & Fixes**

### ❌ "Still not syncing"

**Fix:** Kill dev server and restart

```bash
# Kill: Ctrl+C in terminal
# Restart:
bun run dev
```

### ❌ "WebSocket connection failed"

**Fix:** Check signaling server is accessible

```bash
# Test in DevTools console:
fetch('wss://signaling.yjs.dev').catch(e => console.log('Server down'))
```

### ❌ "Text appears but slowly"

**Fix:** Could be browser performance, not the app. Try:

- Close other tabs
- Refresh page
- Try different browser

### ❌ "Crashes when adding new line"

**Fix:** Verify TipTap patch was applied

```bash
node patches/apply-patches.js
bun run build
```

---

## **Questions?**

1. Check [COLLABORATION_FIX_SUMMARY.md](COLLABORATION_FIX_SUMMARY.md)
2. Check [patches/README.md](patches/README.md)
3. Review console logs for error messages
4. Check browser DevTools Network tab for WebSocket connections

---

**Status:** Ready to test! 🚀
