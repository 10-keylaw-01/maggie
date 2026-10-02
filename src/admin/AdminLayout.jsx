import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';
import { Icon } from '../components/ui/Bits';
import './admin.css';

const NAV = [
  ['Overview', [['/admin', 'solar:chart-2-linear', 'Dashboard', true]]],
  ['Sales', [['/admin/orders', 'solar:bag-4-linear', 'Orders'], ['/admin/customers', 'solar:users-group-rounded-linear', 'Customers'], ['/admin/messages', 'solar:inbox-linear', 'Messages']]],
  ['Catalogue', [['/admin/products', 'solar:pills-3-linear', 'Products'], ['/admin/categories', 'solar:widget-4-linear', 'Categories']]],
  ['Website content', [['/admin/promotions', 'solar:tag-price-linear', 'Ad cards'], ['/admin/services', 'solar:heart-pulse-linear', 'Services'], ['/admin/faqs', 'solar:question-circle-linear', 'FAQs'], ['/admin/team', 'solar:user-id-linear', 'Team'], ['/admin/settings', 'solar:settings-linear', 'Site settings']]],
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { brand_name } = useSettings();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({});
  const loc = useLocation();

  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => {
    if (!isAdmin) return;
    supabase.rpc('admin_dashboard_stats').then(({ data }) => data && setCounts(data));
  }, [isAdmin, loc.pathname]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>;
  if (!user) return <Navigate to="/login?next=/admin" replace />;
  if (!isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', textAlign: 'center' }}>
      <div><h1 style={{ margin: 0 }}>Admins only</h1><p style={{ color: 'rgba(244,250,240,.6)' }}>Your account doesn't have access to the admin panel.</p>
        <Link to="/" className="btn-primary">Back to the store</Link></div>
    </div>
  );

  const badge = { '/admin/orders': counts.rx_waiting, '/admin/messages': counts.unread_messages };

  return (
    <div className="adm">
      <div className="adm-mobile-bar"><button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 0, color: '#fff' }} aria-label="Menu"><Icon name="solar:hamburger-menu-linear" size={24} /></button><strong>{brand_name} admin</strong></div>
      <aside className={`adm-side ${open ? 'open' : ''}`}>
        <div className="adm-brand"><i><Icon name="solar:health-bold" size={18} /></i>{brand_name}</div>
        {NAV.map(([group, links]) => (
          <div key={group}>
            <div className="adm-group">{group}</div>
            {links.map(([to, icon, label, end]) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `adm-link ${isActive ? 'active' : ''}`}>
                <Icon name={icon} size={18} />{label}{badge[to] > 0 && <span className="adm-badge">{badge[to]}</span>}
              </NavLink>
            ))}
          </div>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'grid', gap: '.2rem' }}>
          <Link to="/" className="adm-link"><Icon name="solar:shop-2-linear" size={18} />View storefront</Link>
          <button onClick={signOut} className="adm-link" style={{ background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit' }}><Icon name="solar:logout-2-linear" size={18} />Sign out</button>
        </div>
      </aside>
      <main className="adm-main"><Outlet /></main>
    </div>
  );
}
