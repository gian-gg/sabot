'use client';

import { useEffect, useState } from 'react';
import type { Awareness } from 'y-protocols/awareness';

interface RemoteCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

interface CursorOverlayProps {
  awareness: Awareness | null;
}

export function CursorOverlay({ awareness }: CursorOverlayProps) {
  const [cursors, setCursors] = useState<RemoteCursor[]>([]);

  useEffect(() => {
    if (!awareness) return;

    const updateCursors = () => {
      const states = awareness.getStates();
      const remoteCursors: RemoteCursor[] = [];

      states.forEach((state, clientId) => {
        // Skip local user
        if (clientId === awareness.clientID) return;

        const user = state.user as {
          name?: string;
          color?: string;
          id?: string;
        };
        const cursor = state.cursor as { x?: number; y?: number } | undefined;

        if (
          user &&
          cursor &&
          cursor.x !== undefined &&
          cursor.y !== undefined
        ) {
          remoteCursors.push({
            id: `cursor-${clientId}`, // Use clientId which should be unique
            name: user.name || 'Anonymous',
            color: user.color || '#1DB954',
            x: cursor.x,
            y: cursor.y,
          });
        }
      });

      setCursors(remoteCursors);
    };

    // Initial update
    updateCursors();

    // Listen for awareness changes
    awareness.on('change', updateCursors);

    return () => {
      awareness.off('change', updateCursors);
    };
  }, [awareness]);

  if (!awareness || cursors.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute transition-all duration-100"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={cursor.color}
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            // stroke="#FFFFFF"
            // strokeWidth={0.5}
          >
            <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
          </svg>

          <div
            className="-mt-1.5 ml-6 rounded px-2 py-1 text-xs font-medium whitespace-nowrap text-white"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
}
