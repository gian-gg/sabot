import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/escrow/submit-proof
 *
 * Submit proof for escrow deliverable and trigger oracle verification
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { escrow_id, deliverable_id, proof_hash, proof_description } = body;

    if (!escrow_id || !deliverable_id || !proof_hash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is a participant in this escrow
    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrow_id)
      .single();

    if (escrowError || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    if (escrow.initiator_id !== user.id && escrow.participant_id !== user.id) {
      return NextResponse.json(
        { error: 'Not a participant in this escrow' },
        { status: 403 }
      );
    }

    // Get deliverable details from normalized table
    const { data: deliverable, error: deliverableError } = await supabase
      .from('deliverables')
      .select('*')
      .eq('id', deliverable_id)
      .eq('escrow_id', escrow_id)
      .single();

    if (deliverableError || !deliverable) {
      return NextResponse.json(
        { error: 'Deliverable not found' },
        { status: 404 }
      );
    }

    // Verify user is responsible for this deliverable
    const isInitiator = escrow.initiator_id === user.id;
    const isResponsible =
      (isInitiator && deliverable.party_responsible === 'initiator') ||
      (!isInitiator && deliverable.party_responsible === 'participant');

    if (!isResponsible) {
      return NextResponse.json(
        { error: 'Not responsible for this deliverable' },
        { status: 403 }
      );
    }

    // Store proof submission
    const { data: proof, error: proofError } = await supabase
      .from('escrow_proofs')
      .insert({
        escrow_id,
        deliverable_id,
        proof_hash,
        proof_description,
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (proofError) {
      console.error('Error storing proof:', proofError);
      return NextResponse.json(
        { error: 'Failed to store proof' },
        { status: 500 }
      );
    }

    // Update deliverable status to submitted
    await supabase
      .from('deliverables')
      .update({
        status: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliverable_id);

    // Determine oracle type based on deliverable type
    let oracleType: 'ipfs' | 'ai' | 'manual' = 'manual';
    if (deliverable.type === 'digital' || deliverable.type === 'document') {
      oracleType = 'ipfs';
    } else if (deliverable.type === 'service') {
      oracleType = 'ai';
    }

    // Trigger oracle verification if applicable
    let oracleTriggered = false;
    if (oracleType !== 'manual') {
      try {
        // Use internal API route for oracle verification
        const oracleResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oracle/verify`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.id}`, // Pass user context
            },
            body: JSON.stringify({
              escrow_id,
              deliverable_id,
              proof_hash,
              oracle_type: oracleType,
            }),
          }
        );

        if (oracleResponse.ok) {
          oracleTriggered = true;
          console.log('Oracle verification triggered successfully');
        } else {
          console.error(
            'Oracle verification failed:',
            await oracleResponse.text()
          );
        }
      } catch (error) {
        console.error('Error triggering oracle verification:', error);
        // Don't fail the request if oracle fails
      }
    }

    return NextResponse.json({
      success: true,
      proof,
      oracle_triggered: oracleTriggered,
      oracle_type: oracleType,
      message: 'Proof submitted successfully',
    });
  } catch (error) {
    console.error('Submit proof error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
