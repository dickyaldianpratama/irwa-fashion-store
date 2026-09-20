export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || process.env.MIDTRANS_CLIENT_KEY || '';
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const snapScriptUrl = isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  return NextResponse.json({
    clientKey,
    isProduction,
    snapScriptUrl
  });
}
