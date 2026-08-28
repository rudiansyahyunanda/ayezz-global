import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, amount, clientName, clientPhone, clientEmail, templateName } = body;

    const CHIP_SECRET_KEY = process.env.CHIP_SECRET_KEY || 'StrEgBqicBshku5VuefR8C76GuGSCueXm_A_tXx9ZULoCdYIsTtznYVc_sw3kS0-Q_ZD2YATKHJY6mpzOOpO1w==';
    const CHIP_BRAND_ID = process.env.CHIP_BRAND_ID || '3f4c8590-5a15-4cfc-a1d0-ef79e0bf8eb7';

    const host = req.headers.get('host') || 'ayezz.com';
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    const centsAmount = Math.round(Number(amount || 0) * 100);

    const payload = {
      brand_id: CHIP_BRAND_ID,
      client: {
        email: clientEmail || 'customer@ayezz.com',
        phone: clientPhone || '0123456789',
        full_name: clientName || 'Pelanggan AYEZZ'
      },
      purchase: {
        currency: 'MYR',
        products: [
          {
            name: `Tempahan Jersi AYEZZ #${orderId} (${templateName || 'Custom Design'})`,
            price: centsAmount
          }
        ]
      },
      success_redirect: `${baseUrl}/dashboard?tab=orders&status=paid&orderId=${orderId}`,
      failure_redirect: `${baseUrl}/dashboard?tab=new-order&status=failed&orderId=${orderId}`,
      cancel_redirect: `${baseUrl}/dashboard?tab=new-order&status=cancelled&orderId=${orderId}`
    };

    console.log('[CHIP Payment API Payload]', payload);

    const response = await fetch('https://gate.chip-in.asia/api/v1/purchases/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHIP_SECRET_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error('[CHIP Payment Error]', resData);
      return NextResponse.json({
        success: false,
        message: resData.message || (typeof resData.errors === 'string' ? resData.errors : JSON.stringify(resData.errors)) || 'Ralat semasa membuat pesanan di CHIP Payment Gateway.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: resData.checkout_url || resData.direct_post_url,
      purchaseId: resData.id
    });

  } catch (err) {
    console.error('[CHIP API Exception]', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
