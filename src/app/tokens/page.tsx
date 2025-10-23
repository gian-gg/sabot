import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import {
  Coins,
  Zap,
  Crown,
  Check,
  Sparkles,
  Shield,
  TrendingUp,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TokensPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-neutral-950">
      {/* Hero Section */}
      <section className="border-b border-neutral-800/50 px-6 pt-32 pb-16">
        <div className="mx-auto max-w-6xl text-center">
          <Badge className="border-primary/50 bg-primary/20 text-primary mb-4">
            Token Pricing
          </Badge>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white">
            Simple, transparent{' '}
            <span className="text-primary">token packages</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-neutral-400">
            Pay only for verified transactions. No subscriptions, no hidden
            fees. Purchase tokens and use them whenever you need protection.
          </p>
        </div>
      </section>

      {/* How Tokens Work Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              How Tokens Work
            </h2>
            <p className="text-neutral-400">
              Simple, pay-as-you-go transaction protection
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <div className="bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <span className="text-xl font-bold">1</span>
                </div>
                <CardTitle className="text-white">Purchase Tokens</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Choose a package that fits your needs. Tokens never expire and
                roll over month to month.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <div className="bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <span className="text-xl font-bold">2</span>
                </div>
                <CardTitle className="text-white">Create Transaction</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Each verified transaction uses 1 token. Unverified transactions
                or failed verifications don&apos;t consume tokens.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <div className="bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <span className="text-xl font-bold">3</span>
                </div>
                <CardTitle className="text-white">Get Protected</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Access full AI analysis, fraud detection, market comparison, and
                safety features for every transaction.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <div className="bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <span className="text-xl font-bold">4</span>
                </div>
                <CardTitle className="text-white">Top Up Anytime</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Running low? Purchase more tokens at any time. Volume discounts
                apply to larger packages.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="border-t border-neutral-800/50 bg-neutral-900/20 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Choose Your Package
            </h2>
            <p className="text-neutral-400">
              All packages include full platform features
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Starter Package */}
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Zap className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$9</span>
                  <span className="text-neutral-400">/10 tokens</span>
                </div>
                <p className="text-sm text-neutral-400">
                  $0.90 per transaction
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm text-neutral-400">
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>10 verified transactions</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>AI fraud detection</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Market comparison analysis</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Emergency alerts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Dispute reporting</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Purchase Starter
                </Button>
              </CardContent>
            </Card>

            {/* Pro Package - Popular */}
            <Card className="border-primary relative bg-neutral-900/80">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="border-primary/50 bg-primary text-black">
                  Most Popular
                </Badge>
              </div>
              <CardHeader>
                <Crown className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$39</span>
                  <span className="text-neutral-400">/50 tokens</span>
                </div>
                <p className="text-sm text-neutral-400">
                  $0.78 per transaction
                  <span className="text-primary ml-1">(13% savings)</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm text-neutral-400">
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>50 verified transactions</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>AI fraud detection</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Market comparison analysis</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Emergency alerts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Dispute reporting</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="font-semibold text-white">
                      Priority support
                    </span>
                  </li>
                </ul>
                <Button className="w-full">Purchase Pro</Button>
              </CardContent>
            </Card>

            {/* Business Package */}
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Sparkles className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Business</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$149</span>
                  <span className="text-neutral-400">/200 tokens</span>
                </div>
                <p className="text-sm text-neutral-400">
                  $0.75 per transaction
                  <span className="text-primary ml-1">(17% savings)</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm text-neutral-400">
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>200 verified transactions</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>AI fraud detection</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Market comparison analysis</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Emergency alerts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span>Dispute reporting</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="font-semibold text-white">
                      Priority support
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="font-semibold text-white">
                      Dedicated account manager
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-primary mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="font-semibold text-white">API access</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Purchase Business
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Enterprise */}
          <div className="mt-8">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardContent className="flex flex-col items-center justify-between gap-6 p-8 md:flex-row">
                <div className="text-center md:text-left">
                  <h3 className="mb-2 text-2xl font-bold text-white">
                    Enterprise
                  </h3>
                  <p className="text-neutral-400">
                    Custom solutions for high-volume businesses. Contact us for
                    volume discounts and tailored features.
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="border-t border-neutral-800/50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              What&apos;s Included
            </h2>
            <p className="text-neutral-400">
              Every token package includes full platform access
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Shield className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">
                  Identity Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Government ID and face recognition for both parties. Build trust
                through verified identities.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Sparkles className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Cross-reference conversations, detect fraud patterns, and
                generate transaction summaries automatically.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <TrendingUp className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Market Insights</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Real-time pricing comparison against marketplace averages to
                identify potential scams.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <AlertCircle className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Safety Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Context-aware safety tips and mutual acknowledgment system for
                agreed conditions.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Coins className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">
                  Transaction Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Real-time location tracking for meetups, dual confirmation, and
                grace period reporting.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Users className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Trust Score</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Build credibility through verified transaction history visible
                to potential buyers.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-neutral-800/50 bg-neutral-900/20 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">Do tokens expire?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                No! Tokens never expire and roll over month to month. Use them
                whenever you need transaction protection.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  What if my transaction fails verification?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                If identity verification fails or if AI detects irreconcilable
                discrepancies, no token is consumed. You only pay for completed,
                verified transactions.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  Can I get a refund on unused tokens?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Tokens are non-refundable, but since they never expire, you can
                use them at any time in the future.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  Is there a monthly subscription?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                No subscriptions! Purchase tokens as needed with no recurring
                charges. Only pay for what you use.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-neutral-800/50 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to transact safely?
          </h2>
          <p className="mb-8 text-lg text-neutral-400">
            Get started with our Starter package or explore our Pro options
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href={ROUTES.AUTH.SIGN_UP}>Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
