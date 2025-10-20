import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ethers } from 'ethers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/';
  if (!next.startsWith('/')) {
    next = '/'; // Default to root if "next" is not a relative URL
  }

  if (code) {
    const supabase = await createClient();
    const { error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!sessionError) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userProfile } = await supabase
          .from('user_wallet')
          .select('address')
          .eq('id', user.id)
          .single();

        // If the user profile exists and already has a wallet, redirect to the main app.
        if (userProfile && userProfile.address) {
          return NextResponse.redirect(`${origin}${next}`);
        }

        // --- NEW LOGIC ---
        // If the user is new or doesn't have a wallet, create one.
        const newWallet = ethers.Wallet.createRandom();
        const publicAddress = newWallet.address;
        const privateKey = newWallet.privateKey;

        if (!newWallet.mnemonic) {
          console.error('Wallet creation failed to generate a mnemonic.');
          return new Response('Wallet creation failed.', { status: 500 });
        }

        const mnemonic = newWallet.mnemonic.phrase;

        const { error: updateError } = await supabase
          .from('user_wallet')
          .insert([{ address: publicAddress }])
          .eq('id', user.id);

        if (updateError) {
          console.error('Failed to save new wallet address:', updateError);
          // Redirect to an error page if saving fails
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        // Redirect to a new page to display the mnemonic phrase securely.
        // We pass the mnemonic as a query parameter for the one-time display.
        const redirectUrl = new URL(`${origin}/wallet/setup`);
        redirectUrl.searchParams.append('mnemonic', mnemonic);
        redirectUrl.searchParams.append('address', publicAddress);
        redirectUrl.searchParams.append('privateKey', privateKey);

        return NextResponse.redirect(redirectUrl.toString());
      }
    }
  }

  // Fallback: return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
