import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TermsOfServicePage() {
  return (
    <main className="bg-background min-h-screen pt-18 pb-12">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 space-y-4">
          <Badge variant="outline" className="mb-4">
            Legal
          </Badge>
          <h1 className="text-foreground text-4xl leading-tight font-bold text-balance lg:text-5xl">
            Terms of Service
          </h1>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
            <p>Effective Date: [Insert Date]</p>
            <span className="text-border">•</span>
            <p>Last Updated: [Insert Date]</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  1. Introduction
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    Purpose of this Document
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to Sabot (&quot;we,&quot; &quot;our,&quot;
                    &quot;us&quot;). These Terms of Service (&quot;Terms&quot;)
                    govern your access to and use of the Sabot Platform,
                    including all related products, services, and features such
                    as:
                  </p>
                  <ul className="text-muted-foreground mt-3 ml-6 list-disc space-y-2 leading-relaxed">
                    <li>
                      Transaction Safety System – tools for safe and verified
                      peer-to-peer transactions
                    </li>
                    <li>
                      Collaborative Agreement Platform – AI-assisted contract
                      drafting and finalization
                    </li>
                  </ul>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    By using Sabot, you agree to comply with these Terms. If you
                    do not agree, you must stop using the platform immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  2. Definitions
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="text-foreground pr-6 pb-3 text-left text-sm font-semibold">
                        Term
                      </th>
                      <th className="text-foreground pb-3 text-left text-sm font-semibold">
                        Meaning
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    <tr>
                      <td className="text-foreground py-3 pr-6 text-sm font-medium">
                        User
                      </td>
                      <td className="text-muted-foreground py-3 text-sm">
                        Any person with a Sabot account (verified or
                        unverified).
                      </td>
                    </tr>
                    <tr>
                      <td className="text-foreground py-3 pr-6 text-sm font-medium">
                        Verified User
                      </td>
                      <td className="text-muted-foreground py-3 text-sm">
                        A user who has completed ID and face verification.
                      </td>
                    </tr>
                    <tr>
                      <td className="text-foreground py-3 pr-6 text-sm font-medium">
                        Transaction
                      </td>
                      <td className="text-muted-foreground py-3 text-sm">
                        A peer-to-peer exchange initiated via Sabot&apos;s
                        transaction link.
                      </td>
                    </tr>
                    <tr>
                      <td className="text-foreground py-3 pr-6 text-sm font-medium">
                        Agreement
                      </td>
                      <td className="text-muted-foreground py-3 text-sm">
                        A digital document collaboratively created using
                        Sabot&apos;s editor.
                      </td>
                    </tr>
                    <tr>
                      <td className="text-foreground py-3 pr-6 text-sm font-medium">
                        AI Features
                      </td>
                      <td className="text-muted-foreground py-3 text-sm">
                        Automated tools that provide summaries, suggestions, or
                        insights.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  3. Eligibility and Account Requirements
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    3.1. Age Requirement
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You must be at least 18 years old to use Sabot.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    3.2. Account Creation
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>
                      All users must create an account using a valid email
                      address.
                    </li>
                    <li>
                      Multiple accounts by the same person are prohibited.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    3.3. Identity Verification
                  </h3>
                  <p className="text-muted-foreground mb-2 leading-relaxed">
                    Certain features (e.g., transactions, agreements) require:
                  </p>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Government-issued ID upload</li>
                    <li>Face recognition check</li>
                    <li>Ongoing verification status maintenance</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    3.4. Responsibility for Account Activity
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You are responsible for maintaining the confidentiality of
                    your account credentials and all activities occurring under
                    your account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  4. Use of the Platform
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    4.1. Permitted Uses
                  </h3>
                  <p className="text-muted-foreground mb-2 leading-relaxed">
                    You may use Sabot to:
                  </p>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Create, preview, and finalize digital agreements</li>
                    <li>
                      Initiate or participate in verified P2P transactions
                    </li>
                    <li>Access AI-generated insights and safety suggestions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    4.2. Prohibited Uses
                  </h3>
                  <p className="text-muted-foreground mb-2 leading-relaxed">
                    You agree not to:
                  </p>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>
                      Use the platform for illegal, deceptive, or fraudulent
                      activities
                    </li>
                    <li>
                      Upload false or misleading information or documentation
                    </li>
                    <li>
                      Attempt to interfere with Sabot&apos;s systems or
                      reverse-engineer features
                    </li>
                    <li>Circumvent verification or safety mechanisms</li>
                  </ul>
                  <div className="border-destructive/20 bg-destructive/5 mt-3 rounded-lg border p-4">
                    <p className="text-destructive text-sm leading-relaxed">
                      ⚠️ Note: Violations may result in account suspension, data
                      removal, or legal action.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  5. Transaction Safety Features
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    5.1. Verification Requirement
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Both parties must be verified before any transaction can
                    proceed.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    5.2. AI-Powered Review
                  </h3>
                  <p className="text-muted-foreground mb-2 leading-relaxed">
                    Our system may analyze conversation screenshots to:
                  </p>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Detect message inconsistencies</li>
                    <li>Flag suspicious behavior</li>
                    <li>
                      Generate transaction summaries and advisory insights
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    5.3. Transparency & Privacy Balance
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    While Sabot uses a public transaction ledger for
                    transparency, personally identifiable data (e.g., names,
                    emails) remain blurred or anonymized.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    5.4. Trust Score System
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Trust Scores reflect transaction reliability, viewable only
                    to buyers. Sabot reserves the right to adjust scoring logic
                    for fairness and fraud prevention.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  6. Collaborative Agreement Platform
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    6.1. Shared Access
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Agreements are accessible only to invited participants. Each
                    participant&apos;s edits and confirmations are logged.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    6.2. AI Assistance
                  </h3>
                  <p className="text-muted-foreground mb-2 leading-relaxed">
                    AI may:
                  </p>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Suggest clauses or detect risks</li>
                    <li>Provide grammar and style corrections</li>
                    <li>Generate summaries or risk reports</li>
                  </ul>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    These outputs are advisory only and not a substitute for
                    legal advice.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    6.3. Agreement Finalization
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Once both parties confirm, the document is locked and
                    archived. Future edits require creating a new version.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  7. AI and Automation Disclaimer
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    7.1. No Legal Representation
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    AI-generated content, including summaries or contract
                    clauses, does not constitute legal advice.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    7.2. Accuracy Limitations
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    While Sabot strives for high accuracy, AI insights may not
                    always reflect the full context of your conversation or
                    jurisdiction.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    7.3. User Responsibility
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You remain solely responsible for verifying the accuracy and
                    legality of any AI-assisted content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  8. Data Privacy & Security
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  (Reference to full{' '}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  )
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    8.1. Data Collected
                  </h3>
                  <p className="text-muted-foreground mb-2 leading-relaxed">
                    We may collect:
                  </p>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Identification data (ID scans, selfies)</li>
                    <li>Transaction data (summaries, timestamps)</li>
                    <li>Agreement content and revisions</li>
                    <li>Device and usage logs</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    8.2. Data Usage
                  </h3>
                  <p className="text-muted-foreground mb-2 leading-relaxed">
                    Used for:
                  </p>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Verification and fraud detection</li>
                    <li>Product improvement</li>
                    <li>Compliance with law enforcement (if required)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    8.3. Security Practices
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We use encryption, access control, and anomaly detection to
                    protect your information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  9. Intellectual Property
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    9.1. Ownership
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>
                      Sabot retains ownership of the platform, branding, and AI
                      systems.
                    </li>
                    <li>
                      Users retain ownership of content they create or upload
                      (e.g., agreement text, messages).
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    9.2. Limited License
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You are granted a non-exclusive, revocable license to use
                    Sabot&apos;s services as intended.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    9.3. Feedback
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    By submitting feedback, you grant Sabot a royalty-free
                    license to use it for improvement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 10 */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  10. Payments & Fees (Future)
                </h2>
              </div>

              <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                <li>
                  Certain advanced features may require subscription or service
                  fees.
                </li>
                <li>
                  All fees will be displayed transparently before payment.
                </li>
                <li>
                  Refund policies (if applicable) will be clearly defined.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 11 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  11. Dispute Resolution
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    11.1. User Disputes
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Users are encouraged to use Sabot&apos;s dispute reporting
                    tools before external escalation.
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    11.2. Escalation Path
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>In-platform dispute ticket</li>
                    <li>AI-generated incident summary</li>
                    <li>Mediation or law enforcement referral</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    11.3. Governing Law
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms are governed by the laws of [Insert
                    Jurisdiction].
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 12 */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  12. Termination
                </h2>
              </div>

              <p className="text-muted-foreground mb-3 leading-relaxed">
                We may suspend or terminate your account if:
              </p>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                <li>You violate these Terms</li>
                <li>We detect fraudulent or harmful behavior</li>
                <li>Required by legal authority</li>
              </ul>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Upon termination, you lose access to active transactions and
                agreements.
              </p>
            </CardContent>
          </Card>

          {/* Section 13 */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  13. Limitation of Liability
                </h2>
              </div>

              <p className="text-muted-foreground mb-3 leading-relaxed">
                Sabot is provided &quot;as is.&quot; To the fullest extent
                permitted by law:
              </p>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                <li>
                  Sabot is not liable for indirect or consequential damages
                </li>
                <li>
                  Users bear responsibility for actions taken using the platform
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 14 */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  14. Changes to These Terms
                </h2>
              </div>

              <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                <li>We may update these Terms periodically.</li>
                <li>Notice will be provided via email or in-app alert.</li>
                <li>
                  Continued use after updates implies acceptance of the new
                  Terms.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 15 - Contact */}
          <Card className="border-primary/20">
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  15. Contact Us
                </h2>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  For questions, concerns, or disputes, contact:
                </p>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="text-foreground text-sm font-medium">
                      Email:
                    </span>
                    <a
                      href="mailto:support@sabot.app"
                      className="text-primary hover:text-primary/80 text-sm transition-colors"
                    >
                      support@sabot.app
                    </a>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-foreground text-sm font-medium">
                      Website:
                    </span>
                    <a
                      href="https://sabot.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 text-sm transition-colors"
                    >
                      https://sabot.app
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
