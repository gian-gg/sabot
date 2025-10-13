/**
 * Utility functions for mapping condition text to dropdown options
 * Provides flexible fuzzy matching for condition values
 */

export interface ConditionOption {
  value: string;
  label: string;
  keywords: string[];
  synonyms: string[];
}

export const CONDITION_OPTIONS: ConditionOption[] = [
  {
    value: 'brand-new',
    label: 'Brand New',
    keywords: ['brand', 'new', 'unused', 'sealed', 'mint'],
    synonyms: [
      'brand new',
      'brand-new',
      'unopened',
      'factory sealed',
      'mint condition',
    ],
  },
  {
    value: 'like-new',
    label: 'Like New',
    keywords: ['like', 'new', 'barely', 'used', 'minimal'],
    synonyms: [
      'like new',
      'like-new',
      'barely used',
      'minimal wear',
      'almost new',
    ],
  },
  {
    value: 'excellent',
    label: 'Excellent',
    keywords: ['excellent', 'perfect', 'great', 'outstanding', 'pristine'],
    synonyms: [
      'excellent condition',
      'perfect condition',
      'great condition',
      'outstanding condition',
    ],
  },
  {
    value: 'good',
    label: 'Good',
    keywords: ['good', 'decent', 'nice', 'solid', 'functional'],
    synonyms: [
      'good condition',
      'decent condition',
      'nice condition',
      'solid condition',
    ],
  },
  {
    value: 'fair',
    label: 'Fair',
    keywords: ['fair', 'average', 'okay', 'acceptable', 'moderate'],
    synonyms: [
      'fair condition',
      'average condition',
      'okay condition',
      'acceptable condition',
    ],
  },
  {
    value: 'poor',
    label: 'For Parts',
    keywords: ['poor', 'bad', 'damaged', 'broken', 'parts', 'repair'],
    synonyms: [
      'poor condition',
      'bad condition',
      'damaged',
      'broken',
      'for parts',
      'needs repair',
    ],
  },
];

/**
 * Calculate similarity score between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

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
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '');
}

/**
 * Check if text contains any of the keywords
 */
function hasKeywords(text: string, keywords: string[]): boolean {
  const normalizedText = normalizeText(text);
  return keywords.some((keyword) => normalizedText.includes(keyword));
}

/**
 * Check if text matches any synonyms
 */
function hasSynonyms(text: string, synonyms: string[]): boolean {
  const normalizedText = normalizeText(text);
  return synonyms.some((synonym) => {
    const normalizedSynonym = normalizeText(synonym);
    return (
      normalizedText.includes(normalizedSynonym) ||
      normalizedSynonym.includes(normalizedText)
    );
  });
}

/**
 * Map condition text to the closest dropdown option
 * @param conditionText - The extracted condition text
 * @param threshold - Minimum similarity threshold (0-1, default 0.6)
 * @returns The best matching condition value or empty string if no good match
 */
export function mapConditionToOption(
  conditionText: string,
  threshold: number = 0.6
): string {
  if (!conditionText || conditionText.trim() === '') {
    return '';
  }

  const normalizedText = normalizeText(conditionText);
  let bestMatch = '';
  let bestScore = 0;

  for (const option of CONDITION_OPTIONS) {
    let score = 0;

    // Check for exact synonym matches (highest priority)
    if (hasSynonyms(conditionText, option.synonyms)) {
      score = 1.0;
    }
    // Check for keyword matches
    else if (hasKeywords(conditionText, option.keywords)) {
      score = 0.8;
    }
    // Check for similarity with label
    else {
      const labelSimilarity = calculateSimilarity(
        normalizedText,
        normalizeText(option.label)
      );
      score = labelSimilarity;
    }

    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = option.value;
    }
  }

  return bestMatch;
}

/**
 * Get all condition options for dropdown
 */
export function getConditionOptions(): ConditionOption[] {
  return CONDITION_OPTIONS;
}

/**
 * Get condition option by value
 */
export function getConditionOptionByValue(
  value: string
): ConditionOption | undefined {
  return CONDITION_OPTIONS.find((option) => option.value === value);
}
