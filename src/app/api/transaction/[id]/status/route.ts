import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// Assuming this is the type for the response body
import { TransactionStatusResponse } from '@/types/transaction';
// NOTE: This helper function must be defined and imported separately.
import { pushTransactionToBlockchain } from '@/lib/blockchain/writeFunctions';

// 💡 REMOVED the incomplete 'TransactionWithPushStatus' type definition

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 💡 FIX: Renamed 'transactionData' to 'transaction' and removed the 'pushToBlock' from select
    // 'select(*)' already fetches all columns, including 'pushToBlock'.
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*') // This fetches ALL columns
      .eq('id', id)
      .single();

    // 💡 REMOVED the unsafe type assertion:
    // const transaction = transactionData as TransactionWithPushStatus;

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // =========================================================
    // 🚀 BLOCKCHAIN FINALIZATION LOGIC 🚀
    // This logic is now correct, as 'transaction' is the full, inferred type
    if (
      transaction.status === 'completed' &&
      transaction.pushToBlock === null
    ) {
      console.log(`[BLOCKCHAIN] Finalizing transaction ${id.slice(0, 8)}...`);

      const success = await pushTransactionToBlockchain(transaction.id);

      if (success) {
        // Upsert the transaction table to mark it as pushed
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ pushToBlock: 'done' })
          .eq('id', transaction.id);

        if (updateError) {
          console.error(
            '[BLOCKCHAIN] Failed to update pushToBlock:',
            updateError
          );
        } else {
          // Update the local object so the response reflects the new status
          transaction.pushToBlock = 'done';
          console.log(
            `[BLOCKCHAIN] Successfully pushed and updated for ${id.slice(0, 8)}.`
          );
        }
      } else {
        console.error(
          `[BLOCKCHAIN] Push failed for transaction ${transaction.id.slice(0, 8)}.`
        );
      }
    }
    // =========================================================

    // Get participants with basic data first
    const { data: participants, error: participantsError } = await supabase
      .from('transaction_participants')
      .select('*')
      .eq('transaction_id', id);

    if (participantsError) {
      console.error('Failed to fetch participants:', participantsError);
      return NextResponse.json(
        {
          error: 'Failed to fetch participants',
          details: participantsError.message,
          code: participantsError.code,
        },
        { status: 500 }
      );
    }

    // Enrich participants with profile data
    const enrichedParticipants =
      participants?.map((p) => {
        if (p.role === 'creator') {
          return {
            ...p,
            name: transaction.creator_name || 'Creator',
            email: transaction.creator_email || '',
            avatar: transaction.creator_avatar_url,
          };
        } else {
          // For invitee, use stored participant data
          return {
            ...p,
            name: p.participant_name || 'Participant',
            email: p.participant_email || '',
            avatar: p.participant_avatar_url,
          };
        }
      }) || [];

    // Check if current user is a participant
    const currentUserParticipant = enrichedParticipants.find(
      (p) => p.user_id === user.id
    );

    if (!currentUserParticipant) {
      console.log('Current user not found in participants:', {
        userId: user.id,
        participants: enrichedParticipants.map((p) => ({
          id: p.user_id,
          role: p.role,
        })),
      });
      return NextResponse.json(
        { error: 'Not a participant of this transaction' },
        { status: 403 }
      );
    }

    // Determine if ready for next step
    const participantCount = enrichedParticipants.length;
    const bothJoined = participantCount === 2;
    const bothUploaded =
      bothJoined &&
      enrichedParticipants.every((p) => p.screenshot_uploaded === true);

    let is_ready_for_next_step = false;

    // Ready to move to upload screen if both users have joined
    if (bothJoined && transaction.status === 'both_joined' && !bothUploaded) {
      is_ready_for_next_step = true;
    }
    // Ready to move to transaction details if both uploaded
    else if (transaction.status === 'screenshots_uploaded' && bothUploaded) {
      is_ready_for_next_step = true;
    }

    // Fetch escrow data if it exists
    const { data: escrowData, error: escrowError } = await supabase
      .from('escrows')
      .select(
        `
        *,
        deliverables(*)
        `
      )
      .eq('transaction_id', id)
      .single();

    if (escrowError && escrowError.code !== 'PGRST116') {
      console.error('Error fetching escrow data:', escrowError);
    }

    // Fetch oracle verifications if escrow exists
    let oracleVerifications = [];
    if (escrowData) {
      const { data: verifications, error: verificationsError } = await supabase
        .from('oracle_verifications')
        .select('*')
        .eq('escrow_id', escrowData.id);

      if (verificationsError) {
        console.error(
          'Error fetching oracle verifications:',
          verificationsError
        );
      }
      oracleVerifications = verifications || [];
    }

    // Calculate deliverable statuses with verifications
    const deliverableStatuses =
      escrowData?.deliverables?.map(
        (deliverable: { id: string; [key: string]: unknown }) => ({
          ...deliverable,
          verification: oracleVerifications.find(() =>
            escrowData.deliverables?.some(
              (d: { id: string; [key: string]: unknown }) =>
                d.id === deliverable.id
            )
          ),
        })
      ) || [];

    console.log(`📊 Status API [${id.slice(0, 8)}]:`, {
      status: transaction.status,
      participantCount,
      bothJoined,
      bothUploaded,
      is_ready_for_next_step,
      user: user.id.slice(0, 8),
      hasEscrow: !!escrowData,
      deliverableCount: deliverableStatuses.length,
      participants: enrichedParticipants.map((p) => ({
        userId: p.user_id.slice(0, 8),
        role: p.role,
        itemConfirmed: p.item_confirmed,
        paymentConfirmed: p.payment_confirmed,
      })),
      pushToBlock: transaction.pushToBlock, // Log the new status
    });

    // 💡 This is now correct. 'transaction' is the full, inferred type
    // which matches the 'DBTransaction' type required by 'TransactionStatusResponse'.
    const response: TransactionStatusResponse = {
      transaction: transaction,
      participants: enrichedParticipants,
      current_user_role: currentUserParticipant.role,
      is_ready_for_next_step,
      escrow: escrowData,
      deliverable_statuses: deliverableStatuses,
      oracle_verifications: oracleVerifications,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
