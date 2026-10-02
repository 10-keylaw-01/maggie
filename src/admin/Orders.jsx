import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { kes, STATUS_LABEL, PAYMENT_LABEL } from '../lib/format';
import { Tag } from './CrudPage';

const STATUS_TONE = { pending: 'amber', prescription_review: 'amber', confirmed: 'blue', processing: 'blue', out_for_delivery: 'blue', delivered: 'green', cancelled: 'red' };

export default function Orders() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sel, setSel] = useState(null);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.from('orders').select('*, order_items(*), payments(*)').order('created_at', { ascending: false });
    if (e) setError(e.message); else { setError(''); setRows(data); }
    return data;
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = (rows || []).filter(o => (!status || o.status === status) &&
    (!search || [o.order_number, o.customer_name, o.phone, o.email].some(v => String(v || '').toLowerCase().includes(search.toLowerCase()))));

  return (
    <>
      <div className="adm-top"><div><h1>Orders</h1><p>Review prescriptions, update delivery progress and check M-Pesa payments.</p></div></div>
      {error && <div className="adm-err">{error}</div>}
      <div className="adm-card">
        <div className="adm-toolbar">
          <input className="adm-in" style={{ maxWidth: 280 }} placeholder="Search order, name, phone…" value={search} onChange={e => setSearch(e.target.value)} />
          <select style={{ maxWidth: 220 }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <span style={{ marginLeft: 'auto', color: 'var(--mut)' }}>{rows ? `${shown.length} orders` : 'Loading…'}</span>
        </div>
        <div className="adm-table-wrap"><table>
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Placed</th><th></th></tr></thead>
          <tbody>{shown.map(o => (
            <tr key={o.id}>
              <td><b>{o.order_number}</b>{o.has_rx_items && <> <Tag tone="amber">Rx</Tag></>}</td>
              <td><b>{o.customer_name}</b><div style={{ color: 'var(--mut)', fontSize: '.78rem' }}>{o.phone}</div></td>
              <td>{kes(o.total)}</td>
              <td><Tag tone={o.payment_status === 'paid' ? 'green' : o.payment_status === 'failed' ? 'red' : 'amber'}>{PAYMENT_LABEL[o.payment_status]}</Tag><div style={{ color: 'var(--mut)', fontSize: '.72rem' }}>{o.payment_method === 'mpesa' ? 'M-Pesa' : 'On delivery'}</div></td>
              <td><Tag tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Tag></td>
              <td>{new Date(o.created_at).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}</td>
              <td style={{ textAlign: 'right' }}><button className="adm-btn sm" onClick={() => setSel(o)}>Open</button></td>
            </tr>))}</tbody>
        </table>{rows && shown.length === 0 && <div className="adm-empty">No orders match.</div>}</div>
      </div>
      {sel && <OrderDrawer order={sel} onClose={() => setSel(null)} onSaved={async () => { const d = await load(); setSel(d.find(x => x.id === sel.id) || null); }} />}
    </>
  );
}

