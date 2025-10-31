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
 * Get a random user color
 */
export function getRandomUserColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

/**
 * Create a default user presence object
 */
export function createUserPresence(
  id?: string,
  name?: string,
  email?: string
): UserPresence {
  const userId = id ?? `user-${Math.random().toString(36).substring(2, 11)}`;
  return {
    id: userId,
    email: email ?? 'user@example.com',
    name: name ?? 'User',
    color: getRandomUserColor(),
    cursor: null,
    selection: null,
  };
}
