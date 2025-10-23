import { getWritableLedgerContract } from './contract';
import { createClient } from '@/lib/supabase/server';
import { getEncryptedKey } from '@/lib/supabase/db/user';
import { decryptPrivateKey } from './helper';

export async function registerUser(): Promise<boolean> {
  const secretKey = process.env.PRIVATE_KEY_SECRET!;

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return false;
    }

    const encryptedKey = await getEncryptedKey(user.id);

    if (!encryptedKey) {
      console.log('No Key');
      return false;
    }

    const privateKey = decryptPrivateKey(secretKey, encryptedKey);

    const contract = await getWritableLedgerContract(privateKey);

    if (!contract) {
      console.log('no contract');
      return false;
    }

    await contract.registerUser();

    return true;
  } catch (error) {
    console.log('failed to register');
    return false;
  }
}
