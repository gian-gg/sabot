import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/blockchain/writeFunctions';
import { isRegistered } from '@/lib/blockchain/readFunctions';

export async function POST() {
  const registeredStatus = await isRegistered();
  if (registeredStatus === null) {
    console.error(
      'Wallet registration failed: Unauthorized or missing user data.'
    );
    return new NextResponse('Unauthorized or missing user data', {
      status: 401,
    });
  }

  if (registeredStatus) {
    console.log(
      'User is already registered on the ledger. Skipping registration.'
    );
    return NextResponse.json({ success: true, message: 'Already registered' });
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
}
