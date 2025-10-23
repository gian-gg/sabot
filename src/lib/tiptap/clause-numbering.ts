/**
 * Clause Numbering System
 * Provides utilities for extracting, numbering, and tracking clauses
 * Supports hierarchical numbering: 1, 1.1, 1.2, 2, 2.1, etc.
 */

export interface ClauseInfo {
  id: string;
  number: string;
  title: string;
  level: number;
  position: number; // Character position in HTML for jump-to functionality
  htmlElement?: HTMLElement;
}

export interface OutlineItem extends ClauseInfo {
  children: OutlineItem[];
}

/**
 * Parse HTML content and extract clauses with hierarchical numbering
 * Supports: h2, h3, h4 headings and .clause-block elements
 */
export function extractClausesFromHTML(htmlContent: string): ClauseInfo[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const clauses: ClauseInfo[] = [];
  let clauseIndex = 0;

  // Track numbering state
  const numberStack: number[] = [0];

  // Select all clause-related elements: headings and clause blocks
  const clauseElements = doc.querySelectorAll(
    'h2, h3, h4, [data-type="clause"], .clause-block'
  );

  clauseElements.forEach((element) => {
    let level = 0;
    let title = '';

    // Determine level based on element type
    if (element.tagName.match(/^H[234]$/)) {
      const headingNumber = parseInt(element.tagName[1]);
      level = headingNumber - 2; // h2=0, h3=1, h4=2
      title = element.textContent?.trim() || 'Untitled';
    } else if (
      element.getAttribute('data-type') === 'clause' ||
      element.classList.contains('clause-block')
    ) {
      // Extract title from clause block
      const titleElement = element.querySelector('h4, h3, h2');
      title = titleElement?.textContent?.trim() || 'Clause';
      level = 0; // Default to top-level clause
    }

    // Generate hierarchical number
    const clauseNumber = generateClauseNumber(level, numberStack);

    const clauseInfo: ClauseInfo = {
      id: `clause-${clauseIndex}`,
      number: clauseNumber,
      title: title,
      level: level,
      position: clauseIndex,
      htmlElement: element as HTMLElement,
    };

    clauses.push(clauseInfo);
    clauseIndex++;
  });

  return clauses;
}

/**
 * Generate hierarchical clause number (e.g., "1", "1.1", "1.2", "2")
 * Maintains stack of numbers for each level
 */
export function generateClauseNumber(
  level: number,
  numberStack: number[]
): string {
  // Adjust stack to match current level
  if (level >= numberStack.length) {
    // Going deeper - add new level
    while (numberStack.length <= level) {
      numberStack.push(0);
    }
  } else if (level < numberStack.length - 1) {
    // Going back up - trim stack and increment parent
    numberStack.splice(level + 1);
    numberStack[level]++;
  } else {
    // Same level - increment
    numberStack[level]++;
  }

  // Return number string (e.g., "1.1.2")
  return numberStack.slice(0, level + 1).join('.');
}

/**
 * Build outline structure with hierarchical children
 */
export function buildOutlineHierarchy(clauses: ClauseInfo[]): OutlineItem[] {
  const outline: OutlineItem[] = [];
  const stack: OutlineItem[] = [];

  clauses.forEach((clause) => {
    const outlineItem: OutlineItem = {
      ...clause,
      children: [],
    };

    // Pop from stack until we find the right parent
    while (stack.length > 0 && stack[stack.length - 1].level >= clause.level) {
      stack.pop();
    }

    // Add to parent or root
    if (stack.length === 0) {
      outline.push(outlineItem);
    } else {
      stack[stack.length - 1].children.push(outlineItem);
    }

    stack.push(outlineItem);
  });

  return outline;
}

/**
 * Renumber clauses after content changes
 * Call this when clauses are added, deleted, or moved
 */
export function renumberClauses(clauses: ClauseInfo[]): ClauseInfo[] {
  const numberStack: number[] = [0];

  return clauses.map((clause) => {
    const newNumber = generateClauseNumber(clause.level, numberStack);

    return {
      ...clause,
      number: newNumber,
    };
  });
}

/**
 * Extract clause number from text (e.g., "1.1" from "1.1 Partnership Formation")
 */
export function extractNumberFromText(text: string): string | null {
  const match = text.match(/^(\d+(?:\.\d+)*)\s*\.?\s+/);
  return match ? match[1] : null;
}

/**
 * Get clause nesting level based on number string
 * "1" = level 0, "1.1" = level 1, "1.1.1" = level 2
 */
export function getLevelFromNumber(numberString: string): number {
  return numberString.split('.').length - 1;
}

/**
 * Format clause number with proper spacing
 */
export function formatClauseNumber(number: string): string {
  return `${number}.`;
}

/**
 * Generate unique ID for clause
 */
export function generateClauseId(number: string): string {
  return `clause-${number.replace(/\./g, '-')}`;
}

/**
 * Get parent clause number (e.g., "1.2.3" → "1.2")
 */
export function getParentClauseNumber(numberString: string): string | null {
  const parts = numberString.split('.');
  if (parts.length === 1) return null;
  return parts.slice(0, -1).join('.');
}

/**
 * Compare clause numbers for sorting
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareClauseNumbers(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;

    if (aPart < bPart) return -1;
    if (aPart > bPart) return 1;
  }

  return 0;
}

/**
 * Validate clause number format
 */
export function isValidClauseNumber(numberString: string): boolean {
  return /^\d+(?:\.\d+)*$/.test(numberString);
}

/**
 * Get all clause numbers at a specific level
 */
export function getClausesAtLevel(
  clauses: ClauseInfo[],
  level: number
): ClauseInfo[] {
  return clauses.filter((clause) => clause.level === level);
}

/**
 * Get siblings of a clause (clauses with same level and parent)
 */
export function getSiblingClauses(
  clauses: ClauseInfo[],
  targetClause: ClauseInfo
): ClauseInfo[] {
  const parentNumber = getParentClauseNumber(targetClause.number);

  return clauses.filter((clause) => {
    if (clause.id === targetClause.id) return false;
    const clauseParent = getParentClauseNumber(clause.number);

    if (parentNumber === null && clauseParent === null) return true;
    return parentNumber === clauseParent;
  });
}

/**
 * Get children clauses (direct descendants)
 */
export function getChildrenClauses(
  clauses: ClauseInfo[],
  parentNumber: string
): ClauseInfo[] {
  const parentParts = parentNumber.split('.');

  return clauses.filter((clause) => {
    const clauseParts = clause.number.split('.');

    // Must be exactly one level deeper
    if (clauseParts.length !== parentParts.length + 1) return false;

    // All parent parts must match
    return clauseParts.slice(0, parentParts.length).join('.') === parentNumber;
  });
}

/**
 * Check if clause is within another (hierarchy)
 */
export function isClauseWithin(child: ClauseInfo, parent: ClauseInfo): boolean {
  const childParts = child.number.split('.').map(Number);
  const parentParts = parent.number.split('.').map(Number);

  if (childParts.length <= parentParts.length) return false;

  for (let i = 0; i < parentParts.length; i++) {
    if (childParts[i] !== parentParts[i]) return false;
  }

  return true;
}
