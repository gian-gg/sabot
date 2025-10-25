import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { ethers } from 'ethers';

interface Agreement {
  partyA: string;
  partyB: string;
  details: string;
  timestamp: bigint;
}

interface AgreementLedgerProps {
  agreements: Agreement[];
}

// Helper function to format timestamp
function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Helper function to shorten address (e.g., 0x1234...5678)
function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Helper function to decode bytes32 details (if it's UTF-8 encoded)
function decodeDetails(details: string): string {
  try {
    // Remove null bytes and decode
    const cleaned = details.replace(/0x/, '').replace(/00+$/, '');
    if (cleaned.length === 0) return 'No description';
    const bytes = ethers.getBytes('0x' + cleaned);
    const decoded = ethers.toUtf8String(bytes);
    return decoded || 'No description';
  } catch {
    return 'Encrypted details';
  }
}

export function AgreementLedger({ agreements }: AgreementLedgerProps) {
  // Limit to 10 most recent agreements
  const recentAgreements = agreements.slice(0, 10);

  return (
    <Card className="gap-0 border border-neutral-800/60 bg-linear-to-b from-neutral-900/40 to-neutral-950/60 p-0 shadow-2xl backdrop-blur-sm">
      <CardHeader className="flex w-full items-center justify-between gap-0 border-b border-neutral-800/50 bg-neutral-900/30 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
          </div>
          <span className="text-xs font-medium text-neutral-300">
            Agreement Ledger
          </span>
        </div>
        <Badge
          variant="outline"
          className="h-5 border-green-500/30 bg-green-500/10 text-xs text-green-400"
        >
          Live
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        {/* Header */}
        <div className="border-b border-neutral-800/50 bg-neutral-900/20 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-1.5 text-lg font-semibold text-white">
                Recent Agreements
              </h2>
              <p className="text-xs text-neutral-400">
                Live feed of the latest {recentAgreements.length}{' '}
                blockchain-verified agreements
              </p>
            </div>

            {/* Lisk Blockchain Link */}
            <Link
              href="https://sepolia-blockscout.lisk.com/address/0x057C704c039e6DA3317886FF4998f9fC1CBdC181?tab=txs"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-lg border border-neutral-700/50 bg-neutral-800/30 px-3 py-2 transition-all hover:border-purple-500/50 hover:bg-purple-500/10"
            >
              <div className="flex items-center gap-2">
                {/* Lisk Logo */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform group-hover:scale-110"
                >
                  <path
                    d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 29C8.832 29 3 23.168 3 16S8.832 3 16 3s13 5.832 13 13-5.832 13-13 13z"
                    fill="#0981D1"
                  />
                  <path
                    d="M16 7c-4.963 0-9 4.037-9 9s4.037 9 9 9 9-4.037 9-9-4.037-9-9-9zm0 15c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z"
                    fill="#0981D1"
                  />
                  <circle cx="16" cy="16" r="3" fill="#0981D1" />
                </svg>

                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold text-neutral-300 group-hover:text-purple-300">
                    Lisk Sepolia
                  </span>
                  <span className="text-[10px] text-neutral-500 group-hover:text-purple-400">
                    View on Explorer
                  </span>
                </div>
              </div>

              <ExternalLink className="h-3.5 w-3.5 text-neutral-500 group-hover:text-purple-400" />
            </Link>
          </div>
        </div>

        {/* Agreement List */}
        <div className="divide-y divide-neutral-800/50">
          {recentAgreements.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-neutral-500">No agreements found</p>
            </div>
          ) : (
            recentAgreements.map((agreement, index) => (
              <div
                key={index}
                className="block bg-black/20 px-5 py-4 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left side - Agreement details */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        Agreement #{agreements.length - index}
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-xs text-neutral-400">
                        {formatTimestamp(agreement.timestamp)}
                      </span>
                    </div>

                    <div className="text-sm text-neutral-300">
                      <span className="font-medium text-blue-400">
                        {shortenAddress(agreement.partyA)}
                      </span>
                      {' ↔ '}
                      <span className="font-medium text-purple-400">
                        {shortenAddress(agreement.partyB)}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500">
                      {decodeDetails(agreement.details)}
                    </div>
                  </div>

                  {/* Right side - Status badge */}
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="default"
                      className="h-5 bg-green-600/20 text-[10px] text-green-400 hover:bg-green-600/30"
                    >
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
