'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Copy,
  Check,
  Shield,
  AlertTriangle,
  Lock,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Define a type for the wallet state to improve type safety
interface WalletDetails {
  mnemonic: string;
  address: string;
  privateKey: string;
}

type CopiedField = 'address' | 'privateKey' | 'mnemonic' | '';

// This is a client component for the one-time wallet setup screen.
const WalletSetup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [copied, setCopied] = useState<CopiedField>('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  useEffect(() => {
    const mnemonic = searchParams.get('mnemonic') || '123';
    const address = searchParams.get('address') || '123';
    const privateKey = searchParams.get('privateKey') || '123';

    if (mnemonic && address && privateKey) {
      setWallet({ mnemonic, address, privateKey } as WalletDetails);
    } else {
      // If parameters are missing, redirect away as this page is not meant for direct access.
      router.push('/home');
    }
  }, [searchParams, router]);

  const handleCopy = async (textToCopy: string, field: CopiedField) => {
    try {
      // Use modern Clipboard API
      await navigator.clipboard.writeText(textToCopy);
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback to older method if Clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(field);
        setTimeout(() => setCopied(''), 2000);
      } catch (execErr) {
        console.error('Fallback copy failed:', execErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleContinue = () => {
    router.push('/home');
  };

  if (!wallet) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">
            Loading wallet details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-4 pt-24 pb-16">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Header with Security Icon */}
        <div className="mb-14 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            Secure Your New Wallet
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Your blockchain wallet has been successfully created. Save these
            credentials in a secure, offline password manager immediately.
          </p>
        </div>

        {/* Critical Warning Alert */}
        <Alert variant="destructive" className="flex w-full">
          <div className="flex flex-col gap-3">
            <div className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <AlertTitle>One-Time Display</AlertTitle>
            </div>

            <div className="flex-1">
              <AlertDescription className="leading-relaxed whitespace-normal">
                <span>
                  {' '}
                  This is the <strong>ONLY time</strong> you will see this
                  information. If you lose these credentials, you will
                  permanently lose access to your wallet and funds. There is no
                  recovery option.
                </span>
              </AlertDescription>
            </div>
          </div>
        </Alert>

        <div className="space-y-4">
          {/* Public Address Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <CardTitle>Public Address</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Public
                    </Badge>
                  </div>
                  <CardDescription>
                    Share this address to receive payments. Safe to share
                    publicly.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <div className="bg-muted flex-1 overflow-hidden rounded-lg border p-3">
                  <p className="font-mono text-sm break-all">
                    {wallet.address}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(wallet.address, 'address')}
                  aria-label="Copy public address to clipboard"
                  className="shrink-0"
                >
                  {copied === 'address' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied === 'address' && (
                <p
                  className="mt-2 text-xs font-medium text-green-500"
                  role="status"
                  aria-live="polite"
                >
                  Copied to clipboard!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Private Key Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Lock className="text-destructive h-4 w-4" />
                    <CardTitle>Private Key</CardTitle>
                    <Badge variant="destructive" className="text-xs">
                      Private
                    </Badge>
                  </div>
                  <CardDescription>
                    Provides full access to your wallet. Never share this with
                    anyone.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <div className="bg-muted relative flex-1 overflow-hidden rounded-lg border p-3">
                  <p
                    className={`font-mono text-sm break-all ${!showPrivateKey ? 'blur-sm select-none' : ''}`}
                  >
                    {wallet.privateKey}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    aria-label={
                      showPrivateKey ? 'Hide private key' : 'Show private key'
                    }
                  >
                    {showPrivateKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(wallet.privateKey, 'privateKey')}
                    aria-label="Copy private key to clipboard"
                    disabled={!showPrivateKey}
                  >
                    {copied === 'privateKey' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {copied === 'privateKey' && (
                <p
                  className="mt-2 text-xs font-medium text-green-500"
                  role="status"
                  aria-live="polite"
                >
                  Copied to clipboard!
                </p>
              )}
              <Alert variant="destructive" className="mt-3">
                <AlertDescription className="text-xs">
                  <span>
                    <strong>WARNING:</strong> Anyone with this key can control
                    your wallet and steal your funds. Store it securely offline.
                  </span>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Mnemonic Phrase Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Key className="text-destructive h-4 w-4" />
                    <CardTitle>Secret Recovery Phrase</CardTitle>
                    <Badge variant="destructive" className="text-xs">
                      Private
                    </Badge>
                  </div>
                  <CardDescription>
                    12-word phrase to recover your wallet. Write it down and
                    store it in a safe place.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <div className="bg-muted relative flex-1 overflow-hidden rounded-lg border p-3">
                  <p
                    className={`font-mono text-sm leading-relaxed break-words ${!showMnemonic ? 'blur-sm select-none' : ''}`}
                  >
                    {wallet.mnemonic}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowMnemonic(!showMnemonic)}
                    aria-label={
                      showMnemonic
                        ? 'Hide recovery phrase'
                        : 'Show recovery phrase'
                    }
                  >
                    {showMnemonic ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(wallet.mnemonic, 'mnemonic')}
                    aria-label="Copy recovery phrase to clipboard"
                    disabled={!showMnemonic}
                  >
                    {copied === 'mnemonic' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {copied === 'mnemonic' && (
                <p
                  className="mt-2 text-xs font-medium text-green-500"
                  role="status"
                  aria-live="polite"
                >
                  Copied to clipboard!
                </p>
              )}
              <Alert variant="destructive" className="mt-3">
                <AlertDescription className="text-xs">
                  <span>
                    <strong>CRITICAL:</strong> This phrase can restore your
                    entire wallet. Never share it or store it digitally. Write
                    it on paper.
                  </span>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <Card className="bg-card/50 border-primary/20 backdrop-blur">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">
                  Before continuing, ensure you have:
                </h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>
                      Saved your public address for receiving payments
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>
                      Stored your private key in a secure password manager
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>
                      Written down your 12-word recovery phrase on paper
                    </span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={handleContinue}
                size="lg"
                className="w-full"
                aria-label="Continue to dashboard after securing wallet credentials"
              >
                I&apos;ve Secured My Wallet, Continue to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletSetup;
