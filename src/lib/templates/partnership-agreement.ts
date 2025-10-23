'use client';

export const partnershipAgreementTemplate = {
  id: 'partnership-agreement',
  name: 'Partnership Agreement',
  description:
    'A comprehensive agreement for establishing a business partnership between two or more parties.',
  category: 'business',
  difficulty: 'intermediate',
  estimatedTime: '20-30 minutes',

  content: `
    <h1>PARTNERSHIP AGREEMENT</h1>

    <p>This Partnership Agreement ("Agreement") is entered into as of [Date], by and between:</p>

    <h2>RECITALS</h2>

    <p class="whereas-clause" data-type="whereas">
      <strong>WHEREAS,</strong> the parties wish to establish a partnership for the purpose of [describe the business purpose];
    </p>

    <p class="whereas-clause" data-type="whereas">
      <strong>WHEREAS,</strong> the parties desire to set forth the terms and conditions of their partnership and the rights and obligations of each partner;
    </p>

    <p class="whereas-clause" data-type="whereas">
      <strong>WHEREAS,</strong> the parties desire to enter into this Agreement to govern their partnership relations.
    </p>

    <h2>1. FORMATION OF PARTNERSHIP</h2>

    <div class="clause-block" data-type="clause">
      <h4>1.1 Partnership Name</h4>
      <p>The partnership shall be known as [Partnership Name] and shall be organized and existing under the laws of [State/Country].</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>1.2 Principal Place of Business</h4>
      <p>The principal place of business of the partnership shall be located at [Business Address], or at such other place as the partners may from time to time agree upon.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>1.3 Term of Partnership</h4>
      <p>The partnership shall commence on [Start Date] and shall continue until [End Date] or until terminated as provided in this Agreement.</p>
    </div>

    <h2>2. PARTNERS AND CONTRIBUTIONS</h2>

    <div class="party-block" data-type="party">
      <h3>Partner A Information</h3>
      <p><strong>Full Legal Name:</strong> [Enter name]</p>
      <p><strong>Address:</strong> [Enter address]</p>
      <p><strong>Email:</strong> [Enter email]</p>
      <p><strong>Initial Capital Contribution:</strong> $[Amount] or [Description of property/services]</p>
    </div>

    <div class="party-block" data-type="party">
      <h3>Partner B Information</h3>
      <p><strong>Full Legal Name:</strong> [Enter name]</p>
      <p><strong>Address:</strong> [Enter address]</p>
      <p><strong>Email:</strong> [Enter email]</p>
      <p><strong>Initial Capital Contribution:</strong> $[Amount] or [Description of property/services]</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>2.1 Capital Contributions</h4>
      <p>Each partner shall contribute capital as set forth above. All contributions shall be made by [Date]. The partnership shall not be obligated to return any capital contributions except as expressly provided herein.</p>
    </div>

    <h2>3. PROFIT AND LOSS DISTRIBUTION</h2>

    <div class="terms-block" data-type="terms">
      <h2>Profit Distribution</h2>
      <ol>
        <li><strong>Net Profits:</strong> Net profits of the partnership shall be distributed [equally/as follows: Partner A: [%], Partner B: [%]]</li>
        <li><strong>Net Losses:</strong> Net losses shall be borne by the partners in the same proportions as profits</li>
        <li><strong>Distributions:</strong> Distributions shall be made [quarterly/annually/as determined by the partners] on [Date]</li>
        <li><strong>Accrual:</strong> Profits and losses shall accrue from January 1 of each year</li>
      </ol>
    </div>

    <h2>4. MANAGEMENT AND OPERATIONS</h2>

    <div class="clause-block" data-type="clause">
      <h4>4.1 Management Authority</h4>
      <p>All partners shall have equal rights in the management and conduct of the partnership business, unless otherwise agreed in writing. No partner may take any action on behalf of the partnership without the prior written consent of the other partners, except for ordinary business matters.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>4.2 Duties and Responsibilities</h4>
      <p>Each partner agrees to devote [full-time/part-time] effort and attention to the partnership business and to use their best skill, knowledge, and ability in conducting the partnership affairs.</p>
    </div>

    <h2>5. PARTNER SALARIES AND DRAWS</h2>

    <div class="terms-block" data-type="terms">
      <h2>Compensation</h2>
      <ol>
        <li><strong>Partner A Salary:</strong> $[Amount] per [month/year]</li>
        <li><strong>Partner B Salary:</strong> $[Amount] per [month/year]</li>
        <li><strong>Partner Draws:</strong> Partners may draw funds on [frequency] subject to partnership liquidity</li>
        <li><strong>Modification:</strong> Salaries may only be modified by written agreement of all partners</li>
      </ol>
    </div>

    <h2>6. DECISION-MAKING AND VOTING</h2>

    <div class="clause-block" data-type="clause">
      <h4>6.1 Unanimous Consent Required</h4>
      <p>The following matters require the unanimous written consent of all partners:</p>
      <ul>
        <li>Admission of new partners</li>
        <li>Sale or disposal of partnership assets valued over $[Amount]</li>
        <li>Dissolution or merger of the partnership</li>
        <li>Changes to the partnership agreement</li>
        <li>Borrowing money on behalf of the partnership exceeding $[Amount]</li>
        <li>Engaging in business activities outside the defined scope</li>
      </ul>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>6.2 Majority Consent Required</h4>
      <p>The following matters require the written consent of partners holding a majority interest:</p>
      <ul>
        <li>Hiring or terminating key employees</li>
        <li>Contracts valued over $[Amount]</li>
        <li>Annual budget approval</li>
        <li>Capital expenditures over $[Amount]</li>
      </ul>
    </div>

    <h2>7. PARTNERSHIP RECORDS AND ACCOUNTS</h2>

    <div class="clause-block" data-type="clause">
      <h4>7.1 Books and Records</h4>
      <p>The partnership shall maintain complete and accurate books and records of all transactions. These records shall be kept at the principal place of business and shall be available for inspection by any partner during normal business hours.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>7.2 Fiscal Year</h4>
      <p>The partnership fiscal year shall end on [December 31/other date]. Annual financial statements shall be prepared and provided to each partner within [30/60] days of fiscal year-end.</p>
    </div>

    <h2>8. WITHDRAWAL, DISSOLUTION, AND TERMINATION</h2>

    <div class="clause-block" data-type="clause">
      <h4>8.1 Withdrawal of Partner</h4>
      <p>Any partner may withdraw from the partnership by providing [30/60/90] days written notice to the other partners. Upon withdrawal, the withdrawing partner shall receive payment for their partnership interest within [timeframe].</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>8.2 Dissolution</h4>
      <p>The partnership shall be dissolved upon: (a) written agreement of all partners; (b) the death of a partner (unless otherwise agreed); (c) the withdrawal of a partner; (d) breach of this Agreement that is not cured within [30] days of written notice.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>8.3 Wind-Up</h4>
      <p>Upon dissolution, the partnership assets shall be liquidated and the proceeds distributed in the following order: (1) partnership debts and liabilities; (2) return of capital contributions; (3) remaining assets distributed according to profit-sharing ratios.</p>
    </div>

    <h2>9. DISPUTE RESOLUTION</h2>

    <div class="clause-block" data-type="clause">
      <h4>9.1 Negotiation and Mediation</h4>
      <p>The partners agree that any disputes arising under this Agreement shall first be resolved through good-faith negotiation. If negotiation fails, the dispute shall be submitted to mediation before [City, State] before pursuing legal action.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>9.2 Governing Law</h4>
      <p>This Agreement shall be governed by and construed in accordance with the laws of [State/Country], without regard to conflicts of law principles.</p>
    </div>

    <h2>10. MISCELLANEOUS PROVISIONS</h2>

    <div class="clause-block" data-type="clause">
      <h4>10.1 Entire Agreement</h4>
      <p>This Agreement constitutes the entire agreement among the partners concerning the subject matter hereof and supersedes all prior negotiations, representations, and agreements.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>10.2 Amendments</h4>
      <p>This Agreement may be amended only by written instrument executed by all partners.</p>
    </div>

    <div class="clause-block" data-type="clause">
      <h4>10.3 Severability</h4>
      <p>If any provision of this Agreement is found to be invalid or unenforceable, such provision shall be severed and the remaining provisions shall remain in full force and effect.</p>
    </div>

    <h2>SIGNATURES</h2>

    <div class="signature-block" data-type="signature">
      <div class="signature-line"></div>
      <p><strong>Signature:</strong> _______________________</p>
      <p><strong>Print Name:</strong> _______________________</p>
      <p><strong>Date:</strong> _______________________</p>
      <p><strong>Partner A</strong></p>
    </div>

    <div class="signature-block" data-type="signature">
      <div class="signature-line"></div>
      <p><strong>Signature:</strong> _______________________</p>
      <p><strong>Print Name:</strong> _______________________</p>
      <p><strong>Date:</strong> _______________________</p>
      <p><strong>Partner B</strong></p>
    </div>
  `,

  ideaBlocks: [
    {
      id: 'partnership-recitals',
      title: '⚖️ Additional Whereas Clauses',
      content: 'Add more background/context to the preamble',
      template: 'whereas',
    },
    {
      id: 'partnership-special-clauses',
      title: '📋 Non-Compete Clause',
      content: 'Restrict partners from competing business activities',
      template: 'clause',
    },
    {
      id: 'partnership-insurance',
      title: '⚡ Insurance Provisions',
      content: 'Requirements for partnership insurance coverage',
      template: 'terms',
    },
    {
      id: 'partnership-buy-sell',
      title: '👥 Buy-Sell Agreement',
      content: 'What happens if a partner wants to sell their interest',
      template: 'clause',
    },
  ],
};
