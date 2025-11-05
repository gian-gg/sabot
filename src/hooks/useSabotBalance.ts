'use client';

import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { getReadOnlyLedgerContract } from '@/lib/blockchain/contract';
import { getPublicAddress } from '@/lib/supabase/db/user';
import { useUserStore } from '@/store/user/userStore';

export function useSabotBalance() {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const user = useUserStore();

  const fetchBalance = useCallback(async () => {
    if (!user?.id) {
      setBalance('0');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const publicAddress = await getPublicAddress(user.id);

      if (!publicAddress) {
        console.warn('No public address found for user');
        setBalance('0');
        setIsLoading(false);
        return;
      }

      const contract = await getReadOnlyLedgerContract();
      if (!contract) {
        throw new Error('Could not initialize contract');
      }

      const userBalance = await contract.balanceOf(publicAddress);

      const formattedBalance = ethers.formatUnits(userBalance, 18);

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
  }, [user?.id, refreshKey]);

  useEffect(() => {
    fetchBalance();

    const interval = setInterval(fetchBalance, 30000);

    return () => clearInterval(interval);
  }, [fetchBalance]);

  const refresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  return {
    balance,
    isLoading,
    error,
    refresh,
  };
}
