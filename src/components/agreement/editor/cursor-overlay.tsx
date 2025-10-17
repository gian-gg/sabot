// Cursor Overlay Component
// Displays colored cursors for all active collaborators

interface Cursor {
  userId: string;
  x: number;
  y: number;
  name: string;
  color: string;
}

interface CursorOverlayProps {
  cursors: Cursor[];
}

export default function CursorOverlay({ cursors }: CursorOverlayProps) {
  // TODO: Replace with v0-generated component
  // This will show absolutely positioned cursors with smooth transitions
  return (
    <div style={{ position: 'relative', pointerEvents: 'none' }}>
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          style={{
            position: 'absolute',
            left: cursor.x,
            top: cursor.y,
            color: cursor.color,
            transition: 'transform 150ms ease-out',
          }}
        >
          <span>▲</span>
          <span
            style={{
              backgroundColor: cursor.color,
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px',
              marginLeft: '8px',
            }}
          >
            {cursor.name}
          </span>
        </div>
      ))}
    </div>
  );
}
