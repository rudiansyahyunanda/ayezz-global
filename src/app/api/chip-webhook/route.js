import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');
    const publicKeyEnv = process.env.CHIP_WEBHOOK_PUBLIC_KEY;

    // Verify RSA Signature if Public Key and Signature header are present
    if (signature && publicKeyEnv) {
      try {
        const publicKey = publicKeyEnv.replace(/\\n/g, '\n');
        const verifier = crypto.createVerify('SHA256');
        verifier.update(rawBody);
        const isValid = verifier.verify(publicKey, signature, 'base64');
        if (!isValid) {
          console.warn('[CHIP Webhook] Signature verification failed!');
        } else {
          console.log('[CHIP Webhook] RSA Signature Verified Successfully ✓');
        }
      } catch (sigErr) {
        console.warn('[CHIP Webhook] Signature check warning:', sigErr.message);
      }
    }

    const body = JSON.parse(rawBody);
    console.log('[CHIP Webhook Received Payload]', body);

    const event = body.event_type || body.event;
    const purchaseId = body.id || body.purchase_id;
    const paymentStatus = body.status;

    if (event === 'purchase.paid' || paymentStatus === 'paid') {
      const orderId = body.reference || body.client?.reference || body.purchase?.products?.[0]?.name?.match(/#([A-Z0-9-]+)/)?.[1];

      if (orderId) {
        console.log(`[CHIP Webhook] Updating order #${orderId} to PAID in Supabase DB...`);
        
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'Pesanan Diterima & Lunas',
            payment_id: purchaseId
          })
          .eq('order_id', orderId);

        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'Pesanan Diterima & Lunas',
            payment_id: purchaseId
          })
          .eq('id', orderId);
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err) {
    console.error('[CHIP Webhook Exception]', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
