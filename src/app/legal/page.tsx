import React from 'react';
import Link from 'next/link';
import {
  Shield,
  FileText,
  Lock,
  Scale,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-neutral-950">
      {/* Hero Section */}
      <section className="border-b border-neutral-800/50 px-6 pt-32 pb-16">
        <div className="mx-auto max-w-6xl text-center">
          <Badge className="border-primary/50 bg-primary/20 text-primary mb-4">
            Legal Information
          </Badge>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white">
            Trust, transparency, and{' '}
            <span className="text-primary">your rights</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-neutral-400">
            Our commitment to protecting your data, ensuring platform security,
            and maintaining transparent practices.
          </p>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section id="privacy" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Shield className="text-primary mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-4 text-3xl font-bold text-white">
              Privacy Policy
            </h2>
            <p className="text-neutral-400">
              How we collect, use, and protect your information
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Eye className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• Account details and authentication</p>
                <p>• Identity verification data (ID, facial recognition)</p>
                <p>• Transaction and agreement content</p>
                <p>• Device and usage information</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Lock className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">How We Use Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• User verification and authentication</p>
                <p>• AI-powered fraud detection</p>
                <p>• Transaction safety monitoring</p>
                <p>• Platform improvement and analytics</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <UserCheck className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• Access and correct your data</p>
                <p>• Delete your account anytime</p>
                <p>• Data portability</p>
                <p>• Opt-out of certain processing</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Shield className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• End-to-end encryption</p>
                <p>• Two-factor authentication</p>
                <p>• Regular security audits</p>
                <p>• Secure AI processing pipelines</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Scale className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Data Sharing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• Limited visibility to counterparties</p>
                <p>• Service providers (cloud, AI)</p>
                <p>• Law enforcement (when required)</p>
                <p>• Anonymized public ledger data</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <FileText className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">AI Transparency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• AI-generated insights are advisory</p>
                <p>• No human review of private uploads</p>
                <p>• Temporary data processing</p>
                <p>• Clear AI limitations disclosed</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="mb-4 flex items-start gap-3">
              <CheckCircle className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="mb-2 font-semibold text-white">
                  GDPR & PDPA Compliant
                </h3>
                <p className="text-sm text-neutral-400">
                  We comply with international data protection regulations
                  including GDPR (Europe) and PDPA (Philippines, Singapore).
                  Your data is protected regardless of where it&apos;s
                  processed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="mb-2 font-semibold text-white">
                  Data Retention
                </h3>
                <p className="text-sm text-neutral-400">
                  Account data retained until deletion. Transaction records kept
                  for audit and dispute resolution. Temporary uploads deleted
                  after AI processing.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4 text-sm text-neutral-400">
              Last Updated: January 1, 2025 • Effective Date: January 1, 2025
            </p>
            <p className="text-sm text-neutral-400">
              Questions? Contact{' '}
              <a
                href="mailto:privacy@sabot.com"
                className="text-primary hover:underline"
              >
                privacy@sabot.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Terms of Service Section */}
      <section
        id="terms"
        className="border-t border-neutral-800/50 bg-neutral-900/20 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <FileText className="text-primary mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-4 text-3xl font-bold text-white">
              Terms of Service
            </h2>
            <p className="text-neutral-400">
              Your agreement with Sabot when using our platform
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">Eligibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-400">
                <div>
                  <h4 className="mb-1 font-semibold text-white">
                    Age Requirement
                  </h4>
                  <p>Must be 18+ years old to use Sabot</p>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-white">
                    Account Creation
                  </h4>
                  <p>Valid email required. Multiple accounts prohibited.</p>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-white">
                    Verification
                  </h4>
                  <p>
                    Government ID and face recognition required for full
                    features
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">Permitted Uses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• Create and finalize digital agreements</p>
                <p>• Initiate verified P2P transactions</p>
                <p>• Access AI-powered safety insights</p>
                <p>• Use trust score and verification features</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">Prohibited Uses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• Illegal or fraudulent activities</p>
                <p>• False information or documentation</p>
                <p>• System interference or reverse engineering</p>
                <p>• Circumventing verification mechanisms</p>
                <div className="mt-3 rounded border border-red-500/20 bg-red-950/20 p-3">
                  <p className="text-xs text-red-400">
                    ⚠️ Violations may result in account suspension or legal
                    action
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  AI & Automation Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-400">
                <div>
                  <h4 className="mb-1 font-semibold text-white">
                    No Legal Advice
                  </h4>
                  <p>AI-generated content is advisory only, not legal advice</p>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-white">
                    User Responsibility
                  </h4>
                  <p>You must verify accuracy and legality of AI suggestions</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 space-y-6">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  Transaction Safety Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-neutral-400">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold text-white">
                      Verification Required
                    </h4>
                    <p>Both parties must be verified before transactions</p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-white">
                      AI-Powered Review
                    </h4>
                    <p>
                      Analyzes conversations for inconsistencies and fraud
                      indicators
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-white">
                      Trust Score System
                    </h4>
                    <p>
                      Reflects transaction reliability, visible only to buyers
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-white">
                      Public Transparency
                    </h4>
                    <p>
                      Anonymized records appear on public ledger for
                      accountability
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">Agreement Platform</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-neutral-400">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold text-white">
                      Shared Access
                    </h4>
                    <p>Only invited participants can view agreements</p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-white">
                      AI Assistance
                    </h4>
                    <p>
                      Clause suggestions, grammar checks, and risk detection
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-white">
                      Finalization
                    </h4>
                    <p>Both parties must confirm to lock the document</p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-white">
                      Version Control
                    </h4>
                    <p>Edit history logged, new versions for changes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4 text-sm text-neutral-400">
              Effective Date: January 1, 2025 • Last Updated: January 1, 2025
            </p>
            <p className="text-sm text-neutral-400">
              Questions? Contact{' '}
              <a
                href="mailto:legal@sabot.com"
                className="text-primary hover:underline"
              >
                legal@sabot.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section
        id="security"
        className="border-t border-neutral-800/50 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Lock className="text-primary mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-4 text-3xl font-bold text-white">
              Security & Compliance
            </h2>
            <p className="text-neutral-400">
              How we protect your data and maintain platform security
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Lock className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">
                  Encryption Standards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• TLS 1.3 for data in transit</p>
                <p>• AES-256 encryption at rest</p>
                <p>• End-to-end encrypted messaging</p>
                <p>• Secure key management</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <UserCheck className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• Email-based verification</p>
                <p>• Secure session management</p>
                <p>• Government ID validation</p>
                <p>• Facial recognition matching</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Shield className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• Cloud-hosted on secure platforms</p>
                <p>• Regular security audits</p>
                <p>• DDoS protection</p>
                <p>• 99.9% uptime SLA</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <AlertTriangle className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Threat Detection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• Anomaly detection systems</p>
                <p>• Real-time fraud monitoring</p>
                <p>• Automated threat response</p>
                <p>• 24/7 security monitoring</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Scale className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• GDPR compliant (Europe)</p>
                <p>• PDPA compliant (APAC)</p>
                <p>• SOC 2 Type II (in progress)</p>
                <p>• ISO 27001 standards</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <FileText className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-400">
                <p>• Privacy by design</p>
                <p>• Minimal data collection</p>
                <p>• User-controlled deletion</p>
                <p>• Regular backups and recovery</p>
              </CardContent>
            </Card>
          </div>

          <div className="border-primary/20 bg-primary/5 mt-8 rounded-lg border p-6">
            <h3 className="mb-3 text-lg font-semibold text-white">
              Security Incident Response
            </h3>
            <p className="mb-4 text-sm text-neutral-400">
              In the unlikely event of a security breach, we commit to:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-white">
                    Immediate Notification
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Affected users notified within 72 hours
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-white">
                    Transparent Communication
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Clear explanation of impact and remediation steps
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-white">
                    Rapid Response
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Immediate containment and system hardening
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-white">
                    Regulatory Compliance
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Full cooperation with authorities and regulators
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4 text-sm text-neutral-400">
              Report security vulnerabilities to{' '}
              <a
                href="mailto:security@sabot.com"
                className="text-primary hover:underline"
              >
                security@sabot.com
              </a>
            </p>
            <p className="text-xs text-neutral-500">
              We run a responsible disclosure program and acknowledge security
              researchers
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-neutral-800/50 bg-neutral-900/20 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Legal Questions?
          </h2>
          <p className="mb-8 text-neutral-400">
            Our legal team is here to help with any questions or concerns
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-white">
                  General Inquiries
                </h3>
                <a
                  href="mailto:legal@sabot.com"
                  className="text-primary text-sm hover:underline"
                >
                  legal@sabot.com
                </a>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-white">
                  Privacy Officer
                </h3>
                <a
                  href="mailto:privacy@sabot.com"
                  className="text-primary text-sm hover:underline"
                >
                  privacy@sabot.com
                </a>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-white">Security Team</h3>
                <a
                  href="mailto:security@sabot.com"
                  className="text-primary text-sm hover:underline"
                >
                  security@sabot.com
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <Button size="lg" asChild>
              <Link href="/">Return to Homepage</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
