import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyDeliverableCompletion } from '@/lib/gemini/deliverable-verification';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User must be authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { proof_id, deliverable_id, deliverable_type } = body;

    if (!proof_id || !deliverable_id) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: 'proof_id and deliverable_id are required',
        },
        { status: 400 }
      );
    }

    // Fetch proof data
    const { data: proof, error: proofError } = await supabase
      .from('escrow_proofs')
      .select('*')
      .eq('id', proof_id)
      .single();

    if (proofError || !proof) {
      return NextResponse.json(
        { error: 'Not found', details: 'Proof not found' },
        { status: 404 }
      );
    }

    // Check if this is a transaction-level deliverable
    let deliverable;
    let escrow;

    if (
      proof.deliverable_id.startsWith('item-') ||
      proof.deliverable_id.startsWith('payment-')
    ) {
      // This is a transaction-level deliverable, find the escrow by transaction ID
      const transactionId = proof.deliverable_id.replace(
        /^(item-|payment-)/,
        ''
      );

      const { data: escrowData, error: escrowError } = await supabase
        .from('escrows')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();

      if (escrowError || !escrowData) {
        return NextResponse.json(
          {
            error: 'Not found',
            details: 'Escrow not found for this transaction',
          },
          { status: 404 }
        );
      }

      escrow = escrowData;

      // Create a virtual deliverable for this transaction-level item
      deliverable = {
        id: proof.deliverable_id,
        escrow_id: escrow.id,
        title: proof.deliverable_id.startsWith('item-')
          ? 'Item Delivery'
          : 'Payment',
        description: proof.deliverable_id.startsWith('item-')
          ? 'Item delivery confirmation'
          : 'Payment confirmation',
        type: proof.deliverable_id.startsWith('item-') ? 'product' : 'payment',
        party_responsible: 'initiator',
        status: 'pending',
      };
    } else {
      // This is a regular deliverable, find it in the database
      const { data: deliverableData, error: deliverableError } = await supabase
        .from('deliverables')
        .select(
          `
          *,
          escrows!inner(*)
        `
        )
        .eq('id', proof.deliverable_id)
        .single();

      if (deliverableError || !deliverableData) {
        return NextResponse.json(
          { error: 'Not found', details: 'Deliverable not found' },
          { status: 404 }
        );
      }

      deliverable = deliverableData;
      escrow = deliverable.escrows;
    }

    // Check if user has access to this proof
    const isInvolved =
      escrow.initiator_id === user.id ||
      escrow.participant_id === user.id ||
      escrow.arbiter_id === user.id;

    if (!isInvolved) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          details: 'You are not authorized to verify this proof',
        },
        { status: 403 }
      );
    }

    // Download proof files for AI verification
    const proofFiles: File[] = [];

    for (const fileInfo of proof.proof_data.files) {
      try {
        // Download file from Supabase storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('escrow-evidence')
          .download(fileInfo.path);

        if (downloadError) {
          console.error('Error downloading file:', downloadError);
          continue;
        }

        // Convert blob to File
        const file = new File([fileData], fileInfo.name, {
          type: fileInfo.type,
        });

        proofFiles.push(file);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }

    if (proofFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid proof files found for verification' },
        { status: 400 }
      );
    }

    // Perform AI verification using the new system
    const verificationResult = await verifyDeliverableCompletion(
      proofFiles,
      {
        type: deliverable.type,
        title: deliverable.title,
        description: deliverable.description || '',
        party_responsible: deliverable.party_responsible,
        expected_date: deliverable.due_date,
      },
      proof.proof_data.description || ''
    );

    // For virtual deliverables, map to real deliverable ID
    let realDeliverableId = deliverable_id;

    if (
      deliverable_id.startsWith('item-') ||
      deliverable_id.startsWith('payment-')
    ) {
      // Find the appropriate deliverable in the database
      const { data: deliverables, error: deliverablesError } = await supabase
        .from('deliverables')
        .select('id, type, party_responsible')
        .eq('escrow_id', escrow.id);

      if (deliverablesError || !deliverables || deliverables.length === 0) {
        return NextResponse.json(
          {
            error: 'Not found',
            details: 'No deliverables found for this escrow',
          },
          { status: 404 }
        );
      }

      // Find the appropriate deliverable based on the virtual ID
      let targetDeliverable;
      if (deliverable_id.startsWith('item-')) {
        // Find the item deliverable (usually party_responsible = 'initiator')
        targetDeliverable = deliverables.find(
          (d) => d.party_responsible === 'initiator'
        );
      } else if (deliverable_id.startsWith('payment-')) {
        // Find the payment deliverable (usually party_responsible = 'participant')
        targetDeliverable = deliverables.find(
          (d) => d.party_responsible === 'participant'
        );
      }

      if (!targetDeliverable) {
        return NextResponse.json(
          {
            error: 'Not found',
            details: 'No matching deliverable found for this verification type',
          },
          { status: 404 }
        );
      }

      realDeliverableId = targetDeliverable.id;
      console.log(
        'Mapped virtual deliverable to real deliverable for verification:',
        {
          virtual: deliverable_id,
          real: realDeliverableId,
          targetDeliverable,
        }
      );
    }

    // Create oracle verification record
    const { data: oracleVerification, error: oracleError } = await supabase
      .from('oracle_verifications')
      .insert({
        escrow_id: escrow.id,
        deliverable_id: realDeliverableId,
        oracle_type: 'ai',
        verification_data: {
          ...verificationResult,
          proof_id: proof_id,
          verified_at: new Date().toISOString(),
          verification_method: 'gemini-ai',
        },
        confidence_score: verificationResult.confidence,
        status: verificationResult.verified ? 'verified' : 'failed',
      })
      .select()
      .single();

    if (oracleError) {
      console.error('Oracle verification creation error:', oracleError);
      // Don't fail the request, just log the error
    }

    // Update proof verification status
    await supabase
      .from('escrow_proofs')
      .update({
        verification_status: verificationResult.verified
          ? 'verified'
          : 'rejected',
        verified_at: verificationResult.verified
          ? new Date().toISOString()
          : null,
      })
      .eq('id', proof_id);

    // Update deliverable status if verified
    if (verificationResult.verified) {
      if (
        deliverable_id.startsWith('item-') ||
        deliverable_id.startsWith('payment-')
      ) {
        // For virtual deliverables, update the corresponding real deliverable
        await supabase
          .from('deliverables')
          .update({
            status: 'confirmed',
            confirmed_by: user.id,
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', realDeliverableId);

        // Also update transaction participants for virtual deliverables
        // The person who uploaded the proof should be marked as confirmed
        const confirmField = deliverable_id.startsWith('item-')
          ? 'item_confirmed'
          : 'payment_confirmed';
        const confirmAtField = deliverable_id.startsWith('item-')
          ? 'item_confirmed_at'
          : 'payment_confirmed_at';

        // The user who uploaded the proof should be marked as confirmed
        const targetUserId = user.id;

        console.log('Updating transaction participant for AI verification:', {
          transactionId: escrow.transaction_id,
          userId: targetUserId,
          confirmField,
          confirmAtField,
        });

        // Update the participant who uploaded the proof
        const { error: participantUpdateError } = await supabase
          .from('transaction_participants')
          .update({
            [confirmField]: true,
            [confirmAtField]: new Date().toISOString(),
          })
          .eq('transaction_id', escrow.transaction_id)
          .eq('user_id', targetUserId);

        if (participantUpdateError) {
          console.error(
            'Error updating transaction participant:',
            participantUpdateError
          );
        } else {
          console.log('Successfully updated transaction participant:', {
            transactionId: escrow.transaction_id,
            userId: targetUserId,
            confirmField,
            confirmAtField,
          });
        }

        // Note: We only update the current user's confirmation status
        // The other participant must confirm their own deliverable separately

        // Check if all deliverables are confirmed by both parties
        const { data: allParticipants, error: participantsError } =
          await supabase
            .from('transaction_participants')
            .select('item_confirmed, payment_confirmed')
            .eq('transaction_id', escrow.transaction_id);

        if (participantsError) {
          console.error('Error checking participants:', participantsError);
        } else {
          const allItemConfirmed =
            allParticipants?.every((p) => p.item_confirmed) || false;
          const allPaymentConfirmed =
            allParticipants?.every((p) => p.payment_confirmed) || false;
          const allDeliverablesConfirmed =
            allItemConfirmed && allPaymentConfirmed;

          if (allDeliverablesConfirmed) {
            // Update transaction status to indicate all deliverables are confirmed
            const { error: transactionUpdateError } = await supabase
              .from('transactions')
              .update({
                status: 'active', // Ready for final confirmation
                updated_at: new Date().toISOString(),
              })
              .eq('id', escrow.transaction_id);

            if (transactionUpdateError) {
              console.error(
                'Error updating transaction status:',
                transactionUpdateError
              );
            }
          }
        }

        // Broadcast update to all clients subscribed to this transaction
        const channel = supabase.channel(
          `transaction:${escrow.transaction_id}`
        );
        await channel.send({
          type: 'broadcast',
          event: 'deliverable_confirmed',
          payload: {
            deliverable_type: deliverable_id.startsWith('item-')
              ? 'item'
              : 'payment',
            user_id: user.id,
            transaction_id: escrow.transaction_id,
            verified: true,
            confidence: verificationResult.confidence,
          },
        });
      } else {
        // For real deliverables, update directly
        await supabase
          .from('deliverables')
          .update({
            status: 'confirmed',
            confirmed_by: user.id,
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', deliverable_id);

        // Broadcast update for real deliverables
        const channel = supabase.channel(`escrow:${escrow.id}`);
        await channel.send({
          type: 'broadcast',
          event: 'deliverable_confirmed',
          payload: {
            deliverable_id: deliverable_id,
            user_id: user.id,
            escrow_id: escrow.id,
            verified: true,
            confidence: verificationResult.confidence,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      verified: verificationResult.verified,
      confidence: verificationResult.confidence,
      reason: verificationResult.reason,
      details: verificationResult.details,
    });
  } catch (error) {
    console.error('Unexpected error in /api/ai/verify-deliverable:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
