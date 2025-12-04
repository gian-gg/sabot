import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Github, Twitter, Mail } from 'lucide-react';
import Logo from '@/components/core/logo';

const Footer = () => {
  return (
    <footer className="border-t border-neutral-800/50 bg-linear-to-b from-black to-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Logo />
            </div>
            <p className="mb-4 text-sm text-neutral-400">
              Your third-party safety layer for verified, transparent, and
              scam-free online transactions.
            </p>
            <div className="flex gap-3">
              <a
                href={ROUTES.SOCIALS.GITHUB}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-neutral-800 p-2 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-lg border border-neutral-800 p-2 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@sabot.com"
                className="rounded-lg border border-neutral-800 p-2 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#features"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/#reports"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/#tokens"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  Tokens
                </Link>
              </li>
              <li>
                <Link
                  href="/#docs"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/company#about"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/company#blog"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/company#arbiter"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  Arbiter
                </Link>
              </li>
              <li>
                <Link
                  href="/company#contact"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/legal#privacy"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal#terms"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal#security"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-neutral-800/50 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Sabot. All rights reserved.
            </p>
            <p className="text-sm text-neutral-500">
              Built for safer transactions
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
