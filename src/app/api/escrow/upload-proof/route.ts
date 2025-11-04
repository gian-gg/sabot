import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

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

    // Parse form data
    const formData = await request.formData();
    const deliverableId = formData.get('deliverable_id') as string;
    const description = formData.get('description') as string;
    const deliverableType = formData.get('deliverable_type') as string;

    if (!deliverableId) {
      return NextResponse.json(
        { error: 'Validation error', details: 'deliverable_id is required' },
        { status: 400 }
      );
    }

    // Check if this is a transaction-level deliverable (item-{id} or payment-{id})
    let deliverable;
    let escrow;

    if (
      deliverableId.startsWith('item-') ||
      deliverableId.startsWith('payment-')
    ) {
      // This is a transaction-level deliverable, find the escrow by transaction ID
      const transactionId = deliverableId.replace(/^(item-|payment-)/, '');

      const { data: escrowData, error: escrowError } = await supabase
        .from('escrows')
        .select(
          `
          *,
          transactions!inner(*)
        `
        )
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
        id: deliverableId,
        escrow_id: escrow.id,
        title: deliverableId.startsWith('item-') ? 'Item Delivery' : 'Payment',
        description: deliverableId.startsWith('item-')
          ? 'Item delivery confirmation'
          : 'Payment confirmation',
        type: deliverableId.startsWith('item-') ? 'product' : 'payment',
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
          escrows!inner(
            *,
            transactions!inner(*)
          )
        `
        )
        .eq('id', deliverableId)
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

    // Check if user is involved in this escrow
    const isInvolved =
      escrow.initiator_id === user.id ||
      escrow.participant_id === user.id ||
      escrow.arbiter_id === user.id;

    if (!isInvolved) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          details:
            'You are not authorized to upload proof for this deliverable',
        },
        { status: 403 }
      );
    }

    // Process uploaded files
    const uploadedFiles = [];
    const fileEntries = Array.from(formData.entries()).filter(([key]) =>
      key.startsWith('file_')
    );

    console.log('Processing file upload:', {
      deliverableId,
      fileCount: fileEntries.length,
      user: user.id,
      escrowId: escrow.id,
    });

    for (const [, file] of fileEntries) {
      if (file instanceof File) {
        // Generate unique filename
        const fileExtension = file.name.split('.').pop();
        const fileName = `${randomUUID()}.${fileExtension}`;
        const filePath = `escrow-proofs/${deliverableId}/${fileName}`;

        // Upload to Supabase Storage
        console.log('Uploading file:', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          filePath,
          bucket: 'escrow-evidence',
        });

        const { error: uploadError } = await supabase.storage
          .from('escrow-evidence')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          return NextResponse.json(
            {
              error: 'Upload failed',
              details: `Failed to upload ${file.name}: ${uploadError.message}`,
              storageError: uploadError,
            },
            { status: 400 }
          );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('escrow-evidence')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath,
          url: urlData.publicUrl,
        });
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'Validation error', details: 'No valid files uploaded' },
        { status: 400 }
      );
    }

    // For virtual deliverables, we need to find or create a real deliverable record
    let realDeliverableId = deliverableId;

    console.log('Processing deliverable ID:', deliverableId);

    if (
      deliverableId.startsWith('item-') ||
      deliverableId.startsWith('payment-')
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
      if (deliverableId.startsWith('item-')) {
        // Find the item deliverable (usually party_responsible = 'initiator')
        targetDeliverable = deliverables.find(
          (d) => d.party_responsible === 'initiator'
        );
      } else if (deliverableId.startsWith('payment-')) {
        // Find the payment deliverable (usually party_responsible = 'participant')
        targetDeliverable = deliverables.find(
          (d) => d.party_responsible === 'participant'
        );
      }

      if (!targetDeliverable) {
        return NextResponse.json(
          {
            error: 'Not found',
            details: 'No matching deliverable found for this proof type',
          },
          { status: 404 }
        );
      }

      realDeliverableId = targetDeliverable.id;
      console.log('Mapped virtual deliverable to real deliverable:', {
        virtual: deliverableId,
        real: realDeliverableId,
        targetDeliverable,
      });
    }

    // Create proof record
    const proofData = {
      deliverable_id: realDeliverableId,
      user_id: user.id,
      proof_type:
        deliverableType === 'document'
          ? 'document'
          : deliverableType === 'payment'
            ? 'text'
            : 'image',
      proof_data: {
        files: uploadedFiles,
        description: description || '',
        uploaded_at: new Date().toISOString(),
        deliverable_type: deliverableType,
        virtual_deliverable_id: deliverableId, // Store the original virtual ID for reference
      },
      submitted_at: new Date().toISOString(),
      verification_status: 'pending',
    };

    const { data: proof, error: proofError } = await supabase
      .from('escrow_proofs')
      .insert(proofData)
      .select()
      .single();

    if (proofError) {
      console.error('Proof creation error:', proofError);
      return NextResponse.json(
        { error: 'Failed to create proof', details: proofError.message },
        { status: 500 }
      );
    }

    // For transaction-level deliverables, we don't update a deliverable status
    // since they don't exist in the database. The proof is stored and can be
    // used for AI verification directly.

    return NextResponse.json({
      success: true,
      proof_id: proof.id,
      message: 'Proof uploaded successfully',
      files: uploadedFiles.length,
    });
  } catch (error) {
    console.error('Unexpected error in /api/escrow/upload-proof:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
