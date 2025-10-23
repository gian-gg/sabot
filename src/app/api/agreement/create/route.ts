import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateAgreementPayload } from '@/types/agreement';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      hasError: !!authError,
      error: authError?.message,
    });

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const payload: CreateAgreementPayload = await request.json();

    // Create agreement
    console.log('Creating agreement for user:', user.id);
    const { data: agreement, error: agreementError } = await supabase
      .from('agreements')
      .insert({
        creator_id: user.id,
        title: payload.title || 'New Agreement',
        agreement_type: payload.agreement_type || 'Custom',
        status: 'waiting_for_participant',
      })
      .select()
      .single();

    if (agreementError) {
      console.error('Agreement creation error:', {
        code: agreementError.code,
        message: agreementError.message,
        details: agreementError.details,
        hint: agreementError.hint,
      });
      return NextResponse.json(
        { error: agreementError.message || 'Failed to create agreement' },
        { status: 500 }
      );
    }

    console.log('Agreement created successfully:', agreement.id);

    // Add creator as participant
    const { error: participantError } = await supabase
      .from('agreement_participants')
      .insert({
        agreement_id: agreement.id,
        user_id: user.id,
        role: 'creator',
      });

    if (participantError) {
      console.error('Participant creation error:', participantError);
      // Rollback agreement
      await supabase.from('agreements').delete().eq('id', agreement.id);
      return NextResponse.json(
        { error: 'Failed to add participant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      agreement,
      invite_url: `${process.env.NEXT_PUBLIC_BASE_URL}/agreement/accept?id=${agreement.id}`,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
