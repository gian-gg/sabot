import { redirect } from 'next/navigation';
import {
  Wallet,
  Shield,
  Key,
  FileText,
  ExternalLink,
  AlertCircle,
  Info,
  Lock,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
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
import { CopyAddressButton } from '@/components/wallet/copy-address-button';

export default async function WalletPage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch user's wallet address from database
  const { data: userWallet } = await supabase
    .from('user_wallet')
    .select('address')
    .eq('id', user.id)
    .single();

  const hasWallet = userWallet && userWallet.address;

  return (
    <div className="bg-background text-foreground min-h-screen p-6 pt-24 pb-16">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
              <Wallet className="h-8 w-8" />
            </div>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            Your Blockchain Wallet
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Your wallet is your digital identity on the blockchain, enabling
            secure and transparent transactions on Sabot.
          </p>
        </div>

        {/* Public Address Section */}
        {hasWallet ? (
          <Card className="border-primary/20 from-primary/5 bg-gradient-to-br to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Your Public Address</CardTitle>
                <Badge variant="outline" className="text-xs">
                  Safe to Share
                </Badge>
              </div>
              <CardDescription>
                This is your unique identifier on the Lisk Sepolia blockchain.
                Share this address to receive payments or for others to verify
                your transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-muted flex-1 overflow-hidden rounded-lg border p-4">
                  <p className="font-mono text-sm break-all">
                    {userWallet.address}
                  </p>
                </div>
                <CopyAddressButton address={userWallet.address} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Wallet Found</AlertTitle>
            <AlertDescription>
              You haven&apos;t set up a wallet yet. Please sign out and sign in
              again to complete the wallet setup process. Your wallet will be
              automatically created during authentication.
            </AlertDescription>
          </Alert>
        )}

        {/* What is a Wallet Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="text-primary h-5 w-5" />
              <CardTitle>What is a Blockchain Wallet?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              A blockchain wallet is like a digital bank account, but with key
              differences:
            </p>
            <ul className="space-y-2 pl-5">
              <li className="list-disc">
                <strong>Decentralized</strong> - No bank or company controls it.
                You are the sole owner.
              </li>
              <li className="list-disc">
                <strong>Transparent</strong> - All transactions are recorded on
                a public ledger (blockchain) that anyone can verify.
              </li>
              <li className="list-disc">
                <strong>Secure</strong> - Uses cryptographic keys to ensure only
                you can authorize transactions.
              </li>
              <li className="list-disc">
                <strong>Immutable</strong> - Once a transaction is recorded, it
                cannot be altered or deleted.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Why is it Required Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="text-primary h-5 w-5" />
              <CardTitle>Why Does Sabot Require a Wallet?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              Sabot uses blockchain technology to provide trust and safety for
              peer-to-peer transactions:
            </p>
            <ul className="space-y-2 pl-5">
              <li className="list-disc">
                <strong>Transaction Verification</strong> - Every transaction is
                recorded on the blockchain, creating an immutable history of all
                trades.
              </li>
              <li className="list-disc">
                <strong>Identity Proof</strong> - Your wallet address serves as
                your verified digital identity, building trust between buyers
                and sellers.
              </li>
              <li className="list-disc">
                <strong>Dispute Resolution</strong> - Blockchain records provide
                undeniable proof of transaction details if disputes arise.
              </li>
              <li className="list-disc">
                <strong>Fraud Prevention</strong> - Public transaction ledgers
                allow the community to spot and report suspicious patterns.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Understanding Your Credentials */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            Understanding Your Wallet Credentials
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Public Address Card */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Wallet className="h-5 w-5 text-green-500" />
                </div>
                <CardTitle className="text-lg">Public Address</CardTitle>
                <Badge variant="outline" className="w-fit text-xs">
                  Safe to Share
                </Badge>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <p>
                  Your public address is like your email address - it&apos;s
                  safe to share with anyone. People need this to:
                </p>
                <ul className="mt-2 space-y-1 pl-4">
                  <li className="list-disc">Send you payments</li>
                  <li className="list-disc">Verify your transactions</li>
                  <li className="list-disc">
                    Look up your transaction history
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Private Key Card */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <Key className="h-5 w-5 text-red-500" />
                </div>
                <CardTitle className="text-lg">Private Key</CardTitle>
                <Badge variant="destructive" className="w-fit text-xs">
                  Never Share
                </Badge>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <p>
                  Your private key is like your password and PIN combined -
                  it&apos;s the master key to your wallet. It:
                </p>
                <ul className="mt-2 space-y-1 pl-4">
                  <li className="list-disc">
                    Authorizes transactions from your wallet
                  </li>
                  <li className="list-disc">
                    Proves you own the wallet address
                  </li>
                  <li className="list-disc">Cannot be recovered if lost</li>
                </ul>
                <Alert variant="destructive" className="mt-3">
                  <Lock className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    Anyone with your private key can steal all your funds.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Recovery Phrase Card */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <FileText className="h-5 w-5 text-red-500" />
                </div>
                <CardTitle className="text-lg">Recovery Phrase</CardTitle>
                <Badge variant="destructive" className="w-fit text-xs">
                  Never Share
                </Badge>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <p>
                  Your recovery phrase (also called a seed phrase) is a 12-word
                  backup of your wallet. It can:
                </p>
                <ul className="mt-2 space-y-1 pl-4">
                  <li className="list-disc">
                    Restore your wallet on any device
                  </li>
                  <li className="list-disc">
                    Generate your private key if needed
                  </li>
                  <li className="list-disc">Recover access if you lose it</li>
                </ul>
                <Alert variant="destructive" className="mt-3">
                  <Lock className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    Store this phrase offline. Never type it online or share it.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction Explorer Section */}
        {hasWallet && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ExternalLink className="text-primary h-5 w-5" />
                <CardTitle>View Your Transactions</CardTitle>
              </div>
              <CardDescription>
                Track all your blockchain transactions on the Lisk Sepolia block
                explorer. This public ledger shows every transaction associated
                with your wallet address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg border p-4">
                <h4 className="mb-2 text-sm font-semibold">
                  What you&apos;ll see on the explorer:
                </h4>
                <ul className="text-muted-foreground space-y-1 pl-4 text-sm">
                  <li className="list-disc">
                    Complete history of all transactions
                  </li>
                  <li className="list-disc">
                    Transaction timestamps and amounts
                  </li>
                  <li className="list-disc">Sending and receiving addresses</li>
                  <li className="list-disc">
                    Transaction status and confirmations
                  </li>
                  <li className="list-disc">Your current wallet balance</li>
                </ul>
              </div>
              <Button asChild className="w-full" size="lg">
                <a
                  href={`https://sepolia-blockscout.lisk.com/address/${userWallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Lisk Sepolia Block Explorer
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security Best Practices */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="text-primary h-5 w-5" />
              <CardTitle>Security Best Practices</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Keep Your Credentials Safe</AlertTitle>
                <AlertDescription className="space-y-2">
                  <ul className="mt-2 space-y-1 pl-4">
                    <li className="list-disc">
                      <strong>Never share</strong> your private key or recovery
                      phrase with anyone, including Sabot support
                    </li>
                    <li className="list-disc">
                      <strong>Store offline</strong> - Write down your recovery
                      phrase on paper and keep it in a secure location
                    </li>
                    <li className="list-disc">
                      <strong>Use a password manager</strong> for your private
                      key (offline storage is even better)
                    </li>
                    <li className="list-disc">
                      <strong>Beware of phishing</strong> - Always verify
                      you&apos;re on the official Sabot website
                    </li>
                    <li className="list-disc">
                      <strong>Test with small amounts</strong> before making
                      large transactions
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              {!hasWallet && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Setup Required</AlertTitle>
                  <AlertDescription>
                    To complete your wallet setup, please sign out and sign in
                    again. During the authentication process, a wallet will be
                    created for you and you&apos;ll receive your credentials.
                    Make sure to save them securely!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
