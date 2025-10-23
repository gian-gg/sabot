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

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString; // Return original string if invalid date
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
