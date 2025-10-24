/**
 * Utility functions for smart conflict resolution
 * Handles case-insensitive comparison and similarity detection
 */

/**
 * Normalize a string for comparison (lowercase, trim, remove extra spaces)
 */
export function normalizeString(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if two strings are similar enough to be considered the same
 * @param str1 First string
 * @param str2 Second string
 * @param threshold Similarity threshold (0-1, default 0.7)
 */
export function areStringsSimilar(
  str1: string,
  str2: string,
  threshold: number = 0.7
): boolean {
  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);

  // Exact match after normalization
  if (normalized1 === normalized2) {
    return true;
  }

  // Check if one contains the other (for cases like "iPhone 13" vs "iPhone 13 Pro")
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }

  // Check for common words (for cases like "digital portrait of daughter" vs "digital portrait of daughter, to be completed...")
  const words1 = normalized1.split(/\s+/).filter((w) => w.length > 2);
  const words2 = normalized2.split(/\s+/).filter((w) => w.length > 2);

  if (words1.length > 0 && words2.length > 0) {
    const commonWords = words1.filter((word) => words2.includes(word));
    const commonRatio =
      commonWords.length / Math.min(words1.length, words2.length);

    // If more than 60% of words are common, consider them similar
    if (commonRatio >= 0.6) {
      return true;
    }
  }

  // Calculate Levenshtein distance similarity
  const similarity = calculateSimilarity(normalized1, normalized2);
  return similarity >= threshold;
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Check if two values are similar enough to not be considered a conflict
 */
export function areValuesSimilar(
  value1: unknown,
  value2: unknown,
  threshold: number = 0.7
): boolean {
  // Handle null/undefined
  if (value1 === value2) return true;
  if (value1 == null || value2 == null) return false;

  // Handle strings
  if (typeof value1 === 'string' && typeof value2 === 'string') {
    return areStringsSimilar(value1, value2, threshold);
  }

  // Handle numbers (with small tolerance for floating point)
  if (typeof value1 === 'number' && typeof value2 === 'number') {
    return Math.abs(value1 - value2) < 0.02;
  }

  // Handle arrays
  if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) return false;
    return value1.every((item, index) =>
      areValuesSimilar(item, value2[index], threshold)
    );
  }

  // For other types, use strict equality
  return value1 === value2;
}

/**
 * Get the more detailed value between two values
 * For strings, the longer one is considered more detailed
 * For numbers, the larger one is considered more detailed
 * For arrays, the one with more items is considered more detailed
 */
export function getMoreDetailedValue<T>(value1: T, value2: T): T {
  // Handle null/undefined
  if (value1 == null) return value2;
  if (value2 == null) return value1;

  // Handle strings - prefer longer, more descriptive text
  if (typeof value1 === 'string' && typeof value2 === 'string') {
    // If one is a substring of the other, prefer the longer one
    const normalized1 = normalizeString(value1);
    const normalized2 = normalizeString(value2);

    if (normalized1.includes(normalized2)) return value1;
    if (normalized2.includes(normalized1)) return value2;

    // Otherwise, prefer the longer string
    return value1.length >= value2.length ? value1 : value2;
  }

  // Handle numbers - prefer the larger number (more specific)
  if (typeof value1 === 'number' && typeof value2 === 'number') {
    return value1 >= value2 ? value1 : value2;
  }

  // Handle arrays - prefer the one with more items
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return value1.length >= value2.length ? value1 : value2;
  }

  // For other types, return the first value
  return value1;
}

/**
 * Check if values are in conflict (not similar enough)
 */
export function hasConflict(
  values: unknown[],
  threshold: number = 0.7
): boolean {
  const validValues = values.filter(
    (v) => v !== undefined && v !== null && v !== ''
  );

  if (validValues.length <= 1) return false;

  // Check if all values are similar to each other
  for (let i = 0; i < validValues.length; i++) {
    for (let j = i + 1; j < validValues.length; j++) {
      if (!areValuesSimilar(validValues[i], validValues[j], threshold)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get the best value from a list of values, preferring the most detailed one
 */
export function getBestValue<T>(
  values: T[],
  threshold: number = 0.7
): T | undefined {
  const validValues = values.filter(
    (v) => v !== undefined && v !== null && v !== ''
  );

  if (validValues.length === 0) return undefined;
  if (validValues.length === 1) return validValues[0];

  // If all values are similar, return the most detailed one
  if (!hasConflict(validValues, threshold)) {
    return validValues.reduce((best, current) =>
      getMoreDetailedValue(best, current)
    );
  }

  // If there are conflicts, return undefined (user needs to choose)
  return undefined;
}
