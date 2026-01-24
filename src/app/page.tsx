import { AgreementLedger } from '@/components/root/agreement-ledger';
import { MarketplaceCarousel } from '@/components/root/marketplace-carousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GetStartedButton from '@/components/user/get-started-button';
import { ROUTES } from '@/constants/routes';
import { getAgreements } from '@/lib/blockchain/readFunctions';
import {
  Activity,
  AlertTriangle,
  Brain,
  Check,
  CheckCircle,
  Coins,
  Crown,
  FileText,
  Lock,
  MapPin,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  const agreements = await getAgreements();
  return (
    <>
      {/* Light Source Effect - Enhanced positioning for hero */}
      <div className="pointer-events-none fixed -top-[150px] left-1/2 z-0 h-[400px] w-[600px] -translate-x-1/2">
        <div className="absolute top-0 left-1/2 h-[350px] w-[500px] -translate-x-1/2 animate-pulse rounded-full bg-white/12 blur-[120px]" />
        <div className="absolute top-10 left-1/2 h-[250px] w-[300px] -translate-x-1/2 rounded-full bg-[#01d06c]/10 blur-[80px]" />
        <div className="absolute top-20 left-1/2 h-[150px] w-[150px] -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
      </div>

      {/* Main Content - Scrollable with top padding for fixed header */}
      <div className="flex flex-col gap-8 overflow-x-hidden">
        {/* Hero Section - Enhanced */}
        <section className="relative shrink-0 px-6 pt-32 pb-8 sm:pt-40 sm:pb-12">
          <div className="relative mx-auto max-w-4xl text-center">
            {/* Main Headline - Larger and bolder */}
            <h1 className="mb-6 text-5xl leading-[1.1] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              When trust is uncertain,
              <br />
              <span className="text-primary flex items-center justify-center select-none">
                bring in
                <div className="relative h-[1.8em] w-[4em]">
                  <Image
                    src="/logo-white.svg"
                    alt="Sabot"
                    fill
                    className="pointer-events-none object-contain"
                    priority
                    draggable={false}
                  />
                </div>
              </span>
            </h1>

            {/* Tagline - Refined and concise */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg lg:text-xl">
              Your third-party safety layer for verified, transparent, and
              scam-free online transactions.
            </p>

            {/* CTA Button - Enhanced with better prominence */}
            <div className="mb-12 flex items-center justify-center">
              <GetStartedButton />
            </div>

            {/* Trust Indicators - Feature highlights */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500 sm:gap-8 sm:text-base">
              <div className="flex items-center gap-2">
                <Brain className="text-primary h-4 w-4" />
                <span>AI Workflows</span>
              </div>
              <div className="hidden h-4 w-px bg-neutral-800 sm:block" />
              <div className="flex items-center gap-2">
                <Shield className="text-primary h-4 w-4" />
                <span>Blockchain-Verified</span>
              </div>
              <div className="hidden h-4 w-px bg-neutral-800 sm:block" />
              <div className="flex items-center gap-2">
                <Lock className="text-primary h-4 w-4" />
                <span>Privacy First</span>
              </div>
            </div>
          </div>
        </section>

        {/* Agreement Ledger Preview */}
        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1100px]">
            <AgreementLedger agreements={agreements} />
          </div>
        </section>

        {/* Marketplace Carousel */}
        <MarketplaceCarousel />
      </div>
      <div className="min-h-screen bg-linear-to-b from-black to-neutral-950">
        <section className="border-b border-neutral-800/50 px-6 pt-32 pb-16">
          <div className="mx-auto max-w-6xl text-center">
            <Badge className="border-primary/50 bg-primary/20 text-primary mb-4">
              Product Features
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white">
              Everything you need for{' '}
              <span className="text-primary">safe transactions</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-neutral-400">
              Sabot combines AI-powered fraud detection, identity verification,
              and real-time safety monitoring to protect your peer-to-peer
              marketplace transactions.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">
                Core Features
              </h2>
              <p className="text-neutral-400">
                Comprehensive safety features for every transaction
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature Cards */}
              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <Shield className="text-primary mb-2 h-8 w-8" />
                  <CardTitle className="text-white">
                    Identity Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-400">
                  Government ID upload with OCR verification and live face
                  recognition to ensure authentic user identities.
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <Brain className="text-primary mb-2 h-8 w-8" />
                  <CardTitle className="text-white">
                    AI Fraud Detection
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-400">
                  Cross-reference conversation screenshots to detect edited
                  messages, inconsistencies, and potential scam indicators.
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <TrendingUp className="text-primary mb-2 h-8 w-8" />
                  <CardTitle className="text-white">
                    Market Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-400">
                  Real-time market analysis compares your deal against similar
                  listings to identify pricing anomalies.
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <MapPin className="text-primary mb-2 h-8 w-8" />
                  <CardTitle className="text-white">
                    Live Location Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-400">
                  Real-time map visualization for in-person meetups, ensuring
                  both parties can coordinate safe transactions.
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <AlertTriangle className="text-primary mb-2 h-8 w-8" />
                  <CardTitle className="text-white">Emergency Alerts</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-400">
                  Register emergency contacts with auto-alerts for inactivity,
                  distress signals, or abnormal behavior.
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <Activity className="text-primary mb-2 h-8 w-8" />
                  <CardTitle className="text-white">
                    Trust Score System
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-400">
                  Track transaction history and build verified credibility. Only
                  visible to buyers to prevent manipulation.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="border-t border-neutral-800/50 bg-neutral-900/20 px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">
                How It Works
              </h2>
              <p className="text-neutral-400">
                Simple, secure process from invitation to completion
              </p>
            </div>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="bg-primary/20 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                  <span className="text-xl font-bold">1</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    <Users className="mr-2 inline-block h-5 w-5" />
                    Verify Your Identity
                  </h3>
                  <p className="text-neutral-400">
                    Complete identity verification by uploading a government ID
                    and passing live face recognition to unlock full platform
                    features.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="bg-primary/20 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                  <span className="text-xl font-bold">2</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    <MessageSquare className="mr-2 inline-block h-5 w-5" />
                    Share Transaction Link
                  </h3>
                  <p className="text-neutral-400">
                    Generate a unique Sabot transaction link and share it with
                    your counterparty via Facebook Marketplace, Carousell, or
                    any platform.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="bg-primary/20 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                  <span className="text-xl font-bold">3</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    <Brain className="mr-2 inline-block h-5 w-5" />
                    AI Reviews Your Conversation
                  </h3>
                  <p className="text-neutral-400">
                    Upload screenshots of your conversation. AI cross-references
                    both parties&apos; uploads to detect inconsistencies and
                    generates a transaction summary.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6">
                <div className="bg-primary/20 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                  <span className="text-xl font-bold">4</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    <TrendingUp className="mr-2 inline-block h-5 w-5" />
                    Market Analysis & Safety Checks
                  </h3>
                  <p className="text-neutral-400">
                    Review AI-generated market comparisons and accept safety
                    suggestions before confirming transaction details.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-6">
                <div className="bg-primary/20 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                  <span className="text-xl font-bold">5</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    <MapPin className="mr-2 inline-block h-5 w-5" />
                    Complete Transaction Safely
                  </h3>
                  <p className="text-neutral-400">
                    Enter Transaction Mode with live location tracking (for
                    in-person meetups), emergency alerts, and dual confirmation
                    system.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-6">
                <div className="bg-primary/20 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                  <span className="text-xl font-bold">6</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    <CheckCircle className="mr-2 inline-block h-5 w-5" />
                    Grace Period & Reporting
                  </h3>
                  <p className="text-neutral-400">
                    File reports for defective goods or fraud during the grace
                    period. AI generates official documentation and forwards to
                    authorities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reports Section */}
        <section
          id="reports"
          className="border-t border-neutral-800/50 px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">
                Transaction Reports
              </h2>
              <p className="text-neutral-400">
                Transparent tracking and comprehensive analytics
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <FileText className="text-primary mb-2 h-8 w-8" />
                  <CardTitle className="text-white">Public Ledger</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-neutral-400">
                  <p>
                    Blockchain-style public feed displaying all confirmed
                    transactions with unique IDs, transaction types, and
                    timestamps.
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start">
                      <CheckCircle className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>Privacy-protected blurred names</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>Real-time transaction updates</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>Verified transaction history</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <Lock className="text-primary mb-2 h-8 w-8" />
                  <CardTitle className="text-white">Dispute Handling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-neutral-400">
                  <p>
                    AI-powered case management system for post-transaction
                    disputes with automated documentation.
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start">
                      <CheckCircle className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>Automated incident reports</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>Case tracking dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>Direct forwarding to authorities</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Button asChild size="lg">
                <Link href={ROUTES.REPORTS}>View All Reports</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Tokens Section */}
        <section
          id="tokens"
          className="border-t border-neutral-800/50 bg-neutral-900/20 px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">
                Token Packages
              </h2>
              <p className="text-neutral-400">
                Simple, pay-as-you-go transaction protection
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
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>10 verified transactions</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>AI fraud detection</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>Market comparison</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>Emergency alerts</span>
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline">
                    Get Started
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
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>50 verified transactions</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>AI fraud detection</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>Market comparison</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Button className="w-full">Purchase Pro</Button>
                </CardContent>
              </Card>

              {/* Business Package */}
              <Card className="border-neutral-800 bg-neutral-900/50">
                <CardHeader>
                  <Coins className="text-primary mb-2 h-8 w-8" />
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
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>200 verified transactions</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>All features included</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>Account manager</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-primary mt-0.5 mr-2 h-4 w-4 shrink-0" />
                      <span>API access</span>
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Button asChild size="lg" variant="outline">
                <Link href="/tokens">View All Packages</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-neutral-800/50 px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Ready to get started?
            </h2>
            <p className="mb-8 text-lg text-neutral-400">
              Join thousands of users transacting safely with Sabot
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href={ROUTES.AUTH.SIGN_UP}>Buy Tokens</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
