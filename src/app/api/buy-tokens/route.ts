import { NextResponse } from 'next/server';
import { buyTokensfromHost } from '@/lib/blockchain/writeFunctions';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });
    }

    const txHash = await buyTokensfromHost(amount);

    if (!txHash) {
      throw new Error('Transaction failed without a hash.');
    }

    return NextResponse.json({ success: true, txHash });
  } catch (error) {
    console.error('API Error buying tokens:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase.' },
      { status: 500 }
    );
  }
}
