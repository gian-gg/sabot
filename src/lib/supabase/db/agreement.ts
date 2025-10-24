import { createClient } from '../server';

export interface BlockchainAgreementData {
  agreementId: string;
  agreementHash: string;
  txHash?: string;
  summary: string;
}

export async function storeAgreementDetails(
  agreementHash: string,
  initiatorId: string,
  participantId: string,
  details: string
): Promise<string | null> {
  const supabase = await createClient();

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

  // Add participants
  const participantsPromises = [
    supabase.from('agreement_participants').insert({
      agreement_id: data.id,
      user_id: initiatorId,
      role: 'creator',
      has_confirmed: true,
    }),
    supabase.from('agreement_participants').insert({
      agreement_id: data.id,
      user_id: participantId,
      role: 'invitee',
      has_confirmed: false,
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
  };
}
