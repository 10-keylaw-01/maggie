import { useState } from 'react';
import { trackOrder } from '../lib/api';
import { kes, STATUS_LABEL, PAYMENT_LABEL } from '../lib/format';
import { Icon, PageHead } from '../components/ui/Bits';

const FLOW = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'];

export function OrderTimeline({ order }) {
  if (order.status === 'cancelled') return <div className="pill" style={{ background: 'rgba(239,68,68,.14)', color: '#FCA5A5' }}>Order cancelled</div>;
  const flow = order.status === 'prescription_review' ? ['prescription_review', ...FLOW.slice(1)] : FLOW;
  const idx = Math.max(flow.indexOf(order.status), 0);
  return (
    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
      {flow.map((st, i) => (
        <div key={st} style={{ flex: '1 1 110px', textAlign: 'center' }}>
          <div style={{ height: 6, borderRadius: 99, background: i <= idx ? 'linear-gradient(90deg,#9FD96A,#4A8C2A)' : 'rgba(244,250,240,.1)' }}></div>
          <div style={{ marginTop: '.5rem', fontSize: '.7rem', fontWeight: 700, color: i <= idx ? '#9FD96A' : 'rgba(244,250,240,.4)' }}>{STATUS_LABEL[st]}</div>
        </div>
      ))}
    </div>
  );
}

export default function Track() {
  const [num, setNum] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState({ loading: false, order: null, error: '' });

  async function submit(e) {
    e.preventDefault();
    setState({ loading: true, order: null, error: '' });
    try {
      const order = await trackOrder(num, phone);
      setState({ loading: false, order, error: order ? '' : "We couldn't find an order with that number and phone. Check both and try again." });
    } catch { setState({ loading: false, order: null, error: 'Something went wrong. Please try again.' }); }
  }
  const o = state.order;

  return (
    <div style={{ background: 'var(--bg-ink)', minHeight: '100vh' }}>
      <PageHead eyebrow="Track order" title="Where's my order?" sub="Enter your order number and the phone number you used at checkout." />
      <div className="container-x" style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: 760 }}>
        <form onSubmit={submit} className="card-dark" style={{ padding: '1.6rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', alignItems: 'end' }}>
          <div><label className="label" htmlFor="on">Order number</label><input id="on" className="field" required value={num} onChange={e => setNum(e.target.value)} placeholder="ORD-1001" /></div>
          <div><label className="label" htmlFor="ph">Phone number</label><input id="ph" className="field" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712 345 678" inputMode="tel" /></div>
          <button className="btn-primary" disabled={state.loading}>{state.loading ? 'Searching…' : 'Track'}</button>
        </form>
        {state.error && <p style={{ color: '#FCA5A5', marginTop: '1.2rem' }}>{state.error}</p>}
        {o && (
          <div className="card-dark" style={{ padding: '1.6rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.4rem' }}>
              <div><div className="label">Order</div><strong style={{ fontSize: '1.3rem', fontFamily: 'Sora,sans-serif' }}>{o.order_number}</strong></div>
              <div style={{ textAlign: 'right' }}><div className="label">Payment</div><strong style={{ color: o.payment_status === 'paid' ? '#9FD96A' : '#FBBF24' }}>{o.payment_method === 'cash_on_delivery' && o.payment_status === 'unpaid' ? 'Pay on delivery' : PAYMENT_LABEL[o.payment_status]}</strong></div>
            </div>
            <OrderTimeline order={o} />
            <div style={{ marginTop: '1.6rem', borderTop: '1px solid rgba(244,250,240,.1)', paddingTop: '1rem' }}>
              {o.items.map((it, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '.35rem 0', fontSize: '.9rem', color: 'rgba(244,250,240,.78)' }}><span>{it.name} × {it.quantity}</span><span>{kes(it.unit_price * it.quantity)}</span></div>)}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '.8rem', marginTop: '.5rem', borderTop: '1px solid rgba(244,250,240,.08)', fontWeight: 700 }}><span>Total</span><span>{kes(o.total)}</span></div>
            </div>
            {o.status === 'prescription_review' && <p style={{ margin: '1rem 0 0', fontSize: '.84rem', color: '#FDE68A' }}><Icon name="solar:document-medicine-linear" size={16} /> A pharmacist is reviewing your prescription.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
