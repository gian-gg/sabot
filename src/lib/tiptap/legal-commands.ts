'use client';

import type { Editor } from '@tiptap/react';
import {
  extractClausesFromHTML,
  generateClauseNumber,
  getLevelFromNumber,
} from './clause-numbering';

/**
 * Legal document block templates
 * These are simple HTML templates that get inserted into Tiptap editor
 * No complex node schemas - just formatted HTML with Tailwind styling
 */
export const legalBlockTemplates = {
  signature: `
    <div class="signature-block" data-type="signature" style="page-break-inside: avoid;">
      <div class="signature-line"></div>
      <p><strong>Signature:</strong> _______________________</p>
      <p><strong>Print Name:</strong> _______________________</p>
      <p><strong>Date:</strong> _______________________</p>
    </div>
  `,

  party: `
    <div class="party-block" data-type="party">
      <h3 style="font-weight: 600; font-size: 1.125rem; margin-bottom: 1rem;">Party Information</h3>
      <p style="margin-bottom: 0.75rem;"><strong>Full Legal Name:</strong></p>
      <p style="margin-left: 1rem; color: #999; margin-bottom: 1.5rem;">[Enter full legal name or entity name]</p>

      <p style="margin-bottom: 0.75rem;"><strong>Address:</strong></p>
      <p style="margin-left: 1rem; color: #999; margin-bottom: 1.5rem;">[Street address, City, State, Zip]</p>

      <p style="margin-bottom: 0.75rem;"><strong>Contact Information:</strong></p>
      <p style="margin-left: 1rem; color: #999; margin-bottom: 0.5rem;">Email: [email address]</p>
      <p style="margin-left: 1rem; color: #999;">[Phone number]</p>
    </div>
  `,

  clause: `
    <div class="clause-block" data-type="clause">
      <h4 style="font-weight: 600; font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.75rem;">1. [Clause Title]</h4>
      <p style="margin-left: 1.5rem; margin-bottom: 1.5rem;">[Insert clause content here. Explain the terms, conditions, or obligations related to this clause.]</p>
    </div>
  `,

  whereas: `
    <p class="whereas-clause" data-type="whereas" style="font-style: italic; margin: 1rem 0; padding-left: 2rem; color: #999;">
      <strong>WHEREAS,</strong> [state the relevant background fact, condition, or premise that provides context for the agreement];
    </p>
  `,

  terms: `
    <div class="terms-block" data-type="terms">
      <h2 style="font-weight: 700; font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem;">Terms and Conditions</h2>
      <ol style="margin-left: 1.5rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 1rem;">
          <strong>[Term 1]:</strong> [Description of the first term or condition]
        </li>
        <li style="margin-bottom: 1rem;">
          <strong>[Term 2]:</strong> [Description of the second term or condition]
        </li>
        <li style="margin-bottom: 1rem;">
          <strong>[Term 3]:</strong> [Description of the third term or condition]
        </li>
      </ol>
    </div>
  `,
};

/**
 * Insert signature block into editor
 */
export const insertSignatureBlock = (editor: Editor) => {
  editor.chain().focus().insertContent(legalBlockTemplates.signature).run();
};

/**
 * Insert party information block into editor
 */
export const insertPartyBlock = (editor: Editor) => {
  editor.chain().focus().insertContent(legalBlockTemplates.party).run();
};

/**
 * Insert numbered clause block into editor
 */
export const insertClauseBlock = (editor: Editor) => {
  editor.chain().focus().insertContent(legalBlockTemplates.clause).run();
};

/**
 * Insert WHEREAS preamble clause into editor
 */
export const insertWhereasClause = (editor: Editor) => {
  editor.chain().focus().insertContent(legalBlockTemplates.whereas).run();
};

/**
 * Insert terms and conditions section into editor
 */
export const insertTermsBlock = (editor: Editor) => {
  editor.chain().focus().insertContent(legalBlockTemplates.terms).run();
};

/**
 * Get the next clause number based on current document content
 * Parses existing clauses and returns appropriate next number
 */
export const getNextClauseNumber = (
  editor: Editor,
  level: number = 0
): string => {
  const html = editor.getHTML();
  const clauses = extractClausesFromHTML(html);

  // Filter clauses at the same level
  const clausesAtLevel = clauses.filter((c) => c.level === level);

  if (clausesAtLevel.length === 0) {
    return '1';
  }

  // Get the last clause at this level
  const lastClause = clausesAtLevel[clausesAtLevel.length - 1];
  const lastNumber = lastClause.number;
  const parts = lastNumber.split('.').map(Number);

  // Increment the last number at this level
  parts[level]++;

  // Reset deeper levels
  parts.splice(level + 1);

  return parts.join('.');
};

/**
 * Insert clause block with auto-numbering
 * Automatically determines the correct clause number based on document content
 */
export const insertClauseBlockAutoNumbered = (
  editor: Editor,
  level: number = 0
): void => {
  const nextNumber = getNextClauseNumber(editor, level);
  const indentStyle =
    level > 0 ? `style="margin-left: ${level * 1.5}rem;"` : '';

  const autoNumberedClause = `
    <div class="clause-block" data-type="clause" data-level="${level}" data-number="${nextNumber}">
      <h4 style="font-weight: 600; font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.75rem;" ${indentStyle}>${nextNumber}. [Clause Title]</h4>
      <p style="margin-left: 1.5rem; margin-bottom: 1.5rem;">[Insert clause content here. Explain the terms, conditions, or obligations related to this clause.]</p>
    </div>
  `;

  editor.chain().focus().insertContent(autoNumberedClause).run();
};

/**
 * Renumber all clauses in the document
 * Call this after deleting, moving, or reorganizing clauses
 */
export const renumberAllClauses = (editor: Editor): void => {
  const html = editor.getHTML();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const numberStack: number[] = [0];

  // Find all clause blocks
  const clauseElements = doc.querySelectorAll(
    '[data-type="clause"], .clause-block'
  );

  clauseElements.forEach((element) => {
    // Get level from data attribute or infer from indentation
    const level = parseInt(element.getAttribute('data-level') ?? '0');

    // Generate new number
    const newNumber = generateClauseNumber(level, [...numberStack]);

    // Update the clause number in the heading
    const heading = element.querySelector('h4');
    if (heading) {
      const text = heading.textContent || '';
      // Replace old number with new one
      const contentWithoutOldNumber = text.replace(/^\d+(?:\.\d+)*\.\s*/, '');
      heading.textContent = `${newNumber}. ${contentWithoutOldNumber || '[Clause Title]'}`;
    }

    // Update data attributes
    element.setAttribute('data-number', newNumber);
    element.setAttribute('data-level', level.toString());
  });

  // Update editor content with renumbered clauses
  const newHtml = doc.documentElement.innerHTML;
  editor.commands.setContent(newHtml);
};

/**
 * Create a numbered clause template with proper formatting
 * Used by legal-commands toolbar and template system
 */
export const createNumberedClauseTemplate = (
  number: string,
  title: string = '[Clause Title]',
  content: string = '[Insert clause content here...]'
): string => {
  const level = getLevelFromNumber(number);
  const indentStyle = level > 0 ? `margin-left: ${level * 1.5}rem;` : '';

  return `
    <div class="clause-block" data-type="clause" data-level="${level}" data-number="${number}">
      <h4 style="font-weight: 600; font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.75rem; ${indentStyle}">${number}. ${title}</h4>
      <p style="margin-left: 1.5rem; margin-bottom: 1.5rem;">${content}</p>
    </div>
  `;
};
