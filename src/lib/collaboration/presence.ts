import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';

export interface UserPresence {
  id: string;
  email: string;
  name: string;
  color: string;
  cursor: {
    line: number;
    ch: number;
  } | null;
  selection: {
    anchor: number;
    head: number;
  } | null;
}

const USER_COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#45B7D1', // blue
  '#FFA07A', // light salmon
  '#98D8C8', // mint
  '#F7DC6F', // yellow
  '#BB8FCE', // purple
  '#85C1E2', // sky blue
];

/**
 * Create and manage user presence awareness
 */
export function createAwareness(ydoc: Y.Doc): awarenessProtocol.Awareness {
  const awareness = new awarenessProtocol.Awareness(ydoc);

  // Assign random color to user
  const randomColor =
    USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];

  // Set initial awareness state
  awareness.setLocalState({
    user: {
      id: `user-${Math.random().toString(36).substring(2, 11)}`,
      email: 'user@example.com',
      name: 'User',
      color: randomColor,
      cursor: null,
      selection: null,
    },
  });

  return awareness;
}

/**
 * Get all active users from awareness
 */
export function getActiveUsers(
  awareness: awarenessProtocol.Awareness
): UserPresence[] {
  const users: UserPresence[] = [];
  const states = awareness.getStates();

  states.forEach((state) => {
    if (state.user) {
      users.push(state.user as UserPresence);
    }
  });

  return users.filter((user) => user.id !== awareness.clientID);
}

/**
 * Update local cursor position
 */
export function updateCursorPosition(
  awareness: awarenessProtocol.Awareness,
  line: number,
  ch: number
): void {
  const state = awareness.getLocalState();
  if (state) {
    awareness.setLocalState({
      ...state,
      user: {
        ...(state.user as UserPresence),
        cursor: { line, ch },
      },
    });
  }
}

/**
 * Update local selection
 */
export function updateSelection(
  awareness: awarenessProtocol.Awareness,
  anchor: number,
  head: number
): void {
  const state = awareness.getLocalState();
  if (state) {
    awareness.setLocalState({
      ...state,
      user: {
        ...(state.user as UserPresence),
        selection: { anchor, head },
      },
    });
  }
}
