import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAsync } from '../hooks/useAsync';
import { kes, STATUS_LABEL } from '../lib/format';
import { Tag } from './CrudPage';

async function load() {
  const [stats, orders, low] = await Promise.all([
    supabase.rpc('admin_dashboard_stats'),
    supabase.from('orders').select('id,order_number,customer_name,total,status,payment_status,created_at').order('created_at', { ascending: false }).limit(8),
    supabase.from('products').select('id,name,stock_qty').eq('is_active', true).lte('stock_qty', 10).order('stock_qty').limit(8),
  ]);
  const err = stats.error || orders.error || low.error;
  if (err) throw err;
  return { stats: stats.data, orders: orders.data, low: low.data };
}

export default function Dashboard() {
  const { data, loading, error } = useAsync(load, []);
  if (loading) return <p>Loading…</p>;
  if (error) return <div className="adm-err">{error.message}</div>;
  const { stats: s, orders, low } = data;
  const cards = [
    ['Revenue (paid)', kes(s.revenue)], ['Last 30 days', kes(s.revenue_30d)],
    ['Open orders', s.open_orders], ['Prescriptions to review', s.rx_waiting, s.rx_waiting > 0, '/admin/orders'],
    ['Customers', s.customers], ['Active products', `${s.active_products} / ${s.products}`],
    ['Low / out of stock', s.low_stock, s.low_stock > 0, '/admin/products'], ['Unread messages', s.unread_messages, s.unread_messages > 0, '/admin/messages'],
  ];
  return (
    <>
      <div className="adm-top"><div><h1>Dashboard</h1><p>How the pharmacy is doing right now.</p></div></div>
      <div className="adm-stats">
        {cards.map(([label, value, warn, to]) => {
          const inner = <div className={`adm-card adm-stat ${warn ? 'warn' : ''}`}><small>{label}</small><b>{value}</b></div>;
          return to ? <Link key={label} to={to}>{inner}</Link> : <div key={label}>{inner}</div>;
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '1.2rem' }}>
        <div className="adm-card">
          <div className="adm-toolbar"><b>Recent orders</b><Link to="/admin/orders" style={{ marginLeft: 'auto', color: 'var(--g2)', fontWeight: 700 }}>View all</Link></div>
          <div className="adm-table-wrap"><table><tbody>
            {orders.map(o => <tr key={o.id}><td><b>{o.order_number}</b><div style={{ color: 'var(--mut)', fontSize: '.76rem' }}>{o.customer_name}</div></td><td>{kes(o.total)}</td><td><Tag tone={o.payment_status === 'paid' ? 'green' : 'amber'}>{o.payment_status}</Tag></td><td><Tag>{STATUS_LABEL[o.status]}</Tag></td></tr>)}
          </tbody></table>{orders.length === 0 && <div className="adm-empty">No orders yet.</div>}</div>
        </div>
        <div className="adm-card">
          <div className="adm-toolbar"><b>Stock to reorder</b><Link to="/admin/products" style={{ marginLeft: 'auto', color: 'var(--g2)', fontWeight: 700 }}>Manage</Link></div>
          <div className="adm-table-wrap"><table><tbody>
            {low.map(p => <tr key={p.id}><td><b>{p.name}</b></td><td style={{ textAlign: 'right' }}><Tag tone={p.stock_qty === 0 ? 'red' : 'amber'}>{p.stock_qty === 0 ? 'Out of stock' : `${p.stock_qty} left`}</Tag></td></tr>)}
          </tbody></table>{low.length === 0 && <div className="adm-empty">All products are well stocked.</div>}</div>
        </div>
      </div>
    </>
  );
}
