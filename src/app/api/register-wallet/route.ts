// /app/api/register-wallet/route.ts
import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/blockchain/writeFunctions';
import { isRegistered } from '@/lib/blockchain/readFunctions';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    // First, verify the user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in register-wallet:', authError?.message);
      return new NextResponse('User not authenticated', {
        status: 401,
      });
    }

    console.log('User authenticated:', user.id);

    const registeredStatus = await isRegistered();

    if (registeredStatus === null) {
      console.error(
        'Wallet registration failed: Could not check registration status.'
      );
      return new NextResponse('Could not check registration status', {
        status: 500,
      });
    }

    if (registeredStatus) {
      console.log(
        'User is already registered on the ledger. Skipping registration.'
      );
      return NextResponse.json({
        success: true,
        message: 'Already registered',
      });
    }

    console.log(
      'User is verified but not registered. Attempting registration...'
    );
    const registrationSuccess = await registerUser();

    if (registrationSuccess) {
      console.log('User successfully registered on the ledger.');
      return NextResponse.json({
        success: true,
        message: 'Successfully registered',
      });
    } else {
      return new NextResponse('Failed to register wallet on blockchain', {
        status: 500,
      });
    }
  } catch (error) {
    console.error('Error in register-wallet endpoint:', error);
    return new NextResponse('Internal server error', {
      status: 500,
    });
  }
}
