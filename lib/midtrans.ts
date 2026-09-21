import crypto from 'crypto';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-DUMMY_KEY_DEV';
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION 
  ? 'https://app.midtrans.com/snap/v1/transactions' 
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

/**
 * Buat Transaksi Snap Midtrans
 */
export async function createSnapTransaction({
  orderId,
  grossAmount,
  customerName,
  customerEmail,
  customerPhone,
  items
}: {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}) {
  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.round(grossAmount)
    },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
      phone: customerPhone
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost') ? process.env.NEXT_PUBLIC_APP_URL : 'https://irwa-fashion-store.vercel.app'}/checkout/success?orderId=${orderId}`
    }
  };

  try {
    const response = await fetch(MIDTRANS_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data; // Akan mengembalikan { token, redirect_url }
  } catch (error) {
    console.error('Midtrans API Error:', error);
    return null;
  }
}

/**
 * Verifikasi Signature Notifikasi (Webhook) dari Midtrans
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
) {
  const payload = `${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`;
  const generatedSignature = crypto.createHash('sha512').update(payload).digest('hex');
  
  return generatedSignature === signatureKey;
}

/**
 * Cek status transaksi langsung ke Midtrans (Berguna jika Webhook gagal/localhost)
 */
export async function checkTransactionStatus(orderId: string) {
  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
  const apiUrl = MIDTRANS_IS_PRODUCTION 
    ? `https://api.midtrans.com/v2/${orderId}/status`
    : `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`
      }
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Midtrans Status Check Error:', error);
    return null;
  }
}
