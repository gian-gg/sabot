import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPublicAddress, postNewUserWallet } from '@/lib/supabase/db/user';
import { createWallet } from '@/lib/blockchain/wallet';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  let next = searchParams.get('next') ?? '/';
  if (!next.startsWith('/')) {
    next = '/';
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent('Missing authentication code')}`
    );
  }

  try {
    const supabase = await createClient();
    const { error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent('Failed to authenticate session')}`
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent('Failed to get user data')}`
      );
    }

    const existAddress = await getPublicAddress(user.id);
    if (existAddress) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    const secretKey = process.env.PRIVATE_KEY_SECRET;
    if (!secretKey) {
      console.error('Missing PRIVATE_KEY_SECRET environment variable');
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent('Server configuration error')}`
      );
    }

    const newWallet = createWallet(secretKey);
    if (!newWallet) {
      console.error('Failed to create wallet');
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent('Failed to create blockchain wallet')}`
      );
    }

    const {
      address: publicAddress,
      privateKey,
      mnemonic,
      encryptedKey,
    } = newWallet;

    const saveSuccess = await postNewUserWallet(
      user.id,
      publicAddress,
      encryptedKey
    );

    if (!saveSuccess) {
      console.error('Failed to save wallet');
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent('Failed to save wallet information')}`
      );
    }

    const redirectUrl = new URL(`${origin}/wallet/setup`);
    redirectUrl.searchParams.append('mnemonic', mnemonic);
    redirectUrl.searchParams.append('address', publicAddress);
    redirectUrl.searchParams.append('privateKey', privateKey);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent('An unexpected error occurred')}`
    );
  }
}
