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
    // Step 1: Fetch transaction details
    const transaction = await getTransactionDetails(transactionId);
    if (transaction.length === 0) {
      console.error(
        'pushTransactionToBlockchain: No transaction details found'
      );
      return false;
    }

    // Step 2: Hash the transaction data
    const sortedData = JSON.stringify(transaction.map(sortObjectKeys));
    const bytes = toUtf8Bytes(sortedData);
    const detailsHash = keccak256(bytes);

    console.log(
      `pushTransactionToBlockchain: Transaction ${transactionId.slice(0, 8)} - Data hash: ${detailsHash}`
    );

    // Step 3: Get user IDs and addresses
    const allUserIds = await getAllUserIds(transactionId);
    if (!allUserIds || allUserIds.length === 0) {
      console.error('pushTransactionToBlockchain: No user IDs found');
      return false;
    }

    const creatorUser = allUserIds.find((user) => user.role === 'creator');
    const invitedUser = allUserIds.find((user) => user.role === 'invitee');

    if (!creatorUser || !invitedUser) {
      console.error(
        'pushTransactionToBlockchain: Creator or invitee user not found in transaction details'
      );
      return false;
    }

    const invitedAddress = await getPublicAddress(invitedUser.user_id);

    if (!invitedAddress) {
      console.error(
        'pushTransactionToBlockchain: No public address found for invitee'
      );
      return false;
    }

    // Step 4: Get creator's encrypted key and contract instance
    const encryptedKey = await getEncryptedKey(creatorUser.user_id);

    if (!encryptedKey) {
      console.error(
        'pushTransactionToBlockchain: No encrypted key found for creator'
      );
      return false;
    }

    const privateKey = decryptPrivateKey(encryptedKey, secretKey);
    const contract = await getWritableLedgerContract(privateKey);

    if (!contract) {
      console.error(
        'pushTransactionToBlockchain: Failed to get writable contract'
      );
      return false;
    }

    // Step 5: Push to blockchain
    console.log(
      `pushTransactionToBlockchain: Sending transaction to blockchain...`
    );

    const tx = await contract.createAgreement(invitedAddress, detailsHash);

    console.log(
      `pushTransactionToBlockchain: Transaction sent! Waiting for confirmation... TX Hash: ${tx.hash}`
    );

    const receipt = await tx.wait();

    if (!receipt || receipt.status !== 1) {
      console.error(
        'pushTransactionToBlockchain: Transaction failed on blockchain',
        receipt
      );
      return false;
    }

    console.log(
      `pushTransactionToBlockchain: Agreement created successfully! Block: ${receipt.blockNumber}, TX Hash: ${receipt.hash}`
    );

    // Step 6: Save the BLOCKCHAIN transaction hash to database (not the data hash)
    const saveSuccess = await postHashTransaction(receipt.hash, transactionId);
    if (!saveSuccess) {
      console.error(
        'pushTransactionToBlockchain: Failed to save blockchain transaction hash to database'
      );
      // Transaction succeeded on blockchain but failed to save hash - log warning but return true
      console.warn(
        `pushTransactionToBlockchain: Transaction is on blockchain but hash not saved to DB. TX: ${receipt.hash}`
      );
    }

    return true;
  } catch (error) {
    console.error(
      'pushTransactionToBlockchain: Failed to push transaction:',
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return false;
  }
}
