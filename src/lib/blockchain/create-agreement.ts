import { ethers } from 'ethers';
import { generateAgreementHash, TransactionData } from './agreement-utils';
import { storeAgreementDetails } from '@/lib/supabase/db/agreement';
import { getPublicAddress, getEncryptedKey } from '@/lib/supabase/db/user';
import { getWritableLedgerContract } from './contract';

export async function createBlockchainAgreement(
  buyerId: string,
  sellerId: string,
  details: string,
  isBuyerInitiator: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get blockchain addresses for both parties
    const buyerAddress = await getPublicAddress(buyerId);
    const sellerAddress = await getPublicAddress(sellerId);

    if (!buyerAddress || !sellerAddress) {
      throw new Error('Could not find blockchain addresses for users');
    }

    // Prepare transaction data with clear buyer/seller roles
    const transactionData: TransactionData = {
      partyA: isBuyerInitiator ? buyerAddress : sellerAddress,
      partyB: isBuyerInitiator ? sellerAddress : buyerAddress,
      details: details,
      timestamp: Date.now(),
    };

    // Generate hash of the agreement details
    const agreementHash = generateAgreementHash(transactionData);

    // Store agreement details in database
    const agreementId = await storeAgreementDetails(
      agreementHash,
      buyerId,
      sellerId,
      details,
      isBuyerInitiator
    );

    if (!agreementId) {
      throw new Error('Failed to store agreement details');
    }

    // Get encrypted private key for transaction signing from the initiator
    const initiatorId = isBuyerInitiator ? buyerId : sellerId;
    const recipientAddress = isBuyerInitiator ? sellerAddress : buyerAddress;

    const encryptedKey = await getEncryptedKey(initiatorId);
    if (!encryptedKey) {
      throw new Error('No encrypted key found for user');
    }

    // Get contract instance with signer
    const contract = await getWritableLedgerContract(encryptedKey);

    // Create agreement on blockchain with the details hash
    const tx = await contract.createAgreement(
      recipientAddress,
      ethers.encodeBytes32String(agreementHash)
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Verify the transaction was successful
    if (!receipt?.status) {
      throw new Error('Transaction failed');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in createBlockchainAgreement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
