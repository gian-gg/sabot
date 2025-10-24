'use client';

import { useState, useEffect } from 'react';
import {
  Coins,
  Shield,
  Zap,
  Lock,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

  useEffect(() => {
    fetchTokenData();
  }, []);

  async function fetchTokenData() {
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
  }

  async function fetchLiskCirculatingSupply(): Promise<number> {
    // GET https://service.lisk.com/api/v3/token/summary/{tokenId}
    return new Promise((resolve) => {
      setTimeout(() => resolve(432156789), 500);
    });
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

  function handleBuyTokens() {
    setIsPurchasing(true);
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: 'Opening purchase flow...',
      success: () => {
        setIsPurchasing(false);
        return 'Redirecting to payment gateway';
      },
      error: () => {
        setIsPurchasing(false);
        return 'Failed to initiate purchase';
      },
    });
  }

  function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  }

  function formatCurrency(num: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(num);
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-12 p-6">
      {/* Hero Section */}
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

      {/* Current Balance Highlight */}
      <Card className="border-primary/30 from-primary/5 border-2 bg-gradient-to-br to-transparent">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm tracking-wide uppercase">
                Your Balance
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold">
                  {isLoading ? '—' : formatNumber(tokenStats.userBalance)}
                </span>
                <span className="text-muted-foreground text-2xl font-semibold">
                  $SBT
                </span>
              </div>
              {!isLoading && (
                <p className="text-muted-foreground text-sm">
                  ≈ {formatCurrency(tokenStats.userBalance * tokenStats.price)}
                </p>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleBuyTokens}
              disabled={isPurchasing}
              className="h-14 gap-2 px-8 text-lg shadow-lg transition-shadow hover:shadow-xl"
            >
              <Coins className="size-5" />
              Buy $SBT Now
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Why Buy Section */}
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

      {/* Stats Bar */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 border-2">
          <CardContent className="space-y-3 p-6">
            <div className="text-muted-foreground flex items-center gap-2 text-sm tracking-wide uppercase">
              <TrendingUp className="size-4" />
              Circulating Supply
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold">
                {isLoading ? '—' : formatNumber(tokenStats.circulatingSupply)}
              </p>
              <p className="text-muted-foreground text-sm">
                $SBT tokens in active circulation on Lisk
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
  );
}
