// Starts a Safaricom Daraja STK Push for an existing order.
// The amount is read from the database, never from the request.
import { admin, cors, darajaBase, json, normalisePhone } from '../_shared.ts';

function timestamp() {
  // Daraja expects East Africa Time, YYYYMMDDHHmmss
  const eat = new Date(Date.now() + 3 * 3600 * 1000);
  return eat.toISOString().replace(/[-T:]/g, '').slice(0, 14);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const { order_id, phone } = await req.json();
    const msisdn = normalisePhone(phone);
    if (!order_id || !msisdn) return json({ error: 'Enter a valid Safaricom number, e.g. 0712 345 678' }, 400);

    const db = admin();
    const { data: order, error } = await db.from('orders').select('*').eq('id', order_id).single();
    if (error || !order) return json({ error: 'Order not found' }, 404);
    if (order.payment_status === 'paid') return json({ error: 'This order is already paid' }, 409);
    if (order.status === 'cancelled') return json({ error: 'This order was cancelled' }, 409);
    if (order.payment_method !== 'mpesa') return json({ error: 'This order is not an M-Pesa order' }, 400);

    const key = Deno.env.get('MPESA_CONSUMER_KEY')!;
    const secret = Deno.env.get('MPESA_CONSUMER_SECRET')!;
    const shortcode = Deno.env.get('MPESA_SHORTCODE')!;
    const passkey = Deno.env.get('MPESA_PASSKEY')!;
    const base = darajaBase();

    const tokenRes = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: 'Basic ' + btoa(`${key}:${secret}`) },
    });
    if (!tokenRes.ok) {
      console.error('Daraja auth failed', tokenRes.status, await tokenRes.text());
      return json({ error: 'Payment provider is unavailable right now. Please try again.' }, 502);
    }
    const { access_token } = await tokenRes.json();

    const ts = timestamp();
    const callback = `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback?token=${Deno.env.get('MPESA_CALLBACK_TOKEN')}`;
    const stkRes = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: btoa(`${shortcode}${passkey}${ts}`),
        Timestamp: ts,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(Number(order.total)),
        PartyA: msisdn,
        PartyB: shortcode,
        PhoneNumber: msisdn,
        CallBackURL: callback,
        AccountReference: String(order.order_number).slice(0, 12),
        TransactionDesc: `Order ${order.order_number}`.slice(0, 13),
      }),
    });
    const stk = await stkRes.json();
    if (!stkRes.ok || stk.ResponseCode !== '0') {
      console.error('STK push rejected', stkRes.status, JSON.stringify(stk));
      return json({ error: stk.errorMessage || stk.ResponseDescription || 'Could not send the M-Pesa prompt' }, 502);
    }

    await db.from('payments').insert({
      order_id: order.id, method: 'mpesa', phone: msisdn, amount: Math.ceil(Number(order.total)),
      status: 'pending', merchant_request_id: stk.MerchantRequestID, checkout_request_id: stk.CheckoutRequestID,
    });
    await db.from('orders').update({ payment_status: 'pending' }).eq('id', order.id);

    return json({ ok: true, message: stk.CustomerMessage ?? 'Check your phone to approve the payment.' });
  } catch (e) {
    console.error(e);
    return json({ error: 'Something went wrong starting the payment' }, 500);
  }
});
