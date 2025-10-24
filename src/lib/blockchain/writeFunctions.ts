import { ethers } from 'ethers';
import { getWritableLedgerContract } from './contract';
import { createClient } from '@/lib/supabase/server';
import { getEncryptedKey } from '@/lib/supabase/db/user';
import { decryptPrivateKey } from './helper';
import {
  CreateBlockchainAgreementParams,
  BlockchainAgreementEvent,
} from '@/types/blockchain';

/**
 * Creates a new agreement on the blockchain between two parties
 * @param params Agreement parameters including other party's address and agreement details hash
 * @returns Promise resolving to the event emitted by the contract or null if failed
 */
export async function createAgreement(
  params: CreateBlockchainAgreementParams
): Promise<BlockchainAgreementEvent | null> {
  const secretKey = process.env.PRIVATE_KEY_SECRET!;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('createAgreement: Failed to get user:', error?.message);
      return null;
    }

    // Get user's encrypted private key
    const encryptedKey = await getEncryptedKey(user.id);
    if (!encryptedKey) {
      console.error('createAgreement: No encrypted key found for user');
      return null;
    }

    // Decrypt private key and get writable contract
    const privateKey = decryptPrivateKey(encryptedKey, secretKey);
    const contract = await getWritableLedgerContract(privateKey);

    // Create agreement transaction
    const tx = await contract.createAgreement(
      params.otherParty,
      ethers.id(params.detailsHash) // Convert string to bytes32
    );

    // Wait for transaction to be mined and get receipt
    const receipt = await tx.wait();

    // Find AgreementCreated event in receipt
    const event = receipt.logs
      .map((log: { topics: string[]; data: string }) => {
        try {
          return contract.interface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });
        } catch {
          return null;
        }
      })
      .find(
        (event: ethers.LogDescription | null) =>
          event?.name === 'AgreementCreated'
      );

    if (!event) {
      console.error(
        'createAgreement: No AgreementCreated event found in receipt'
      );
      return null;
    }

    // Return typed event data
    return {
      partyA: event.args[0],
      partyB: event.args[1],
      totalFee: event.args[2],
      burnedAmount: event.args[3],
      devAmount: event.args[4],
      details: event.args[5],
      timestamp: event.args[6],
    };
  } catch (error) {
    console.error(
      'createAgreement: Failed to create agreement:',
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

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
