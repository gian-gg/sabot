export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join('');
}

// Returns the value from FormData for the given key, or null if not present or empty
export const getFormValueOrNull = (
  entry: FormDataEntryValue | null
): string | null => {
  const v = typeof entry === 'string' ? entry : '';
  const trimmed = v.trim();
  return trimmed === '' ? null : trimmed;
};
