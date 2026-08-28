import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, amount, clientName, clientPhone, clientEmail, templateName } = body;

    const CHIP_SECRET_KEY = process.env.CHIP_SECRET_KEY;
    const CHIP_BRAND_ID = process.env.CHIP_BRAND_ID;

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // If CHIP credentials are missing, log guidance and return simulation URL
    if (!CHIP_SECRET_KEY || !CHIP_BRAND_ID || CHIP_SECRET_KEY.includes('your_chip')) {
      console.warn('[CHIP Payment] CHIP credentials not found in .env.local! Using simulation fallback...');
      return NextResponse.json({
        success: true,
        isSimulation: true,
        message: 'Sila masukkan CHIP_SECRET_KEY dan CHIP_BRAND_ID dalam fail .env.local anda dari Merchant Portal CHIP (https://gate.chip-in.asia).',
        checkoutUrl: `${baseUrl}/dashboard?tab=orders&status=simulated_paid&orderId=${orderId}`
      });
    }

    const centsAmount = Math.round(Number(amount || 0) * 100);

    const payload = {
      brand_id: CHIP_BRAND_ID,
      client: {
        email: clientEmail || 'customer@ayezzglobal.com',
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
        message: resData.message || resData.errors || 'Ralat semasa membuat pesanan di CHIP Payment Gateway.'
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
