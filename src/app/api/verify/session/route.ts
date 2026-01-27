import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    // Debug: Check if env variables are even loading
    console.log('--- DIDIT DEBUG START ---');
    console.log('API Key exists:', !!process.env.DIDIT_API_KEY);
    console.log('Workflow ID:', process.env.DIDIT_WORKFLOW_ID);

    const response = await fetch('https://verification.didit.me/v3/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.DIDIT_API_KEY || '',
      },
      body: JSON.stringify({
        workflow_id: process.env.DIDIT_WORKFLOW_ID,
        vendor_data: userId,
        callback: `${process.env.NEXT_PUBLIC_BASE_URL}/verify/callback`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Didit API Error Response:', data);
      return NextResponse.json(
        { error: 'Didit API rejected the request', details: data },
        { status: response.status }
      );
    }

    console.log('✅ Didit Session Created:', data.url);
    return NextResponse.json({ url: data.url });
  } catch (error: any) {
    console.error('💥 Crash in /api/verify/session:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
