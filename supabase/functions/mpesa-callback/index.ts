// Daraja posts the STK Push result here. Deploy with --no-verify-jwt.
// Requests must carry ?token=MPESA_CALLBACK_TOKEN and match a payment we initiated.
import { admin, json } from '../_shared.ts';

const ack = () => json({ ResultCode: 0, ResultDesc: 'Accepted' });

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (req.method !== 'POST' || url.searchParams.get('token') !== Deno.env.get('MPESA_CALLBACK_TOKEN')) {
    return json({ error: 'Forbidden' }, 403);
  }

  try {
    const payload = await req.json();
    const cb = payload?.Body?.stkCallback;
    if (!cb?.CheckoutRequestID) return ack();

    const db = admin();
    const { data: payment } = await db.from('payments').select('*').eq('checkout_request_id', cb.CheckoutRequestID).maybeSingle();
    if (!payment || payment.status !== 'pending') return ack(); // unknown or already processed

    const meta: Record<string, unknown> = {};
    for (const item of cb.CallbackMetadata?.Item ?? []) meta[item.Name] = item.Value;

    const base = { result_code: cb.ResultCode, result_desc: cb.ResultDesc, raw_callback: payload };

    if (cb.ResultCode === 0) {
      const paid = Number(meta.Amount ?? 0);
      if (paid < Number(payment.amount)) {
        await db.from('payments').update({ ...base, status: 'failed', result_desc: `Underpaid: received ${paid}` }).eq('id', payment.id);
        await db.from('orders').update({ payment_status: 'failed' }).eq('id', payment.order_id);
        return ack();
      }
      await db.from('payments').update({ ...base, status: 'success', mpesa_receipt: String(meta.MpesaReceiptNumber ?? '') }).eq('id', payment.id);
      const { data: order } = await db.from('orders').select('status').eq('id', payment.order_id).single();
      await db.from('orders').update({
        payment_status: 'paid',
        // prescription orders stay in review until a pharmacist approves them
        ...(order?.status === 'pending' ? { status: 'confirmed' } : {}),
      }).eq('id', payment.order_id);
    } else {
      await db.from('payments').update({ ...base, status: cb.ResultCode === 1032 ? 'cancelled' : 'failed' }).eq('id', payment.id);
      await db.from('orders').update({ payment_status: 'failed' }).eq('id', payment.order_id);
    }
    return ack();
  } catch (e) {
    console.error(e);
    return ack(); // never make Daraja retry-storm us
  }
});
