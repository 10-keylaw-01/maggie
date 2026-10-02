// Config for the simple CRUD screens (products, categories, promotions, services, FAQs, team, customers, messages)
import CrudPage, { Tag } from './CrudPage';
import { supabase } from '../lib/supabase';
import { kes } from '../lib/format';

const yesNo = v => (v ? <Tag tone="green">Active</Tag> : <Tag>Hidden</Tag>);
const ICON_HELP = 'Iconify name, e.g. solar:pills-3-linear (browse icon-sets.iconify.design/?query=solar)';

let categoryOptions = [];
const loadCategories = async () => {
  const { data } = await supabase.from('categories').select('id,name').order('sort_order');
  categoryOptions = (data || []).map(c => ({ value: c.id, label: c.name }));
};

export function ProductsPage() {
  return <CrudPage title="Products" subtitle="Everything customers can buy. Stock is deducted automatically when orders are placed."
    table="products" searchKeys={['name', 'generic_name', 'brand']} createLabel="Add product"
    orderBy={{ column: 'id', ascending: true }}
    enrich={async rows => { await loadCategories(); return rows; }}
    filters={{ label: 'All stock levels', options: [{ value: 'low', label: 'Low stock (≤10)' }, { value: 'out', label: 'Out of stock' }, { value: 'rx', label: 'Prescription only' }, { value: 'hidden', label: 'Hidden' }],
      test: f => r => f === 'low' ? r.stock_qty > 0 && r.stock_qty <= 10 : f === 'out' ? r.stock_qty === 0 : f === 'rx' ? r.requires_prescription : !r.is_active }}
    defaults={{ is_active: true, stock_qty: 0, price: 0 }}
    columns={[
      { key: 'image_url', label: '', render: r => r.image_url ? <img className="adm-thumb" src={r.image_url} alt="" /> : <div className="adm-thumb" /> },
      { key: 'name', label: 'Product', render: r => <div><b>{r.name}</b><div style={{ color: 'var(--mut)', fontSize: '.78rem' }}>{[r.strength, r.dosage_form, r.pack_size].filter(Boolean).join(' · ')}</div></div> },
      { key: 'category_id', label: 'Category', render: r => categoryOptions.find(c => c.value === r.category_id)?.label || r.category_id || '—' },
      { key: 'price', label: 'Price', render: r => <>{kes(r.price)}{r.compare_at_price && <div style={{ color: 'var(--mut)', fontSize: '.76rem', textDecoration: 'line-through' }}>{kes(r.compare_at_price)}</div>}</> },
      { key: 'stock_qty', label: 'Stock', render: r => <Tag tone={r.stock_qty === 0 ? 'red' : r.stock_qty <= 10 ? 'amber' : 'green'}>{r.stock_qty}</Tag> },
      { key: 'requires_prescription', label: 'Rx', render: r => r.requires_prescription ? <Tag tone="amber">Rx only</Tag> : '—' },
      { key: 'is_active', label: 'Status', render: r => yesNo(r.is_active) },
    ]}
    fields={[
      { name: 'name', label: 'Product name', required: true, span2: true },
      { name: 'category_id', label: 'Category', type: 'select', get options() { return categoryOptions; } },
      { name: 'badge', label: 'Badge', help: 'e.g. Best Seller, New, Sale' },
      { name: 'generic_name', label: 'Active ingredient (generic name)' },
      { name: 'brand', label: 'Brand / manufacturer' },
      { name: 'dosage_form', label: 'Dosage form', help: 'Tablet, capsule, syrup, cream…' },
      { name: 'strength', label: 'Strength', help: 'e.g. 500 mg' },
      { name: 'pack_size', label: 'Pack size', help: 'e.g. 20 tablets' },
      { name: 'price', label: 'Price (KES)', type: 'number', required: true, min: 0 },
      { name: 'compare_at_price', label: 'Original price (KES)', type: 'number', min: 0, help: 'Optional. Shown struck through with a % discount.' },
      { name: 'stock_qty', label: 'Stock quantity', type: 'number', required: true, min: 0, step: 1 },
      { name: 'requires_prescription', label: 'Prescription', type: 'checkbox', checkLabel: 'Prescription-only medicine' },
      { name: 'image_url', label: 'Image', type: 'image' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'details', label: 'Key facts (one per line)', type: 'lines' },
      { name: 'is_featured', label: 'Homepage', type: 'checkbox', checkLabel: 'Feature on the homepage' },
      { name: 'is_active', label: 'Visibility', type: 'checkbox', checkLabel: 'Visible in the shop' },
    ]} />;
}

