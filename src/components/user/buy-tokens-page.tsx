'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  Shield,
  Zap,
  Lock,
  TrendingUp,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  CreditCard,
  CircleDashed,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { WalletBalance } from '@/components/wallet/wallet-balance';
import { useSabotBalance } from '@/hooks/useSabotBalance';
import {
  getCirculatingSupply,
  formatSupply,
} from '@/lib/blockchain/readFunctions';

interface TokenStats {
  circulatingSupply: number;
  price: number;
  userBalance: number;
}

export default function BuyTokensPage() {
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    circulatingSupply: 0,
    price: 0,
    userBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountToBuy, setAmountToBuy] = useState<string>('100');
  const { balance } = useSabotBalance();

  const fetchTokenData = useCallback(async () => {
    setIsLoading(true);
    try {
      const circulatingSupply = await fetchLiskCirculatingSupply();
      const userBalance = await fetchUserTokenBalance();
      const price = await fetchTokenPrice();

      setTokenStats({
        circulatingSupply,
        price,
        userBalance,
      });
    } catch (error) {
      toast.error('Failed to fetch token data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  async function fetchLiskCirculatingSupply(): Promise<number> {
    const supply = await getCirculatingSupply();
    return Number(supply);
  }

  async function fetchUserTokenBalance(): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(1250.5), 500);
    });
  }

  async function fetchTokenPrice(): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(0.0042), 500);
    });
  }

  function formatCurrency(num: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(num);
  }

  function openPurchaseFlow() {
    const amount = Number(amountToBuy);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount to buy.');
      return;
    }
    setIsModalOpen(true);
  }

  async function handleBuyTokens(amount: number) {
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid purchase amount.');
      return;
    }

    setIsPurchasing(true);
    setIsModalOpen(false);

    try {
      const response = await fetch('/api/buy-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (response.ok && data.txHash) {
        toast.success(
          `Purchase successful! Tx: ${data.txHash.substring(0, 10)}...`
        );
      } else {
        toast.error(data.error || 'Transaction failed or was rejected.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('An unexpected error occurred during purchase.');
    } finally {
      setIsPurchasing(false);
    }
  }

  async function handleDemoBypass() {
    const DEMO_AMOUNT = 10;
    toast.info(
      `Bypassing payment for demo. Transferring ${DEMO_AMOUNT} $SBT...`
    );
    await handleBuyTokens(DEMO_AMOUNT);
  }

  const totalCost = Number(amountToBuy) * tokenStats.price;

  const PurchaseModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <CreditCard className="text-primary size-6" />
            Confirm Payment
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsModalOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            You are purchasing
            <span className="text-foreground mx-1 text-lg font-bold">
              {amountToBuy} $SBT
            </span>
            for a total estimated cost of
            <span className="text-primary mx-1 text-lg font-bold">
              {formatCurrency(totalCost)}
            </span>
            .
          </p>
          <div className="bg-secondary/30 space-y-3 rounded-lg border p-4">
            <p className="font-semibold">Select Payment Method (Demo):</p>
            <div className="flex gap-3">
              <Button className="flex-1" variant="outline" disabled>
                Credit Card
              </Button>
              <Button className="flex-1" variant="outline" disabled>
                E-Wallet
              </Button>
            </div>
            <Button className="w-full" disabled>
              Connect Payment Gateway...
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              In a live application, this would redirect to a third-party
              payment provider (e.g., Stripe, Coinbase Pay).
            </p>
          </div>
          <div className="mt-4 border-t border-dashed pt-2">
            <Button
              onClick={handleDemoBypass}
              disabled={isPurchasing}
              className="w-full gap-2 bg-yellow-500/80 text-black hover:bg-yellow-500"
            >
              <CircleDashed className="size-5" />
              {isPurchasing
                ? 'Processing...'
                : `DEMO: Bypass Payment (10 $SBT)`}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <>
      {isModalOpen && <PurchaseModal />}

      <div className="container mx-auto max-w-5xl space-y-12 p-6">
        <div className="space-y-6 pt-18 text-center">
          <div className="bg-primary/10 border-primary/20 text-primary mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <Sparkles className="size-4" />
            Powered by Lisk Blockchain
          </div>
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Fuel Your Transactions with{' '}
            <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
              $SBT
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            The native token powering secure P2P transactions and verified
            agreements on Sabot
          </p>
        </div>

        <Card className="border-primary/30 from-primary/5 border-2 bg-gradient-to-br to-transparent">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm tracking-wide uppercase">
                  Your Balance
                </p>
                <div className="flex items-baseline gap-3">
                  <WalletBalance variant="large" showLabel={false} />
                </div>
                {!isLoading && (
                  <p className="text-muted-foreground text-sm">
                    ≈ {formatCurrency(Number(balance) * tokenStats.price)}
                  </p>
                )}
              </div>

              <Card className="w-full p-4 md:w-auto">
                <CardHeader className="mb-3 p-0">
                  <CardTitle className="text-primary flex items-center gap-2 text-lg font-semibold">
                    <ShoppingBag className="size-5" /> Buy $SBT
                  </CardTitle>
                </CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-grow items-center space-x-2 rounded-lg border p-2">
                    <Coins className="text-muted-foreground size-5 shrink-0" />
                    <Input
                      type="number"
                      placeholder="Amount of $SBT"
                      value={amountToBuy}
                      onChange={(e) => setAmountToBuy(e.target.value)}
                      className="w-full border-none p-0 text-lg shadow-none focus-visible:ring-0"
                      min="1"
                    />
                    <span className="text-muted-foreground shrink-0 font-medium">
                      $SBT
                    </span>
                  </div>
                  <Button
                    size="lg"
                    onClick={openPurchaseFlow}
                    disabled={
                      isPurchasing || isLoading || Number(amountToBuy) <= 0
                    }
                    className="h-14 shrink-0 gap-2 px-8 text-lg shadow-lg transition-shadow hover:shadow-xl"
                  >
                    {isPurchasing ? 'Processing...' : 'Execute Purchase'}
                    <ChevronRight className="size-5" />
                  </Button>
                </div>
                {!isLoading && totalCost > 0 && (
                  <p className="text-muted-foreground mt-3 text-center text-sm">
                    Total Estimated Cost:
                    <span className="text-foreground ml-1 font-semibold">
                      {formatCurrency(totalCost)}
                    </span>
                  </p>
                )}
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-center text-3xl font-bold">Why $SBT?</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:border-primary/40 border-2 transition-colors">
              <CardContent className="space-y-4 p-6">
                <div className="bg-primary/10 flex size-12 items-center justify-center rounded-lg">
                  <Shield className="text-primary size-6" />
                </div>
                <h3 className="text-xl font-semibold">Secure Transactions</h3>
                <p className="text-muted-foreground">
                  Required for escrow protection on every P2P marketplace
                  transaction
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/40 border-2 transition-colors">
              <CardContent className="space-y-4 p-6">
                <div className="bg-primary/10 flex size-12 items-center justify-center rounded-lg">
                  <Lock className="text-primary size-6" />
                </div>
                <h3 className="text-xl font-semibold">Verified Agreements</h3>
                <p className="text-muted-foreground">
                  Sign and verify legal contracts with blockchain-backed
                  authenticity
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/40 border-2 transition-colors">
              <CardContent className="space-y-4 p-6">
                <div className="bg-primary/10 flex size-12 items-center justify-center rounded-lg">
                  <Zap className="text-primary size-6" />
                </div>
                <h3 className="text-xl font-semibold">Instant Settlement</h3>
                <p className="text-muted-foreground">
                  Fast, low-cost transactions on the Lisk network with minimal
                  fees
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20 border-2">
            <CardContent className="space-y-3 p-6">
              <div className="text-muted-foreground flex items-center gap-2 text-sm tracking-wide uppercase">
                <TrendingUp className="size-4" />
                Total Supply
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold">
                  {isLoading
                    ? '—'
                    : formatSupply(tokenStats.circulatingSupply.toString())}
                </p>
                <p className="text-muted-foreground text-sm">
                  $SBT tokens in active circulation
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 border-dashed">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">
                    Current Price
                  </p>
                  <p className="text-2xl font-bold">
                    {isLoading ? '—' : formatCurrency(tokenStats.price)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Network</p>
                  <p className="text-2xl font-bold">Lisk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
