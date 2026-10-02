import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// key, label, type, help
const GROUPS = [
  ['Brand & homepage', [
    ['brand_name', 'Pharmacy name', 'text'], ['tagline', 'Tagline', 'text'],
    ['hero_title', 'Homepage headline', 'text'], ['hero_subtitle', 'Homepage sub-headline', 'textarea'],
  ]],
  ['Contact details', [
    ['phone', 'Phone', 'text', 'Hidden on the site while blank.'], ['whatsapp', 'WhatsApp number', 'text', 'Digits with country code, e.g. 2547…'],
    ['email', 'Email', 'text'], ['address', 'Physical address', 'text'], ['opening_hours', 'Opening hours', 'text', 'e.g. Mon–Sat 8am–8pm'],
    ['ppb_license', 'Pharmacy & Poisons Board licence no.', 'text', 'Shown in the footer once filled in.'],
  ]],
  ['Delivery, tax & payment', [
    ['delivery_fee', 'Delivery fee (KES)', 'number'], ['free_delivery_threshold', 'Free delivery above (KES)', 'number', '0 = never free'],
    ['tax_rate', 'VAT rate (%)', 'number', 'Most medicines are VAT-exempt; leave 0 unless your accountant says otherwise.'],
    ['delivery_eta', 'Delivery estimate', 'text', 'e.g. 1–3 business days'],
    ['cod_enabled', 'Allow pay on delivery', 'checkbox'],
  ]],
  ['About page', [
    ['about_title', 'Headline', 'text'], ['about_intro', 'Intro', 'textarea'],
    ['about_mission_title', 'Approach heading', 'text'], ['about_mission_body', 'Approach text', 'textarea'],
    ['about_points', 'Highlights (one per line)', 'lines'],
    ['about_stats', 'Stat tiles (one per line: value | label)', 'stats', 'e.g. M-Pesa | Secure mobile payments'],
  ]],
];

const toForm = (type, v) => type === 'lines' ? (Array.isArray(v) ? v.join('\n') : '')
  : type === 'stats' ? (Array.isArray(v) ? v.map(s => `${s.value} | ${s.label}`).join('\n') : '')
  : type === 'checkbox' ? v === true : (v ?? '');
const fromForm = (type, v) => type === 'lines' ? v.split('\n').map(x => x.trim()).filter(Boolean)
  : type === 'stats' ? v.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const [value, ...rest] = l.split('|'); return { value: value.trim(), label: rest.join('|').trim() }; })
  : type === 'number' ? Number(v || 0) : v;

export default function Settings() {
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data, error }) => {
      if (error) return setMsg({ type: 'err', text: error.message });
      const map = Object.fromEntries(data.map(r => [r.key, r.value]));
      const f = {};
      GROUPS.forEach(([, items]) => items.forEach(([k, , type]) => { f[k] = toForm(type, map[k]); }));
      setForm(f);
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true); setMsg({ type: '', text: '' });
    const rows = GROUPS.flatMap(([, items]) => items.map(([k, , type]) => ({ key: k, value: fromForm(type, form[k]) })));
    const { error } = await supabase.from('site_settings').upsert(rows);
    setBusy(false);
    setMsg(error ? { type: 'err', text: error.message } : { type: 'ok', text: 'Settings saved. The storefront picks them up on the next page load.' });
  }

  if (!form) return <p>Loading…</p>;
  return (
    <form onSubmit={save}>
      <div className="adm-top"><div><h1>Site settings</h1><p>Text, contact details and delivery rules used across the storefront and at checkout.</p></div>
        <button className="adm-btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button></div>
      {msg.text && <div className={msg.type === 'ok' ? 'adm-ok' : 'adm-err'}>{msg.text}</div>}
      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {GROUPS.map(([group, items]) => (
          <div key={group} className="adm-card adm-pad">
            <h3 style={{ margin: '0 0 1rem', fontFamily: 'Sora,sans-serif', letterSpacing: '-.03em' }}>{group}</h3>
            <div className="adm-form">
              {items.map(([k, label, type, help]) => (
                <div key={k} className={type === 'textarea' || type === 'lines' || type === 'stats' ? 'span2' : ''}>
                  <label className="f" htmlFor={k}>{label}</label>
                  {type === 'checkbox' ? <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontWeight: 600 }}><input id={k} type="checkbox" checked={!!form[k]} onChange={e => setForm({ ...form, [k]: e.target.checked })} /> Enabled</label>
                    : type === 'textarea' || type === 'lines' || type === 'stats' ? <textarea id={k} rows={type === 'textarea' ? 3 : 4} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
                    : <input id={k} className="adm-in" type={type} step="any" min={type === 'number' ? 0 : undefined} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />}
                  {help && <div className="help">{help}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
