# PartyKit Integration for Real-Time Collaboration

This project uses **PartyKit** for real-time collaborative editing with Yjs and Tiptap.

## 🚀 Quick Start

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
bun install
```

### 2. Run Development Servers

#### Option A: Run both servers together (recommended)

```bash
bun run dev:all
```

This starts both Next.js (port 3000) and PartyKit (port 1999) concurrently.

#### Option B: Run servers separately

Terminal 1 - Next.js:

```bash
bun run dev
```

Terminal 2 - PartyKit:

```bash
bun run dev:party
```

### 3. Test Collaboration

1. Navigate to `http://localhost:3000/collab-test`
2. Open the same URL in multiple browser tabs
3. Start typing in the editor - changes will sync in real-time!

## 📁 File Structure

```
party/
├── collaboration.ts    # Yjs collaboration server
└── server.ts          # Main PartyKit server

src/lib/collaboration/
├── use-collaboration.ts    # React hook for PartyKit + Yjs
└── presence.ts            # User presence utilities

src/components/shared/
└── collaborative-editor.tsx    # Collaborative editor component
```

## ⚙️ Configuration

### Environment Variables

Add to `.env`:

```env
NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
```

For production, use your PartyKit deployment URL:

```env
NEXT_PUBLIC_PARTYKIT_HOST=your-app.partykit.dev
```

### PartyKit Config

See `partykit.json`:

```json
{
  "name": "sabot",
  "main": "party/server.ts",
  "parties": {
    "collaboration": "party/collaboration.ts"
  }
}
```

## 🔧 How It Works

### Server Side (`party/collaboration.ts`)

Uses `y-partykit` to create a WebSocket server that:

- Syncs Yjs document state across clients
- Handles user awareness (cursors, selections)
- Persists document state (optional)

### Client Side (`src/lib/collaboration/use-collaboration.ts`)

The `useCollaboration` hook:

- Creates a Yjs document
- Connects to PartyKit via `YPartyKitProvider`
- Manages connection state and awareness
- Returns `ydoc`, `provider`, `awareness`, and connection status

### Editor Component (`src/components/shared/collaborative-editor.tsx`)

Uses Tiptap with:

- `Collaboration` extension (Yjs integration)
- `CollaborationCursor` extension (show other users' cursors)
- Connection status UI
- User count display

## 📦 Dependencies

- `partykit` - PartyKit server runtime
- `partysocket` - WebSocket client for PartyKit
- `y-partykit` - Yjs ↔ PartyKit adapter
- `yjs` - CRDT library for real-time collaboration
- `@tiptap/*` - Rich text editor framework

## 🌐 Deployment

### Deploy to PartyKit

```bash
# Login to PartyKit
npx partykit login

# Deploy
npx partykit deploy
```

### Update Environment Variable

After deployment, update `.env`:

```env
NEXT_PUBLIC_PARTYKIT_HOST=your-app.partykit.dev
```

## 🎯 Usage Example

```tsx
import { useCollaboration } from '@/lib/collaboration/use-collaboration';

function MyEditor() {
  const { ydoc, provider, awareness, isConnected, localUser } =
    useCollaboration({
      documentId: 'my-document-id',
      enabled: true,
      user: {
        name: 'John Doe',
        color: '#3b82f6',
      },
    });

  // Use ydoc with Tiptap Collaboration extension
  const editor = useEditor({
    extensions: [
      Collaboration.configure({
        document: ydoc ?? undefined,
        field: 'default',
      }),
      CollaborationCursor.configure({
        provider: provider ?? undefined,
        user: {
          name: localUser.name,
          color: localUser.color,
        },
      }),
    ],
  });

  return (
    <div>
      <p>Status: {isConnected ? '✅ Connected' : '⏳ Connecting'}</p>
      <EditorContent editor={editor} />
    </div>
  );
}
```

## 🐛 Debugging

PartyKit server logs:

```bash
bun run dev:party
```

Browser console shows:

- `[PartyKit]` - Connection and sync events
- `[Yjs]` - Document updates
- `[useCollaboration]` - Hook lifecycle

## 📚 Resources

- [PartyKit Docs](https://docs.partykit.io/)
- [Yjs Docs](https://docs.yjs.dev/)
- [Tiptap Docs](https://tiptap.dev/)
- [y-partykit GitHub](https://github.com/partykit/partykit/tree/main/packages/y-partykit)

## 🎉 Features

- ✅ Real-time collaborative editing
- ✅ User awareness (see other users' cursors)
- ✅ Connection status indicators
- ✅ Automatic reconnection
- ✅ Works with Next.js serverless architecture
- ✅ Production-ready with PartyKit deployment
