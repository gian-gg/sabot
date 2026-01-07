import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateAgreementPayload } from '@/types/agreement';
import { getAgreementLimitsStatus } from '@/lib/supabase/db/agreements';

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

    // Check agreement limits
    console.log('Checking agreement limits for user:', user.id);
    const limits = await getAgreementLimitsStatus(user.id);

    if (!limits.canCreateAgreement) {
      console.log('Agreement creation blocked - limits reached:', limits);
      const waitingHit = !limits.waiting.canCreate;
      const inProgressHit = !limits.inProgress.canCreate;

      let errorMessage = 'Agreement creation limit reached. ';
      if (waitingHit && inProgressHit) {
        errorMessage += `Both waiting (${limits.waiting.current}/${limits.waiting.max}) and in-progress (${limits.inProgress.current}/${limits.inProgress.max}) limits reached.`;
      } else if (waitingHit) {
        errorMessage += `Waiting limit reached (${limits.waiting.current}/${limits.waiting.max}).`;
      } else if (inProgressHit) {
        errorMessage += `In-progress limit reached (${limits.inProgress.current}/${limits.inProgress.max}).`;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 429 } // Too Many Requests
      );
    }

    // Get creator info from user metadata
    const creatorName =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'User';
    const creatorEmail = user.email || '';
    // Use avatar_url from user metadata
    const creatorAvatarUrl =
      user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    console.log('Create - Creator data to store:', {
      creatorName,
      creatorEmail,
      creatorAvatarUrl,
    });

    // Create agreement
    console.log('Creating agreement for user:', user.id, {
      name: creatorName,
      email: creatorEmail,
    });
    const { data: agreement, error: agreementError } = await supabase
      .from('agreements')
      .insert({
        creator_id: user.id,
        creator_name: creatorName,
        creator_email: creatorEmail,
        creator_avatar_url: creatorAvatarUrl,
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

    // Add creator as participant with profile data
    const { error: participantError } = await supabase
      .from('agreement_participants')
      .insert({
        agreement_id: agreement.id,
        user_id: user.id,
        role: 'creator',
        participant_name: creatorName,
        participant_email: creatorEmail,
        participant_avatar_url: creatorAvatarUrl,
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
