'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getReadOnlyLedgerContract } from '@/lib/blockchain/contract';
import { getPublicAddress } from '@/lib/supabase/db/user';
import { useUserStore } from '@/store/user/userStore';

export function useSabotBalance() {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.id) {
        setBalance('0');
        setIsLoading(false);
        return;
      }

      try {
        // Get user's public address from blockchain data
        const publicAddress = await getPublicAddress(user.id);

        if (!publicAddress) {
          throw new Error('No public address found for user');
        }

        const contract = await getReadOnlyLedgerContract();
        if (!contract) {
          throw new Error('Could not initialize contract');
        }

        // Get balance using the public address
        const userBalance = await contract.balanceOf(publicAddress);

        // Format balance with 18 decimals
        const formattedBalance = ethers.formatUnits(userBalance, 18);

        // Format to max 6 decimal places and remove trailing zeros
        const displayBalance = parseFloat(formattedBalance)
          .toFixed(6)
          .replace(/\.?0+$/, '');

        setBalance(displayBalance);
        setError(null);
      } catch (err) {
        console.error('Error fetching Sabot balance:', err);
        setError('Failed to fetch balance');
        setBalance('0');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Set up polling interval for balance updates
    const interval = setInterval(fetchBalance, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  return {
    balance,
    isLoading,
    error,
    refresh: () => setIsLoading(true),
  };
}
