import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import geminiClient from '@/lib/gemini';

/**
 * POST /api/oracle/verify
 *
 * Oracle verification endpoint for escrow deliverables
 * Supports IPFS file verification and AI service verification
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
    const { escrow_id, deliverable_id, proof_hash, oracle_type } = body;

    if (!escrow_id || !deliverable_id || !proof_hash || !oracle_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get escrow details
    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrow_id)
      .single();

    if (escrowError || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    // Get deliverable from normalized table
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

    let verificationResult = {
      verified: false,
      confidence_score: 0,
      notes: '',
    };

    // Perform verification based on oracle type
    if (oracle_type === 'ipfs') {
      verificationResult = await verifyIPFSFile(proof_hash);
    } else if (oracle_type === 'ai') {
      verificationResult = await verifyAIService(deliverable, proof_hash);
    }

    // Store verification result
    const { data: verification, error: verificationError } = await supabase
      .from('oracle_verifications')
      .insert({
        escrow_id,
        oracle_type,
        verified: verificationResult.verified,
        confidence_score: verificationResult.confidence_score,
        proof_hash,
        notes: verificationResult.notes,
      })
      .select()
      .single();

    if (verificationError) {
      console.error('Error storing verification:', verificationError);
      return NextResponse.json(
        { error: 'Failed to store verification result' },
        { status: 500 }
      );
    }

    // Update deliverable status based on verification result
    const newStatus = verificationResult.verified ? 'verified' : 'failed';
    await supabase
      .from('deliverables')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliverable_id);

    // If verification successful, auto-confirm the responsible party
    if (verificationResult.verified) {
      const isInitiator = deliverable.party_responsible === 'initiator';
      const updateField = isInitiator
        ? 'initiator_confirmation'
        : 'participant_confirmation';
      const timestampField = isInitiator
        ? 'initiator_confirmed_at'
        : 'participant_confirmed_at';

      await supabase
        .from('escrows')
        .update({
          [updateField]: 'confirmed',
          [timestampField]: new Date().toISOString(),
        })
        .eq('id', escrow_id);

      // TODO: Submit to blockchain if configured
      // await submitToBlockchain(escrow_id, verificationResult);
    }

    return NextResponse.json({
      success: true,
      verification,
      message: verificationResult.verified
        ? 'Deliverable verified successfully'
        : 'Verification failed',
    });
  } catch (error) {
    console.error('Oracle verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verify IPFS file accessibility
 */
async function verifyIPFSFile(proofHash: string): Promise<{
  verified: boolean;
  confidence_score: number;
  notes: string;
}> {
  try {
    // Extract IPFS CID from proof hash
    const ipfsUrl = `https://ipfs.io/ipfs/${proofHash}`;

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(ipfsUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        verified: true,
        confidence_score: 100,
        notes: 'File is accessible on IPFS',
      };
    } else {
      return {
        verified: false,
        confidence_score: 0,
        notes: `File not accessible: ${response.status}`,
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        verified: false,
        confidence_score: 0,
        notes: 'IPFS verification timed out after 10 seconds',
      };
    }
    return {
      verified: false,
      confidence_score: 0,
      notes: `IPFS verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verify service completion using AI
 */
async function verifyAIService(
  deliverable: { description: string; type: string },
  proofHash: string
): Promise<{
  verified: boolean;
  confidence_score: number;
  notes: string;
}> {
  try {
    const prompt = `
You are an oracle verifying service completion. Analyze the following:

Service Requirements: ${deliverable.description}
Proof Submitted: ${proofHash}

Determine if the service has been completed satisfactorily. Respond with JSON:
{
  "verified": boolean,
  "confidence": number (0-100),
  "notes": "explanation"
}

Only mark as verified if confidence >= 80%.
`;

    const ai = geminiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-pro',
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });
    const response = result.text;
    if (typeof response !== 'string') {
      throw new Error('AI response did not return text');
    }
    const parsedResult = JSON.parse(response);

    return {
      verified: parsedResult.verified && parsedResult.confidence >= 80,
      confidence_score: parsedResult.confidence,
      notes: parsedResult.notes,
    };
  } catch (error) {
    return {
      verified: false,
      confidence_score: 0,
      notes: `AI verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
