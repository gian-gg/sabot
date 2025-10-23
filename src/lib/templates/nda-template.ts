'use client';

export const ndaTemplate = {
  id: 'nda-agreement',
  name: 'Non-Disclosure Agreement (NDA)',
  description:
    'A legal agreement that protects confidential information shared between parties. Also called a Confidentiality Agreement.',
  category: 'confidentiality',
  difficulty: 'beginner',
  estimatedTime: '15-20 minutes',

  content: `
    <h1>NON-DISCLOSURE AGREEMENT</h1>

    <p>This Non-Disclosure Agreement ("Agreement") is entered into as of [Date], by and between:</p>

    <h2>RECITALS</h2>

    <p class="whereas-clause" data-type="whereas">
      <strong>WHEREAS,</strong> one party (the "Disclosing Party") possesses certain confidential and proprietary information;
    </p>

    <p class="whereas-clause" data-type="whereas">
      <strong>WHEREAS,</strong> the other party (the "Receiving Party") wishes to receive this confidential information for the purpose of [business purpose/evaluation/partnership];
    </p>

    <p class="whereas-clause" data-type="whereas">
      <strong>WHEREAS,</strong> the parties wish to protect the confidentiality of such information and set forth the terms governing its use and disclosure.
    </p>

    <h2>1. PARTIES</h2>

    <div class="party-block" data-type="party">
      <h3>Disclosing Party (Owner of Confidential Information)</h3>
      <p><strong>Full Legal Name:</strong> [Enter name]</p>
      <p><strong>Address:</strong> [Enter address]</p>
      <p><strong>Contact Person:</strong> [Name and email]</p>
      <p><strong>Type of Organization:</strong> [Individual/Company/Other]</p>
    </div>

    <div class="party-block" data-type="party">
      <h3>Receiving Party (Recipient of Confidential Information)</h3>
      <p><strong>Full Legal Name:</strong> [Enter name]</p>
      <p><strong>Address:</strong> [Enter address]</p>
      <p><strong>Contact Person:</strong> [Name and email]</p>
      <p><strong>Type of Organization:</strong> [Individual/Company/Other]</p>
    </div>

    <h2>2. CONFIDENTIAL INFORMATION DEFINED</h2>

    <div class="clause-block" data-type="clause">
      <h4>2.1 Definition</h4>
      <p>"Confidential Information" means all non-public information disclosed by the Disclosing Party to the Receiving Party, whether in written, oral, electronic, or visual form, including but not limited to:</p>
      <ul>
        <li>Business plans, strategies, and financial information</li>
        <li>Technical data, trade secrets, and know-how</li>
        <li>Software, source code, and algorithms</li>
        <li>Customer lists, pricing information, and business methods</li>
        <li>Intellectual property and proprietary research</li>
        <li>Any other information marked as "Confidential" or that reasonably should be understood as confidential</li>
      </ul>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>2.2 Exclusions from Confidential Information</h4>
      <p>Confidential Information does not include information that:</p>
      <ul>
        <li>Is or becomes publicly available through no breach of this Agreement</li>
        <li>Is rightfully received by the Receiving Party from a third party without confidentiality obligations</li>
        <li>Was known by the Receiving Party prior to disclosure (as evidenced by written records)</li>
        <li>Is independently developed without use of or reference to the Confidential Information</li>
        <li>Is required to be disclosed by law or court order (with notice to the Disclosing Party)</li>
      </ul>
    </div>

    <h2>3. PERMITTED USE OF CONFIDENTIAL INFORMATION</h2>

    <div class="clause-block" data-type="clause">
      <h4>3.1 Limited Use</h4>
      <p>The Receiving Party may use the Confidential Information solely for the purpose of [evaluate a potential partnership/assess business opportunity/other specified purpose] ("Permitted Purpose"). Any other use is prohibited without prior written consent.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>3.2 Restrictions on Disclosure</h4>
      <p>The Receiving Party shall not disclose the Confidential Information to any third party without the prior written consent of the Disclosing Party, except to its employees, consultants, and advisors who have a legitimate need to know and who are bound by written confidentiality obligations.</p>
    </div>

    <h2>4. OBLIGATIONS OF THE RECEIVING PARTY</h2>

    <div class="terms-block" data-type="terms">
      <h2>Receiving Party Responsibilities</h2>
      <ol>
        <li><strong>Protection:</strong> The Receiving Party shall protect the Confidential Information using the same degree of care it uses for its own confidential information, but no less than reasonable care</li>
        <li><strong>Limited Access:</strong> Access to Confidential Information shall be limited to authorized personnel with a need to know</li>
        <li><strong>Documentation:</strong> The Receiving Party shall maintain a record of individuals who have access to the Confidential Information</li>
        <li><strong>Return or Destruction:</strong> Upon termination of this Agreement or upon request, the Receiving Party shall return or destroy all Confidential Information and certify such destruction in writing</li>
      </ol>
    </div>

    <h2>5. PERMITTED DISCLOSURES</h2>

    <div class="clause-block" data-type="clause">
      <h4>5.1 Disclosure by Law</h4>
      <p>If the Receiving Party is required by law, court order, or regulatory authority to disclose any Confidential Information, the Receiving Party shall:</p>
      <ul>
        <li>Promptly notify the Disclosing Party in writing</li>
        <li>Cooperate with the Disclosing Party in seeking protective measures</li>
        <li>Disclose only the minimum information required by law</li>
        <li>Request confidential treatment of the disclosed information</li>
      </ul>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>5.2 Consultation with Advisors</h4>
      <p>The Receiving Party may disclose Confidential Information to its employees, consultants, attorneys, and financial advisors on a need-to-know basis, provided they are bound by written confidentiality obligations at least as protective as those contained herein.</p>
    </div>

    <h2>6. NO OBLIGATION TO DISCLOSE</h2>

    <div class="clause-block" data-type="clause">
      <h4>6.1 Voluntary Disclosure</h4>
      <p>The Disclosing Party is under no obligation to disclose any Confidential Information. All disclosures are made at the Disclosing Party's sole discretion.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>6.2 No License or Agreement</h4>
      <p>Disclosure of Confidential Information does not create any license, option, or agreement to enter into a business relationship. The Receiving Party shall not assume any obligation to purchase, license, or use the Confidential Information or related products or services.</p>
    </div>

    <h2>7. INTELLECTUAL PROPERTY</h2>

    <div class="clause-block" data-type="clause">
      <h4>7.1 Ownership</h4>
      <p>All Confidential Information and any intellectual property rights therein shall remain the exclusive property of the Disclosing Party. No license or ownership rights are granted to the Receiving Party.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>7.2 Improvements</h4>
      <p>Any improvements, modifications, or derivative works developed by the Receiving Party shall be the property of the Disclosing Party.</p>
    </div>

    <h2>8. TERM AND TERMINATION</h2>

    <div class="terms-block" data-type="terms">
      <h2>Duration of Confidentiality</h2>
      <ol>
        <li><strong>Term:</strong> This Agreement shall commence on the date first written above and continue for [1/2/3/5] years, unless terminated earlier by written notice</li>
        <li><strong>Perpetual Obligations:</strong> Obligations regarding trade secrets shall continue indefinitely</li>
        <li><strong>Survival:</strong> Confidentiality obligations shall survive termination of this Agreement</li>
        <li><strong>Termination Notice:</strong> Either party may terminate this Agreement with [30/60/90] days written notice</li>
      </ol>
    </div>

    <h2>9. NO WARRANTY</h2>

    <div class="clause-block" data-type="clause">
      <h4>9.1 Disclaimer</h4>
      <p>The Confidential Information is provided "AS IS" without warranty of any kind, express or implied. The Disclosing Party makes no representations regarding accuracy, completeness, or fitness for any particular purpose.</p>
    </div>

    <h2>10. REMEDIES</h2>

    <div class="clause-block" data-type="clause">
      <h4>10.1 Injunctive Relief</h4>
      <p>The Receiving Party acknowledges that breach of this Agreement may cause irreparable harm for which monetary damages are an insufficient remedy. The Disclosing Party shall be entitled to seek injunctive relief and specific performance without posting bond.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>10.2 Other Remedies</h4>
      <p>The availability of injunctive relief does not preclude the Disclosing Party from pursuing other legal remedies, including but not limited to damages.</p>
    </div>

    <h2>11. GOVERNING LAW AND DISPUTE RESOLUTION</h2>

    <div class="clause-block" data-type="clause">
      <h4>11.1 Governing Law</h4>
      <p>This Agreement shall be governed by and construed in accordance with the laws of [State/Country], without regard to conflicts of law principles.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>11.2 Jurisdiction</h4>
      <p>The parties agree to the exclusive jurisdiction of the courts located in [City, State/Country] for any disputes arising under this Agreement.</p>
    </div>

    <h2>12. MISCELLANEOUS PROVISIONS</h2>

    <div class="clause-block" data-type="clause">
      <h4>12.1 Entire Agreement</h4>
      <p>This Agreement constitutes the entire agreement between the parties concerning the subject matter and supersedes all prior discussions and agreements.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>12.2 Amendments</h4>
      <p>This Agreement may be amended only by written instrument executed by both parties.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>12.3 Severability</h4>
      <p>If any provision is found to be invalid, such provision shall be severed and the remaining provisions shall remain in full force.</p>
    </div>

    <h2>SIGNATURES</h2>

    <div class="signature-block" data-type="signature">
      <div class="signature-line"></div>
      <p><strong>Signature:</strong> _______________________</p>
      <p><strong>Print Name:</strong> _______________________</p>
      <p><strong>Date:</strong> _______________________</p>
      <p><strong>Disclosing Party</strong></p>
    </div>

    <div class="signature-block" data-type="signature">
      <div class="signature-line"></div>
      <p><strong>Signature:</strong> _______________________</p>
      <p><strong>Print Name:</strong> _______________________</p>
      <p><strong>Date:</strong> _______________________</p>
      <p><strong>Receiving Party</strong></p>
    </div>
  `,

  ideaBlocks: [
    {
      id: 'nda-mutual',
      title: '👥 Mutual Confidentiality',
      content:
        "Make this a mutual NDA where both parties protect each other's information",
      template: 'clause',
    },
    {
      id: 'nda-duration',
      title: '⏱️ Extended Duration Clause',
      content:
        'Specify longer confidentiality periods for sensitive information',
      template: 'terms',
    },
    {
      id: 'nda-notices',
      title: '📧 Notice Procedures',
      content:
        'Details on how to notify parties of breaches or required disclosures',
      template: 'clause',
    },
  ],
};