export function CategoriesPage() {
  return <CrudPage title="Categories" subtitle="Shown as cards on the homepage and as shop filters." table="categories" searchKeys={['name', 'id']}
    orderBy={{ column: 'sort_order', ascending: true }} createLabel="Add category" defaults={{ is_active: true, sort_order: 0, icon: 'solar:pills-linear' }}
    columns={[{ key: 'sort_order', label: '#' }, { key: 'name', label: 'Name', render: r => <b>{r.name}</b> }, { key: 'id', label: 'Slug' }, { key: 'is_active', label: 'Status', render: r => yesNo(r.is_active) }]}
    fields={[
      { name: 'id', label: 'Slug', required: true, createOnly: true, help: 'Lowercase letters and dashes, e.g. cold-flu. Cannot be changed later.' },
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon', help: ICON_HELP },
      { name: 'sort_order', label: 'Order', type: 'number', step: 1 },
      { name: 'is_active', label: 'Visibility', type: 'checkbox', checkLabel: 'Visible' },
    ]} />;
}

export function PromotionsPage() {
  return <CrudPage title="Ad cards" subtitle="Advertisement cards on the homepage, shop page and hero. Use start/end dates to schedule campaigns." table="promotions" searchKeys={['title', 'badge_text']}
    orderBy={{ column: 'placement', ascending: true }} createLabel="Add ad card" defaults={{ is_active: true, placement: 'home_card', theme: 'green', sort_order: 0, cta_label: 'Shop now', cta_link: '/shop', icon: 'solar:tag-linear' }}
    columns={[
      { key: 'title', label: 'Title', render: r => <div><b>{r.title}</b><div style={{ color: 'var(--mut)', fontSize: '.78rem' }}>{r.subtitle}</div></div> },
      { key: 'placement', label: 'Placement', render: r => <Tag tone="blue">{{ hero: 'Hero panel', home_card: 'Homepage cards', shop_banner: 'Shop banner' }[r.placement]}</Tag> },
      { key: 'theme', label: 'Theme' },
      { key: 'ends_at', label: 'Runs', render: r => r.starts_at || r.ends_at ? `${r.starts_at ? new Date(r.starts_at).toLocaleDateString() : '…'} → ${r.ends_at ? new Date(r.ends_at).toLocaleDateString() : 'open'}` : 'Always' },
      { key: 'is_active', label: 'Status', render: r => yesNo(r.is_active) },
    ]}
    fields={[
      { name: 'title', label: 'Headline', required: true, span2: true },
      { name: 'subtitle', label: 'Supporting text', type: 'textarea', rows: 2 },
      { name: 'badge_text', label: 'Badge', help: 'Small label, e.g. Vitamins' },
      { name: 'placement', label: 'Where it appears', type: 'select', required: true, options: [{ value: 'hero', label: 'Hero panel (first one is used)' }, { value: 'home_card', label: 'Homepage ad cards' }, { value: 'shop_banner', label: 'Shop page banner' }] },
      { name: 'cta_label', label: 'Button text' },
      { name: 'cta_link', label: 'Button link', help: '/shop?cat=vitamins, /contact … or a full https:// URL' },
      { name: 'theme', label: 'Colour theme', type: 'select', required: true, options: ['green', 'dark', 'light', 'amber'] },
      { name: 'icon', label: 'Icon', help: ICON_HELP },
      { name: 'image_url', label: 'Background image (optional)', type: 'image' },
      { name: 'starts_at', label: 'Starts', type: 'datetime' },
      { name: 'ends_at', label: 'Ends', type: 'datetime' },
      { name: 'sort_order', label: 'Order', type: 'number', step: 1 },
      { name: 'is_active', label: 'Visibility', type: 'checkbox', checkLabel: 'Active' },
    ]} />;
}