function OrderDrawer({ order, onClose, onSaved }) {
  const [f, setF] = useState({ status: order.status, payment_status: order.payment_status, admin_notes: order.admin_notes || '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [rxUrl, setRxUrl] = useState('');

  useEffect(() => {
    if (!order.prescription_path) return;
    supabase.storage.from('prescriptions').createSignedUrl(order.prescription_path, 600).then(({ data }) => setRxUrl(data?.signedUrl || ''));
  }, [order.prescription_path]);

  async function save() {
    setBusy(true); setMsg({ type: '', text: '' });
    const { error } = await supabase.from('orders').update(f).eq('id', order.id);
    setBusy(false);
    if (error) return setMsg({ type: 'err', text: error.message });
    setMsg({ type: 'ok', text: 'Saved' }); onSaved();
  }

  const rxItems = order.order_items.filter(i => i.requires_prescription);
  return (
    <div className="adm-modal-bg" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal" style={{ width: 'min(820px,100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.2rem' }}>
          <div><h2 style={{ margin: 0, fontFamily: 'Sora,sans-serif', letterSpacing: '-.04em' }}>{order.order_number}</h2><div style={{ color: 'var(--mut)' }}>{new Date(order.created_at).toLocaleString()}</div></div>
          <button className="adm-btn sm" onClick={onClose}>Close</button>
        </div>
        {msg.text && <div className={msg.type === 'ok' ? 'adm-ok' : 'adm-err'}>{msg.text}</div>}

        {order.has_rx_items && (
          <div className="adm-card adm-pad" style={{ marginBottom: '1rem', borderColor: 'rgba(245,158,11,.5)', background: 'rgba(245,158,11,.06)' }}>
            <b>Prescription required</b>
            <div style={{ margin: '.4rem 0' }}>Rx items: {rxItems.map(i => `${i.product_name} × ${i.quantity}`).join(', ')}</div>
            {rxUrl ? <a className="adm-btn sm" href={rxUrl} target="_blank" rel="noreferrer">Open uploaded prescription</a> : <span style={{ color: 'var(--mut)' }}>{order.prescription_path ? 'Loading file…' : 'No file uploaded'}</span>}
            <div className="help">After verifying, set the status to “Confirmed”. If invalid, set “Cancelled” (stock is restored automatically) and refund any M-Pesa payment from your M-Pesa portal.</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="adm-card adm-pad"><b>Customer</b><div style={{ marginTop: '.4rem', lineHeight: 1.7 }}>{order.customer_name}<br />{order.phone}{order.email && <><br />{order.email}</>}<br />{order.address}{order.city && `, ${order.city}`}{order.delivery_notes && <><br /><i style={{ color: 'var(--mut)' }}>“{order.delivery_notes}”</i></>}</div></div>
          <div className="adm-card adm-pad"><b>Update order</b>
            <div style={{ display: 'grid', gap: '.7rem', marginTop: '.6rem' }}>
              <div><label className="f">Order status</label><select value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label className="f">Payment status</label><select value={f.payment_status} onChange={e => setF({ ...f, payment_status: e.target.value })}>{Object.entries(PAYMENT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                {order.payment_method === 'cash_on_delivery' && <div className="help">Mark as Paid once cash is collected.</div>}</div>
              <div><label className="f">Internal notes</label><textarea rows={2} value={f.admin_notes} onChange={e => setF({ ...f, admin_notes: e.target.value })} /></div>
              <button className="adm-btn primary" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        </div>

        <div className="adm-card" style={{ marginBottom: '1rem' }}><table>
          <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th style={{ textAlign: 'right' }}>Line</th></tr></thead>
          <tbody>{order.order_items.map(i => <tr key={i.id}><td>{i.product_name}{i.requires_prescription && <> <Tag tone="amber">Rx</Tag></>}</td><td>{i.quantity}</td><td>{kes(i.unit_price)}</td><td style={{ textAlign: 'right' }}>{kes(i.unit_price * i.quantity)}</td></tr>)}
            <tr><td colSpan={3} style={{ textAlign: 'right', color: 'var(--mut)' }}>Delivery</td><td style={{ textAlign: 'right' }}>{kes(order.delivery_fee)}</td></tr>
            {Number(order.tax) > 0 && <tr><td colSpan={3} style={{ textAlign: 'right', color: 'var(--mut)' }}>Tax</td><td style={{ textAlign: 'right' }}>{kes(order.tax)}</td></tr>}
            <tr><td colSpan={3} style={{ textAlign: 'right' }}><b>Total</b></td><td style={{ textAlign: 'right' }}><b>{kes(order.total)}</b></td></tr></tbody></table></div>

        <div className="adm-card"><div className="adm-pad" style={{ paddingBottom: 0 }}><b>M-Pesa transactions</b></div>
          {order.payments.length === 0 ? <div className="adm-empty" style={{ padding: '1.2rem' }}>No payment attempts yet.</div> : (
            <table><thead><tr><th>When</th><th>Phone</th><th>Amount</th><th>Result</th><th>Receipt</th></tr></thead>
              <tbody>{order.payments.map(p => <tr key={p.id}><td>{new Date(p.created_at).toLocaleString()}</td><td>{p.phone}</td><td>{kes(p.amount)}</td>
                <td><Tag tone={p.status === 'success' ? 'green' : p.status === 'pending' ? 'amber' : 'red'}>{p.status}</Tag><div style={{ color: 'var(--mut)', fontSize: '.72rem' }}>{p.result_desc}</div></td><td>{p.mpesa_receipt || '—'}</td></tr>)}</tbody></table>)}
        </div>
      </div>
    </div>
  );
}
