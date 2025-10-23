'use client';

import type { Editor } from '@tiptap/react';

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