export function ServicesPage() {
  return <CrudPage title="Services" subtitle="Cards in the “Our services” sections." table="services" searchKeys={['title', 'tag']}
    orderBy={{ column: 'sort_order', ascending: true }} createLabel="Add service" defaults={{ is_active: true, sort_order: 0, icon: 'solar:heart-pulse-linear' }}
    columns={[{ key: 'sort_order', label: '#' }, { key: 'title', label: 'Title', render: r => <b>{r.title}</b> }, { key: 'tag', label: 'Tag' }, { key: 'is_active', label: 'Status', render: r => yesNo(r.is_active) }]}
    fields={[
      { name: 'title', label: 'Title', required: true }, { name: 'tag', label: 'Tag' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon', help: ICON_HELP }, { name: 'link', label: 'Link', help: 'Internal path like /shop' },
      { name: 'sort_order', label: 'Order', type: 'number', step: 1 },
      { name: 'is_active', label: 'Visibility', type: 'checkbox', checkLabel: 'Visible' },
    ]} />;
}

export function FaqsPage() {
  return <CrudPage title="FAQs" subtitle="Shown on the Contact page and the homepage." table="faqs" searchKeys={['question', 'answer']}
    orderBy={{ column: 'sort_order', ascending: true }} createLabel="Add FAQ" defaults={{ is_active: true, sort_order: 0 }}
    columns={[{ key: 'sort_order', label: '#' }, { key: 'question', label: 'Question', render: r => <b>{r.question}</b> }, { key: 'is_active', label: 'Status', render: r => yesNo(r.is_active) }]}
    fields={[
      { name: 'question', label: 'Question', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true, rows: 5 },
      { name: 'sort_order', label: 'Order', type: 'number', step: 1 },
      { name: 'is_active', label: 'Visibility', type: 'checkbox', checkLabel: 'Visible' },
    ]} />;
}

export function TeamPage() {
  return <CrudPage title="Team" subtitle="Shown on the About page. The section stays hidden while this list is empty." table="team_members" searchKeys={['name', 'role']}
    orderBy={{ column: 'sort_order', ascending: true }} createLabel="Add team member" defaults={{ is_active: true, sort_order: 0 }}
    columns={[{ key: 'photo_url', label: '', render: r => r.photo_url ? <img className="adm-thumb" style={{ borderRadius: 99 }} src={r.photo_url} alt="" /> : <div className="adm-thumb" style={{ borderRadius: 99 }} /> }, { key: 'name', label: 'Name', render: r => <b>{r.name}</b> }, { key: 'role', label: 'Role' }, { key: 'is_active', label: 'Status', render: r => yesNo(r.is_active) }]}
    fields={[
      { name: 'name', label: 'Name', required: true }, { name: 'role', label: 'Role', help: 'e.g. Pharmacist-in-charge' },
      { name: 'bio', label: 'Short bio', type: 'textarea' }, { name: 'photo_url', label: 'Photo', type: 'image' },
      { name: 'sort_order', label: 'Order', type: 'number', step: 1 },
      { name: 'is_active', label: 'Visibility', type: 'checkbox', checkLabel: 'Visible' },
    ]} />;
}

// Customers: profiles + order totals
const enrichCustomers = async profiles => {
  const { data: orders } = await supabase.from('orders').select('user_id,total,payment_status').not('user_id', 'is', null);
  const agg = {};
  (orders || []).forEach(o => { const a = agg[o.user_id] ||= { n: 0, spent: 0 }; a.n++; if (o.payment_status === 'paid') a.spent += Number(o.total); });
  return profiles.map(p => ({ ...p, orders_count: agg[p.id]?.n || 0, spent: agg[p.id]?.spent || 0 }));
};
export function CustomersPage() {
  return <CrudPage title="Customers" subtitle="Everyone with an account. Promote a trusted team member to Admin to give them access to this panel."
    table="profiles" searchKeys={['full_name', 'email', 'phone']} canCreate={false} canDelete={false}
    orderBy={{ column: 'created_at', ascending: false }} enrich={enrichCustomers}
    columns={[
      { key: 'full_name', label: 'Customer', render: r => <div><b>{r.full_name || '—'}</b><div style={{ color: 'var(--mut)', fontSize: '.78rem' }}>{r.email}</div></div> },
      { key: 'phone', label: 'Phone' }, { key: 'city', label: 'City' },
      { key: 'orders_count', label: 'Orders' }, { key: 'spent', label: 'Paid total', render: r => kes(r.spent) },
      { key: 'role', label: 'Role', render: r => <Tag tone={r.role === 'admin' ? 'amber' : ''}>{r.role}</Tag> },
      { key: 'created_at', label: 'Joined', render: r => new Date(r.created_at).toLocaleDateString() },
    ]}
    fields={[
      { name: 'email', label: 'Email', type: 'readonly' },
      { name: 'full_name', label: 'Full name' }, { name: 'phone', label: 'Phone' },
      { name: 'address', label: 'Address' }, { name: 'city', label: 'City' },
      { name: 'role', label: 'Role', type: 'select', required: true, options: ['customer', 'admin'], help: 'Admins can manage everything in this panel.' },
    ]} />;
}

export function MessagesPage() {
  return <CrudPage title="Messages" subtitle="Questions sent from the Contact page." table="contact_messages" searchKeys={['name', 'email', 'message', 'topic']}
    canCreate={false} orderBy={{ column: 'created_at', ascending: false }}
    filters={{ label: 'All statuses', options: ['new', 'read', 'resolved'], test: f => r => r.status === f }}
    columns={[
      { key: 'created_at', label: 'Received', render: r => new Date(r.created_at).toLocaleString() },
      { key: 'name', label: 'From', render: r => <div><b>{r.name}</b><div style={{ color: 'var(--mut)', fontSize: '.78rem' }}>{[r.email, r.phone].filter(Boolean).join(' · ')}</div></div> },
      { key: 'topic', label: 'Topic' },
      { key: 'message', label: 'Message', render: r => <div style={{ maxWidth: 380, whiteSpace: 'pre-wrap' }}>{r.message.length > 140 ? r.message.slice(0, 140) + '…' : r.message}</div> },
      { key: 'status', label: 'Status', render: r => <Tag tone={r.status === 'new' ? 'amber' : r.status === 'resolved' ? 'green' : ''}>{r.status}</Tag> },
    ]}
    fields={[
      { name: 'name', label: 'Name', type: 'readonly' }, { name: 'topic', label: 'Topic', type: 'readonly' },
      { name: 'email', label: 'Email', type: 'readonly' }, { name: 'phone', label: 'Phone', type: 'readonly' },
      { name: 'message', label: 'Message', type: 'readonly', rows: 6 },
      { name: 'status', label: 'Status', type: 'select', required: true, options: ['new', 'read', 'resolved'] },
    ]} />;
}
