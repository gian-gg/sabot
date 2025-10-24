import { getWritableLedgerContract } from './contract';
import { createClient } from '@/lib/supabase/server';
import {
  getAllUserIds,
  getEncryptedKey,
  getPublicAddress,
  getTransactionDetails,
  postHashTransaction,
} from '@/lib/supabase/db/user';
import { decryptPrivateKey } from './helper';

import { keccak256, toUtf8Bytes } from 'ethers';
import { sortObjectKeys } from '@/lib/blockchain/helper';

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

export async function pushTransactionToBlockchain(
  transactionId: string
): Promise<boolean> {
  const secretKey = process.env.PRIVATE_KEY_SECRET!;

  try {
    const transaction = await getTransactionDetails(transactionId);
    if (transaction.length === 0) {
      console.error(
        'pushTransactionToBlockchain: No transaction details found'
      );
      return false;
    }
    const sortedData = JSON.stringify(transaction.map(sortObjectKeys));
    const bytes = toUtf8Bytes(sortedData);
    const detailsHash = keccak256(bytes);

    const saveSuccess = await postHashTransaction(detailsHash);
    if (!saveSuccess) {
      console.error(
        'pushTransactionToBlockchain: Failed to save transaction hash to database'
      );
      return false;
    }
    const allUserIds = await getAllUserIds(transactionId);
    if (!allUserIds || allUserIds.length === 0) {
      console.error('pushTransactionToBlockchain: No user IDs found');
      return false;
    }

    const creatorUser = allUserIds.find((user) => user.role === 'creator');
    const invitedUser = allUserIds.find((user) => user.role === 'invite');

    if (!creatorUser || !invitedUser) {
      console.error(
        'pushTransactionToBlockchain: Creator user not found in transaction details'
      );
      return false;
    }

    const invitedAddress = await getPublicAddress(invitedUser.user_id);

    const encryptedKey = await getEncryptedKey(creatorUser.user_id);

    if (!encryptedKey) {
      console.error('registerUser: No encrypted key found for user');
      return false;
    }
    const privateKey = decryptPrivateKey(encryptedKey, secretKey);
    const contract = await getWritableLedgerContract(privateKey);

    if (!contract) {
      console.error('registerUser: Failed to get writable contract');
      return false;
    }

    const tx = await contract.createAgreement(invitedAddress, detailsHash);

    const receipt = await tx.wait();

    console.log(
      `pushTransactionToBlockchain: Agreement created successfully! Transaction Hash: ${receipt.hash}`
    );
    return true;
  } catch (error) {
    console.error(
      'pushTransactionToBlockchain: Failed to push transaction:',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}
