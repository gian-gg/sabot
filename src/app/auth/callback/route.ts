import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPublicAddress, postNewUserWallet } from '@/lib/supabase/db/user';
import { createWallet } from '@/lib/blockchain/wallet';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  let next = searchParams.get('next') ?? '/user';
  if (!next.startsWith('/')) {
    next = '/user';
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
        const existAddress = await getPublicAddress(user.id);

        if (existAddress) {
          return NextResponse.redirect(`${origin}${next}`);
        }

        const secretKey = process.env.PRIVATE_KEY_SECRET!;
        const newWallet = createWallet(secretKey);

        if (!newWallet) {
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
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
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        const redirectUrl = new URL(`${origin}/wallet/setup`);
        redirectUrl.searchParams.append('mnemonic', mnemonic);
        redirectUrl.searchParams.append('address', publicAddress);
        redirectUrl.searchParams.append('privateKey', privateKey);

        return NextResponse.redirect(redirectUrl.toString());
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
