import { ethers } from 'ethers';
import { getReadOnlyLedgerContract } from '@/lib/blockchain/contract';
import { getPublicAddress } from '@/lib/supabase/db/user';
import { createClient } from '@/lib/supabase/server';

export async function getAgreements() {
  try {
    const contract = await getReadOnlyLedgerContract();

    if (!contract) {
      return [];
    }

    const agreements = await contract.getAgreements();

    if (!Array.isArray(agreements)) {
      return [];
    }

    return agreements;
  } catch (error) {
    console.error(
      'getAgreements: Error fetching agreements:',
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

// Supply-related functions
export async function getTotalSupply(): Promise<string> {
  try {
    const contract = await getReadOnlyLedgerContract();
    const totalSupply = await contract.totalSupply();
    // Format with 18 decimals
    return ethers.formatUnits(totalSupply, 18);
  } catch (error) {
    console.error('getTotalSupply: Error fetching total supply:', error);
    return '0';
  }
}

export async function getCirculatingSupply(): Promise<string> {
  // In most cases, circulating supply is the same as total supply
  // unless there are locked/vested tokens
  return getTotalSupply();
}

export function formatSupply(supply: string): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(supply));
}

// Registration-related functions
export async function isRegistered(): Promise<boolean | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('isRegistered: Failed to get user:', error?.message);
      return null;
    }

    console.log('isRegistered: User found:', user.id);

    const [contract, publicAddress] = await Promise.all([
      getReadOnlyLedgerContract(),
      getPublicAddress(user?.id || ''),
    ]);

    if (!contract) {
      console.error('isRegistered: Failed to get contract');
      return null;
    }

    if (!publicAddress) {
      console.error('isRegistered: No public address found for user');
      return null;
    }

    console.log(
      'isRegistered: Checking registration for address:',
      publicAddress
    );
    try {
      const regis = await contract.registered(publicAddress);
      console.log('isRegistered: Result:', regis);
      return !!regis;
    } catch (callError) {
      console.error(
        'isRegistered: Contract call failed:',
        callError instanceof Error ? callError.message : String(callError)
      );
      throw callError;
    }
  } catch (error) {
    console.error(
      'isRegistered: Unexpected error:',
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}
