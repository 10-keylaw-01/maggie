import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { getMyOrders } from '../lib/api';
import { supabase } from '../lib/supabase';
import { kes, STATUS_LABEL, PAYMENT_LABEL } from '../lib/format';
import { PageHead, Skeleton } from '../components/ui/Bits';
import { OrderTimeline } from './Track';

export default function Account() {
  const { user, profile, loading, isAdmin, signOut, refreshProfile } = useAuth();
  const orders = useAsync(() => (user ? getMyOrders() : Promise.resolve([])), [user?.id]);
  const [f, setF] = useState(null);
  const [msg, setMsg] = useState('');

  if (loading) return <div className="container-x" style={{ paddingTop: 140 }}><Skeleton h={300} /></div>;
  if (!user) return <Navigate to="/login?next=/account" replace />;

  const form = f ?? { full_name: profile?.full_name || '', phone: profile?.phone || '', address: profile?.address || '', city: profile?.city || '' };
  const set = e => setF({ ...form, [e.target.name]: e.target.value });

  async function save(e) {
    e.preventDefault();
    const { error } = await supabase.from('profiles').update(form).eq('id', user.id);
    setMsg(error ? error.message : 'Saved');
    if (!error) refreshProfile();
  }

  return (
    <div style={{ background: 'var(--bg-ink)', minHeight: '100vh' }}>
      <PageHead eyebrow="My account" title={`Hello${profile?.full_name ? ', ' + profile.full_name.split(' ')[0] : ''}`} sub={user.email}>
        <div style={{ display: 'flex', gap: '.7rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
          {isAdmin && <Link to="/admin" className="btn-primary">Open admin panel</Link>}
          <button className="btn-ghost" onClick={signOut}>Sign out</button>
        </div>
      </PageHead>
      <div className="container-x two-col" style={{ padding: '2.5rem 1.5rem 5rem', display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(280px,.8fr)', gap: '2rem', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', letterSpacing: '-.04em', margin: '0 0 1rem' }}>Order history</h2>
          {orders.loading ? <Skeleton h={160} /> : orders.data?.length === 0 ? (
            <div className="card-dark" style={{ padding: '2rem', textAlign: 'center', color: 'rgba(244,250,240,.6)' }}>No orders yet. <Link to="/shop" style={{ color: '#9FD96A', fontWeight: 700 }}>Start shopping</Link></div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {orders.data.map(o => (
                <div key={o.id} className="card-dark" style={{ padding: '1.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.6rem', marginBottom: '1rem' }}>
                    <div><strong style={{ fontFamily: 'Sora,sans-serif' }}>{o.order_number}</strong><div style={{ fontSize: '.78rem', color: 'rgba(244,250,240,.45)' }}>{new Date(o.created_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })}</div></div>
                    <div style={{ textAlign: 'right' }}><strong>{kes(o.total)}</strong><div style={{ fontSize: '.78rem', color: o.payment_status === 'paid' ? '#9FD96A' : '#FBBF24' }}>{PAYMENT_LABEL[o.payment_status]} · {STATUS_LABEL[o.status]}</div></div>
                  </div>
                  <OrderTimeline order={o} />
                  <div style={{ marginTop: '1rem', fontSize: '.84rem', color: 'rgba(244,250,240,.6)' }}>{o.order_items.map(i => `${i.product_name} × ${i.quantity}`).join(', ')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={save} className="card-dark" style={{ padding: '1.5rem', display: 'grid', gap: '.8rem' }}>
          <h2 style={{ fontSize: '1.15rem', letterSpacing: '-.04em', margin: 0 }}>Delivery details</h2>
          <input className="field" name="full_name" placeholder="Full name" value={form.full_name} onChange={set} />
          <input className="field" name="phone" placeholder="Phone" value={form.phone} onChange={set} />
          <input className="field" name="address" placeholder="Address" value={form.address} onChange={set} />
          <input className="field" name="city" placeholder="Town / city" value={form.city} onChange={set} />
          <button className="btn-primary">Save</button>
          {msg && <span style={{ fontSize: '.82rem', color: msg === 'Saved' ? '#9FD96A' : '#FCA5A5' }}>{msg}</span>}
        </form>
      </div>
    </div>
  );
}
