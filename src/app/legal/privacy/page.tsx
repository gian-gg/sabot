import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-background min-h-screen pt-18 pb-12">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 space-y-4">
          <Badge variant="outline" className="mb-4">
            Legal
          </Badge>
          <h1 className="text-foreground text-4xl leading-tight font-bold text-balance lg:text-5xl">
            Privacy Policy
          </h1>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
            <p>Effective Date: January 1, 2025</p>
            <span className="text-border">•</span>
            <p>Last Updated: January 1, 2025</p>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Sabot is committed to protecting your privacy and ensuring the
            security of your data. This Privacy Policy explains how we collect,
            use, share, and protect your information when you use our trust &
            safety platform, AI-powered agreement tools, and transaction
            services.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  1. Information We Collect
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We collect various types of information to provide and improve
                  our services, ensure platform security, and deliver AI-powered
                  features.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    1.1. User-Provided Information
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Account details (email address, password)</li>
                    <li>
                      Identity verification data (ID image, facial recognition
                      data)
                    </li>
                    <li>
                      Uploaded screenshots or files for transaction or agreement
                      validation
                    </li>
                    <li>Profile information (optional display name, avatar)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    1.2. Automatically Collected Information
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Device details, browser type, and IP address</li>
                    <li>Usage logs and timestamps</li>
                    <li>Interaction data with AI or agreement blocks</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    1.3. AI-Generated & Processed Data
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>
                      AI summaries and insights based on uploaded screenshots
                    </li>
                    <li>Clause suggestions and risk analysis in agreements</li>
                    <li>Safety or fraud detection models analyzing content</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    1.4. Transaction Data
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Transaction summaries, timestamps, and trust scores</li>
                    <li>
                      Counterparty metadata (blurred or anonymized on public
                      views)
                    </li>
                    <li>Location data (if meetup-based transaction)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  2. How We Use Your Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    2.1. Core Platform Operations
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>User verification and authentication</li>
                    <li>
                      Enabling secure transactions and agreement collaboration
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    2.2. AI-Powered Features
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Fraud detection and market comparisons</li>
                    <li>Agreement risk analysis and drafting assistance</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    2.3. Trust & Safety
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Monitoring transaction integrity</li>
                    <li>Supporting reports, disputes, and investigations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    2.4. Platform Improvement
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Enhancing AI accuracy</li>
                    <li>Improving user experience and UI design</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    2.5. Legal Compliance
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Complying with cybercrime and anti-fraud laws</li>
                    <li>Fulfilling lawful requests from authorities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card>
            <CardContent className="space-y-6 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  3. Data Sharing and Disclosure
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    3.1. With Counterparties
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>
                      Limited visibility (only during verified transactions or
                      agreements)
                    </li>
                    <li>
                      Names, emails, and verification badges visible to involved
                      parties only
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    3.2. With Service Providers
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Cloud hosting (e.g., Supabase / AWS / Vercel)</li>
                    <li>AI model processing (e.g., OpenAI / Anthropic)</li>
                    <li>
                      Identity verification (OCR & facial recognition APIs)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    3.3. With Law Enforcement or Regulators
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Only in cases of legal obligation or active investigation
                  </p>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    3.4. Public Visibility
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Only anonymized transaction records (blurred names,
                    non-identifiable metadata) may appear in the public ledger
                    feed
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
                  4. Data Retention and Deletion
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    4.1. Retention Policy
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Account data retained until account deletion</li>
                    <li>
                      Transaction and agreement records retained for audit and
                      dispute resolution
                    </li>
                    <li>Temporary uploads deleted after AI processing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    4.2. User-Controlled Deletion
                  </h3>
                  <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                    <li>Users may delete accounts anytime</li>
                    <li>
                      Option to request data erasure in compliance with
                      applicable law (e.g., GDPR, PDPA)
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  5. Your Rights and Choices
                </h2>
              </div>

              <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                <li>Right to access, correct, or delete personal data</li>
                <li>Right to withdraw consent for data processing</li>
                <li>Right to data portability</li>
                <li>
                  Right to restrict or object to certain AI-based decisions
                </li>
              </ul>

              <p className="text-muted-foreground leading-relaxed">
                To exercise these rights, please contact us at{' '}
                <a
                  href="mailto:support@sabot.ai"
                  className="text-primary hover:underline"
                >
                  support@sabot.ai
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  6. Security Measures
                </h2>
              </div>

              <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                <li>End-to-end encryption of sensitive data</li>
                <li>Two-factor or verified login process</li>
                <li>
                  Secure AI pipelines (no human review of private uploads)
                </li>
                <li>Regular audits and anomaly detection</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  7. Cookies and Tracking Technologies
                </h2>
              </div>

              <ul className="text-muted-foreground ml-6 list-disc space-y-2 leading-relaxed">
                <li>Use of cookies for session management and analytics</li>
                <li>No third-party advertising cookies</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed">
                You can manage your cookie preferences through your browser
                settings.
              </p>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  8. AI Transparency and Responsibility
                </h2>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Sabot uses AI to assist with fraud detection, safety insights,
                and agreement creation. However, AI does not make final legal or
                transactional decisions. We disclaim liability for errors in AI
                suggestions—user review is required before confirming any
                AI-generated content.
              </p>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  9. Data Transfers
                </h2>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Your data may be processed in various locations including Japan,
                Philippines, Singapore, or the United States. We comply with
                regional data protection laws including GDPR and PDPA to ensure
                your data is protected regardless of where it is processed.
              </p>
            </CardContent>
          </Card>

          {/* Section 10 */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  10. Children&apos;s Privacy
                </h2>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Sabot is not intended for minors under 18 years of age. Our
                verification process ensures that only adults can access full
                platform features.
              </p>
            </CardContent>
          </Card>

          {/* Section 11 */}
          <Card>
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  11. Updates to This Policy
                </h2>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. When we
                make changes, we will notify you via email or through an in-app
                banner. We encourage you to review this policy periodically to
                stay informed about how we protect your information.
              </p>
            </CardContent>
          </Card>

          {/* Section 12 - Contact */}
          <Card className="border-primary/20">
            <CardContent className="space-y-4 py-6">
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  12. Contact Us
                </h2>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy or how we
                  handle your data, please don&apos;t hesitate to reach out:
                </p>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="text-foreground text-sm font-medium">
                      Email:
                    </span>
                    <a
                      href="mailto:support@sabot.ai"
                      className="text-primary hover:text-primary/80 text-sm transition-colors"
                    >
                      support@sabot.ai
                    </a>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-foreground text-sm font-medium">
                      Privacy Officer:
                    </span>
                    <a
                      href="mailto:privacy@sabot.ai"
                      className="text-primary hover:text-primary/80 text-sm transition-colors"
                    >
                      privacy@sabot.ai
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
