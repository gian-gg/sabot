import React from 'react';
import {
  Users,
  Scale,
  Briefcase,
  Mail,
  Heart,
  Target,
  Globe,
  Award,
  Rocket,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-neutral-950">
      {/* Hero Section */}
      <section className="border-b border-neutral-800/50 px-6 pt-32 pb-16">
        <div className="mx-auto max-w-6xl text-center">
          <Badge className="border-primary/50 bg-primary/20 text-primary mb-4">
            About Sabot
          </Badge>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white">
            Building the future of{' '}
            <span className="text-primary">safe transactions</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-neutral-400">
            We&apos;re on a mission to make trust automatic and protect every
            peer-to-peer transaction from fraud and uncertainty.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">Our Mission</h2>
            <p className="text-neutral-400">
              Creating a safer marketplace ecosystem for everyone
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Target className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Our Purpose</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Enable safe, transparent, and verified transactions between
                strangers on online marketplaces through blockchain-like
                transparency and AI-powered fraud detection.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Globe className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Our Vision</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                A world where anyone can transact with confidence, knowing they
                have a trusted third-party safety layer protecting their
                interests.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Heart className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Our Values</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Transparency, trust, and user safety above all. We believe in
                empowering users with knowledge and protection without
                compromising privacy.
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-primary mb-2 text-4xl font-bold">50K+</div>
              <div className="text-sm text-neutral-400">
                Verified Transactions
              </div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-2 text-4xl font-bold">10K+</div>
              <div className="text-sm text-neutral-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-2 text-4xl font-bold">99.9%</div>
              <div className="text-sm text-neutral-400">Safety Rate</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-2 text-4xl font-bold">24/7</div>
              <div className="text-sm text-neutral-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section
        id="blog"
        className="border-t border-neutral-800/50 bg-neutral-900/20 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Latest from Our Blog
            </h2>
            <p className="text-neutral-400">
              Insights, updates, and safety tips
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Blog Post 1 */}
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Badge className="border-primary/50 bg-primary/20 text-primary mb-2 w-fit">
                  Product Update
                </Badge>
                <CardTitle className="text-white">
                  Introducing AI Market Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-neutral-400">
                  Our new AI feature compares your transaction against real-time
                  market data to help identify potential scams before they
                  happen.
                </p>
                <Button variant="link" className="text-primary p-0">
                  Read more →
                </Button>
              </CardContent>
            </Card>

            {/* Blog Post 2 */}
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Badge className="border-primary/50 bg-primary/20 text-primary mb-2 w-fit">
                  Safety Guide
                </Badge>
                <CardTitle className="text-white">
                  5 Red Flags to Watch for in Online Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-neutral-400">
                  Learn how to spot common scam indicators and protect yourself
                  when buying from online marketplaces.
                </p>
                <Button variant="link" className="text-primary p-0">
                  Read more →
                </Button>
              </CardContent>
            </Card>

            {/* Blog Post 3 */}
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Badge className="border-primary/50 bg-primary/20 text-primary mb-2 w-fit">
                  Company News
                </Badge>
                <CardTitle className="text-white">
                  Sabot Reaches 50,000 Verified Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-neutral-400">
                  A milestone celebration and what it means for the future of
                  safe peer-to-peer commerce.
                </p>
                <Button variant="link" className="text-primary p-0">
                  Read more →
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" variant="outline">
              View All Posts
            </Button>
          </div>
        </div>
      </section>

      {/* Arbiter Section */}
      <section
        id="arbiter"
        className="border-t border-neutral-800/50 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Scale className="text-primary mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-4 text-3xl font-bold text-white">
              Become an Arbiter
            </h2>
            <p className="text-neutral-400">
              Join our team of dispute resolution specialists
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xl font-semibold text-white">
                What is an Arbiter?
              </h3>
              <p className="mb-4 text-neutral-400">
                Arbiters are trained professionals who review transaction
                disputes and help both parties reach fair resolutions.
                You&apos;ll work with AI-generated documentation and evidence to
                make informed decisions.
              </p>
              <ul className="space-y-2 text-neutral-400">
                <li className="flex items-start">
                  <Award className="text-primary mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Flexible remote work opportunities</span>
                </li>
                <li className="flex items-start">
                  <Award className="text-primary mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Competitive compensation per case</span>
                </li>
                <li className="flex items-start">
                  <Award className="text-primary mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Comprehensive training provided</span>
                </li>
                <li className="flex items-start">
                  <Award className="text-primary mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Make a real impact on transaction safety</span>
                </li>
              </ul>
            </div>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-neutral-400">
                <div>
                  <h4 className="mb-2 font-semibold text-white">
                    Qualifications
                  </h4>
                  <ul className="space-y-1 pl-4">
                    <li>• Background in law, mediation, or customer service</li>
                    <li>• Strong analytical and decision-making skills</li>
                    <li>• Excellent written communication</li>
                    <li>• Ability to remain impartial and objective</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-white">
                    Time Commitment
                  </h4>
                  <p>Minimum 10 hours per week, flexible scheduling</p>
                </div>
                <Button className="w-full">Apply to Become an Arbiter</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section
        id="careers"
        className="border-t border-neutral-800/50 bg-neutral-900/20 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Briefcase className="text-primary mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-4 text-3xl font-bold text-white">
              Join Our Team
            </h2>
            <p className="text-neutral-400">
              Help us build the future of safe online commerce
            </p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Rocket className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Innovation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Work on cutting-edge AI and blockchain technology that&apos;s
                making a real difference in people&apos;s lives.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <Users className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Culture</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Join a passionate team committed to transparency, collaboration,
                and continuous learning.
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <TrendingUp className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-white">Growth</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                Accelerate your career with opportunities to learn from experts
                and take on new challenges.
              </CardContent>
            </Card>
          </div>

          {/* Open Positions */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Open Positions</h3>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h4 className="mb-1 font-semibold text-white">
                    Senior Frontend Engineer
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Remote • Full-time • Engineering
                  </p>
                </div>
                <Button variant="outline">Apply</Button>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h4 className="mb-1 font-semibold text-white">
                    Machine Learning Engineer
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Remote • Full-time • AI/ML
                  </p>
                </div>
                <Button variant="outline">Apply</Button>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h4 className="mb-1 font-semibold text-white">
                    Product Designer
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Remote • Full-time • Design
                  </p>
                </div>
                <Button variant="outline">Apply</Button>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h4 className="mb-1 font-semibold text-white">
                    Customer Success Manager
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Remote • Full-time • Customer Success
                  </p>
                </div>
                <Button variant="outline">Apply</Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4 text-neutral-400">
              Don&apos;t see the right role? Send us your resume!
            </p>
            <Button size="lg" variant="outline">
              General Application
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="border-t border-neutral-800/50 px-6 py-20"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <Mail className="text-primary mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-4 text-3xl font-bold text-white">Get in Touch</h2>
            <p className="text-neutral-400">
              Have questions? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">General Inquiries</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                <a
                  href="mailto:hello@sabot.com"
                  className="text-primary hover:underline"
                >
                  hello@sabot.com
                </a>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">Support</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                <a
                  href="mailto:support@sabot.com"
                  className="text-primary hover:underline"
                >
                  support@sabot.com
                </a>
              </CardContent>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardHeader>
                <CardTitle className="text-white">Press</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400">
                <a
                  href="mailto:press@sabot.com"
                  className="text-primary hover:underline"
                >
                  press@sabot.com
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
