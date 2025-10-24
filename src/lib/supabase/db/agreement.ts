import { createClient } from '../server';

export interface BlockchainAgreementData {
  agreementId: string;
  agreementHash: string;
  txHash?: string;
  summary: string;
  buyerId: string;
  sellerId: string;
}

export async function storeAgreementDetails(
  agreementHash: string,
  buyerId: string,
  sellerId: string,
  details: string,
  isBuyerInitiator: boolean
): Promise<string | null> {
  const supabase = await createClient();

  const initiatorId = isBuyerInitiator ? buyerId : sellerId;
  const participantId = isBuyerInitiator ? sellerId : buyerId;

  const { data, error } = await supabase
    .from('agreements')
    .insert({
      agreement_type: 'Custom', // or other type as needed
      creator_id: initiatorId,
      status: 'waiting_for_participant',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error storing agreement:', error);
    return null;
  }

  // Add participants with buyer/seller roles
  const participantsPromises = [
    supabase.from('agreement_participants').insert({
      agreement_id: data.id,
      user_id: buyerId,
      role: 'buyer',
      has_confirmed: isBuyerInitiator,
    }),
    supabase.from('agreement_participants').insert({
      agreement_id: data.id,
      user_id: sellerId,
      role: 'seller',
      has_confirmed: !isBuyerInitiator,
    }),
  ];

  // Add content
  const contentPromise = supabase.from('agreement_content').insert({
    agreement_id: data.id,
    content: details,
  });

  await Promise.all([...participantsPromises, contentPromise]);

  return data.id;
}

export async function createBlockchainAgreement(
  data: BlockchainAgreementData
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from('blockchain_agreements').insert({
    agreement_id: data.agreementId,
    agreement_hash: data.agreementHash,
    tx_hash: data.txHash,
    summary: data.summary,
    buyer_id: data.buyerId,
    seller_id: data.sellerId,
  });

  if (error) {
    console.error('Error creating blockchain agreement:', error);
    return false;
  }

  return true;
}

export async function updateBlockchainAgreementTxHash(
  agreementId: string,
  txHash: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('blockchain_agreements')
    .update({
      tx_hash: txHash,
    })
    .match({ agreement_id: agreementId });

  if (error) {
    console.error('Error updating blockchain agreement:', error);
    return false;
  }

  return true;
}

export async function getBlockchainAgreement(
  agreementId: string
): Promise<BlockchainAgreementData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blockchain_agreements')
    .select('*')
    .match({ agreement_id: agreementId })
    .single();

  if (error || !data) {
    console.error('Error fetching blockchain agreement:', error);
    return null;
  }

  return {
    agreementId: data.agreement_id,
    agreementHash: data.agreement_hash,
    txHash: data.tx_hash,
    summary: data.summary,
    buyerId: data.buyer_id,
    sellerId: data.seller_id,
  };
}
