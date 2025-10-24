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
      console.error('registerUser: Failed to get user:', error?.message);
      return false;
    }

    console.log('registerUser: User authenticated:', user.id);

    const encryptedKey = await getEncryptedKey(user.id);

    if (!encryptedKey) {
      console.error('registerUser: No encrypted key found for user');
      return false;
    }

    console.log('registerUser: Encrypted key found');

    const privateKey = decryptPrivateKey(encryptedKey, secretKey);

    const contract = await getWritableLedgerContract(privateKey);

    if (!contract) {
      console.error('registerUser: Failed to get writable contract');
      return false;
    }

    console.log('registerUser: Contract obtained, attempting registration...');
    await contract.registerUser();

    console.log('registerUser: Registration successful');
    return true;
  } catch (error) {
    console.error(
      'registerUser: Failed to register:',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}
