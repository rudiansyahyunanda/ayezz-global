import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('[CHIP Webhook Received]', body);

    const event = body.event_type || body.event;
    const purchaseId = body.id || body.purchase_id;

    if (event === 'purchase.paid' || body.status === 'paid') {
      const orderId = body.reference || body.client?.reference;

      if (orderId) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'Pesanan Diterima & Lunas',
            payment_id: purchaseId
          })
          .eq('order_id', orderId);
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err) {
    console.error('[CHIP Webhook Exception]', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
