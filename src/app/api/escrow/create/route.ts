import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CreateEscrowPayload } from '@/types/escrow';

/**
 * POST /api/escrow/create
 *
 * Creates a new escrow transaction.
 *
 * @param request - NextRequest with CreateEscrowPayload in body
 * @returns NextResponse with created escrow or error
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
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User must be authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = (await request.json()) as CreateEscrowPayload;

    // Validate required fields
    if (!body.title || !body.deliverables || body.deliverables.length === 0) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: 'title and at least one deliverable are required',
        },
        { status: 400 }
      );
    }

    // Set expiration date (default: 30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Handle arbiter-required escrow (special version)
    // In production, this would assign from an arbiter pool
    // For now, we'll just mark it as requested
    const arbiterRequired = Boolean(body.arbiter_required);

    // Fetch AI analysis data if transaction_id is provided
    let aiAnalysisData = null;
    if (body.transaction_id) {
      const { data: analyses } = await supabase
        .from('transaction_analyses')
        .select('*')
        .eq('transaction_id', body.transaction_id);

      if (analyses && analyses.length > 0) {
        aiAnalysisData = analyses;
      }
    }

    // Create escrow record
    const { data: escrow, error: createError } = await supabase
      .from('escrows')
      .insert({
        initiator_id: user.id,
        title: body.title,
        description: body.description,
        expected_completion_date: body.expected_completion_date,
        transaction_id: body.transaction_id,
        agreement_id: body.agreement_id,
        expires_at: expiresAt.toISOString(),
        status: arbiterRequired ? 'arbiter_review' : 'pending',
        arbiter_requested: arbiterRequired,
        arbiter_id: body.arbiter_id, // Pre-selected arbiter
        ai_analysis_data: aiAnalysisData, // Store AI analysis data
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating escrow:', createError);
      return NextResponse.json(
        { error: 'Failed to create escrow', details: createError.message },
        { status: 500 }
      );
    }

    // Create individual deliverable records
    if (body.deliverables && body.deliverables.length > 0) {
      const validTypes = ['product', 'service', 'payment', 'document'];
      const validPartyRoles = ['initiator', 'participant', 'both'];

      const deliverableRecords = body.deliverables.map(
        (deliverable: {
          description?: string;
          title?: string;
          type?: string;
          party_responsible?: string;
          value?: number;
          amount?: number;
        }) => {
          // Validate and sanitize deliverable type
          const sanitizedType = validTypes.includes(deliverable.type || '')
            ? deliverable.type
            : 'product';

          // Validate and sanitize party responsible
          const sanitizedParty = validPartyRoles.includes(
            deliverable.party_responsible || ''
          )
            ? deliverable.party_responsible
            : 'initiator';

          return {
            escrow_id: escrow.id,
            title:
              deliverable.description || deliverable.title || 'Deliverable',
            description: deliverable.description,
            type: sanitizedType,
            party_responsible: sanitizedParty,
            amount: deliverable.value || deliverable.amount,
            status: 'pending',
            due_date: body.expected_completion_date,
          };
        }
      );

      const { error: deliverablesError } = await supabase
        .from('deliverables')
        .insert(deliverableRecords);

      if (deliverablesError) {
        console.error('Error creating deliverables:', deliverablesError);
        // Don't fail the entire request, just log the error
      }
    }

    // If participant email provided, create invitation (placeholder for future)
    // This would integrate with your notification system
    if (body.participant_email) {
      // TODO: Send email invitation to participant
      console.log(
        `Invitation would be sent to: ${body.participant_email} for escrow ${escrow.id}`
      );
    }

    return NextResponse.json(
      {
        success: true,
        escrow,
        message: 'Escrow created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in /api/escrow/create:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
