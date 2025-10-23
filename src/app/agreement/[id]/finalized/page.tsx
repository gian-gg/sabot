'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle2,
  Download,
  Shield,
  Lock,
  Clock,
  FileText,
  Home,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDocumentStore } from '@/store/document/documentStore';
import {
  exportAgreementToPDF,
  generateFileName,
} from '@/lib/pdf/export-agreement';

interface Party {
  id: string;
  name: string;
  email: string;
  color: string;
  signature?: string;
  signedAt?: string;
}

interface AgreementData {
  id: string;
  title?: string;
  parties?: Party[];
  blockchainHash?: string;
  finalizedAt?: string;
  content?: string;
}

export default function FinalizedPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);

  // Get document from store
  const { title: storedTitle, content: storedContent } = useDocumentStore();

  // Mock data - replace with real data from API/database
  const agreementData: AgreementData = {
    id: params.id,
    title: storedTitle || 'Partnership Agreement',
    content: storedContent || '',
    blockchainHash: '0x8f34c3c0f8c8e8c8e8c8e8c8e8c8e8c8e8c8e8c',
    finalizedAt: new Date().toISOString(),
    parties: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        color: '#1DB954',
        signature: 'https://via.placeholder.com/200x80?text=John+Doe+Signature',
        signedAt: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        color: '#FF6B6B',
        signature:
          'https://via.placeholder.com/200x80?text=Jane+Smith+Signature',
        signedAt: new Date().toISOString(),
      },
    ],
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Check if content exists
      if (!storedContent) {
        toast.error('Document content not found. Please try again.');
        return;
      }

      // Generate filename
      const fileName = generateFileName(storedTitle);

      // Export to PDF with stored content
      await exportAgreementToPDF(storedContent, {
        title: storedTitle,
        fileName,
        includePageNumbers: true,
        includeTimestamp: true,
        documentId: params.id,
      });

      toast.success('Agreement downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to download agreement'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGoHome = () => {
    router.push('/home');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Main Content with top padding for fixed header from root layout */}
      <div className="container mx-auto max-w-4xl px-6 py-8 pt-24 pb-12">
        {/* Success State Banner */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-primary/20 rounded-full p-4">
              <CheckCircle2 className="text-primary h-16 w-16" />
            </div>
          </div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">
            Agreement Finalized
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            All parties have confirmed and signed the agreement. Your
            transaction has been securely stored on the blockchain.
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="border-primary/30 from-primary/5 to-background mb-8 overflow-hidden border-2 bg-gradient-to-br shadow-lg">
          <div className="p-8">
            {/* Agreement Info Section */}
            <div className="mb-8 space-y-4">
              <div>
                <h2 className="text-foreground mb-1 text-xl font-bold">
                  {agreementData.title}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Agreement ID: {agreementData.id}
                </p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
                <div className="bg-card/50 flex items-start gap-3 rounded-lg p-4">
                  <Shield className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Blockchain Hash
                    </p>
                    <p className="text-foreground font-mono text-sm break-all">
                      {truncateHash(agreementData.blockchainHash || '0x...')}
                    </p>
                  </div>
                </div>

                <div className="bg-card/50 flex items-start gap-3 rounded-lg p-4">
                  <Lock className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Status
                    </p>
                    <p className="text-foreground text-sm font-medium">
                      Signed & Locked
                    </p>
                  </div>
                </div>

                <div className="bg-card/50 flex items-start gap-3 rounded-lg p-4">
                  <Clock className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Finalized
                    </p>
                    <p className="text-foreground text-sm">
                      {
                        formatDate(
                          agreementData.finalizedAt || new Date().toISOString()
                        ).split(',')[0]
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-border mb-8 border-t" />

            {/* Confirmed Parties Section */}
            <div className="mb-8">
              <h3 className="text-foreground mb-6 text-lg font-bold">
                Confirmed Parties
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {agreementData.parties?.map((party) => (
                  <div
                    key={party.id}
                    className="bg-card/50 hover:bg-card/80 border-border rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-1 items-center gap-3">
                        <div
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: party.color }}
                        >
                          {party.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground truncate text-sm font-semibold">
                            {party.name}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {party.email}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Signed on{' '}
                            {
                              formatDate(
                                party.signedAt || new Date().toISOString()
                              ).split(',')[0]
                            }
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-border mb-8 border-t" />

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="flex-1 sm:flex-none"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <Button
                size="lg"
                onClick={handleDownload}
                disabled={isDownloading}
                className="min-w-48 flex-1 sm:flex-none"
              >
                {isDownloading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Final Agreement
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Additional Info Card */}
        <Card className="bg-card/30 border-border p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <h4 className="text-foreground font-semibold">
                  What happens next?
                </h4>
                <p className="text-muted-foreground mt-2 text-sm">
                  Your signed agreement has been securely stored on the
                  blockchain and is now legally binding. You can download a copy
                  of the final agreement with all signatures for your records.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
