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
    return [];
  }
}

export async function isRegistered(): Promise<boolean> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    const [contract, publicAddress] = await Promise.all([
      getReadOnlyLedgerContract(),
      getPublicAddress(user?.id || ''),
    ]);

    if (!contract) {
      return false;
    }

    if (!publicAddress) {
      return false;
    }

    const regis = await contract.registered(publicAddress);

    return !!regis;
  } catch (error) {
    return false;
  }
}
