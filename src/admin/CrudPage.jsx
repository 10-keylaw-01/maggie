import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Icon } from '../components/ui/Bits';

/**
 * Config-driven list + create/edit/delete screen for one table.
 * fields: [{ name, label, type: text|textarea|number|select|checkbox|image|lines|datetime|readonly, options, required, help, span2, createOnly }]
 * columns: [{ key, label, render?(row) }]
 */
export function Tag({ children, tone = '' }) { return <span className={`adm-tag ${tone}`}>{children}</span>; }

const toLocal = iso => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');

function initialForm(fields, row, defaults) {
  const f = {};
  for (const fd of fields) {
    const v = row ? row[fd.name] : defaults?.[fd.name];
    if (fd.type === 'lines') f[fd.name] = Array.isArray(v) ? v.join('\n') : '';
    else if (fd.type === 'datetime') f[fd.name] = toLocal(v);
    else if (fd.type === 'checkbox') f[fd.name] = v ?? false;
    else f[fd.name] = v ?? '';
  }
  return f;
}

function buildPayload(fields, form) {
  const out = {};
  for (const fd of fields) {
    if (fd.type === 'readonly') continue;
    const v = form[fd.name];
    if (fd.type === 'number') out[fd.name] = v === '' || v == null ? null : Number(v);
    else if (fd.type === 'lines') out[fd.name] = String(v).split('\n').map(x => x.trim()).filter(Boolean);
    else if (fd.type === 'datetime') out[fd.name] = v ? new Date(v).toISOString() : null;
    else if (fd.type === 'checkbox') out[fd.name] = !!v;
    else out[fd.name] = typeof v === 'string' ? (v.trim() === '' && !fd.required ? null : v.trim()) : v;
  }
  return out;
}

async function uploadImage(file, folder) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
}

function FieldInput({ fd, value, onChange, folder, editing }) {
  const [up, setUp] = useState(false);
  const [err, setErr] = useState('');
  const ro = fd.type === 'readonly' || (fd.createOnly && editing);
  const common = { id: fd.name, className: 'adm-in', value: value ?? '', readOnly: ro, required: fd.required, onChange: e => onChange(e.target.value) };
  if (fd.type === 'textarea' || fd.type === 'lines') return <textarea {...common} rows={fd.rows || (fd.type === 'lines' ? 5 : 3)} />;
  if (fd.type === 'number') return <input {...common} type="number" step={fd.step || 'any'} min={fd.min} />;
  if (fd.type === 'datetime') return <input {...common} type="datetime-local" />;
  if (fd.type === 'select') return <select {...common} disabled={ro}>{!fd.required && <option value="">—</option>}{fd.options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select>;
  if (fd.type === 'checkbox') return <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontWeight: 600 }}><input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} /> {fd.checkLabel || 'Yes'}</label>;
  if (fd.type === 'image') return (
    <div>
      <div style={{ display: 'flex', gap: '.7rem', alignItems: 'center' }}>
        {value && <img src={value} alt="" className="adm-thumb" />}
        <input {...common} placeholder="https://… or upload" />
      </div>
      <input type="file" accept="image/jpeg,image/png,image/webp" style={{ marginTop: '.5rem' }} disabled={up}
        onChange={async e => { const file = e.target.files?.[0]; if (!file) return; setUp(true); setErr(''); try { onChange(await uploadImage(file, folder)); } catch (x) { setErr(x.message); } setUp(false); }} />
      {up && <div className="help">Uploading…</div>}{err && <div className="help" style={{ color: '#B91C1C' }}>{err}</div>}
    </div>
  );
  return <input {...common} type="text" />;
}

export default function CrudPage({ title, subtitle, table, columns, fields, defaults, orderBy = { column: 'id', ascending: true }, searchKeys = ['name'], select = '*', canCreate = true, canDelete = true, createLabel = 'Add new', enrich, filters }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null); // null | { row?: object }
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.from(table).select(select).order(orderBy.column, { ascending: orderBy.ascending });
    if (e) { setError(e.message); setRows([]); return; }
    setError('');
    setRows(enrich ? await enrich(data) : data);
  }, [table, select, orderBy.column, orderBy.ascending, enrich]);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => {
    let l = rows || [];
    if (filter && filters) l = l.filter(filters.test(filter));
    if (search) { const q = search.toLowerCase(); l = l.filter(r => searchKeys.some(k => String(r[k] ?? '').toLowerCase().includes(q))); }
    return l;
  }, [rows, search, filter, filters, searchKeys]);

  function open(row) { setForm(initialForm(fields, row, defaults)); setFormError(''); setEditing({ row }); }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setFormError('');
    const payload = buildPayload(fields, form);
    const row = editing.row;
    const idField = fields.find(f => f.createOnly && f.name === 'id');
    const q = row
      ? supabase.from(table).update(payload).eq('id', row.id)
      : supabase.from(table).insert(idField ? { ...payload, id: form.id } : payload);
    const { error: err } = await q;
    setSaving(false);
    if (err) return setFormError(err.message);
    setEditing(null); load();
  }

  async function remove(row) {
    if (!window.confirm(`Delete "${row.name || row.title || row.question || row.id}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from(table).delete().eq('id', row.id);
    if (err) setError(err.code === '23503' ? 'This item is used elsewhere and cannot be deleted. Deactivate it instead.' : err.message);
    else load();
  }

  return (
    <>
      <div className="adm-top">
        <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
        {canCreate && <button className="adm-btn primary" onClick={() => open(null)}><Icon name="solar:add-circle-linear" size={17} />{createLabel}</button>}
      </div>
      {error && <div className="adm-err">{error}</div>}
      <div className="adm-card">
        <div className="adm-toolbar">
          <input className="adm-in" style={{ maxWidth: 300 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          {filters && <select style={{ maxWidth: 220 }} value={filter} onChange={e => setFilter(e.target.value)}><option value="">{filters.label}</option>{filters.options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select>}
          <span style={{ marginLeft: 'auto', color: 'var(--mut)' }}>{rows ? `${shown.length} item${shown.length === 1 ? '' : 's'}` : 'Loading…'}</span>
        </div>
        <div className="adm-table-wrap">
          <table>
            <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th></th></tr></thead>
            <tbody>
              {shown.map(r => (
                <tr key={r.id}>
                  {columns.map(c => <td key={c.key}>{c.render ? c.render(r) : (r[c.key] ?? '—')}</td>)}
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <button className="adm-btn sm" onClick={() => open(r)}>Edit</button>{' '}
                    {canDelete && <button className="adm-btn sm danger" onClick={() => remove(r)} aria-label="Delete"><Icon name="solar:trash-bin-minimalistic-linear" size={15} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows && shown.length === 0 && <div className="adm-empty">Nothing here yet.</div>}
        </div>
      </div>

      {editing && (
        <div className="adm-modal-bg" onMouseDown={e => e.target === e.currentTarget && setEditing(null)}>
          <form className="adm-modal" onSubmit={save}>
            <h2 style={{ margin: '0 0 1.2rem', fontFamily: 'Sora,sans-serif', letterSpacing: '-.04em' }}>{editing.row ? 'Edit' : 'New'} {title.toLowerCase().replace(/s$/, '')}</h2>
            {formError && <div className="adm-err">{formError}</div>}
            <div className="adm-form">
              {fields.map(fd => (
                <div key={fd.name} className={fd.span2 || fd.type === 'textarea' || fd.type === 'lines' || fd.type === 'image' ? 'span2' : ''}>
                  {fd.type !== 'checkbox' && <label className="f" htmlFor={fd.name}>{fd.label}{fd.required && ' *'}</label>}
                  {fd.type === 'checkbox' && <label className="f">{fd.label}</label>}
                  <FieldInput fd={fd} value={form[fd.name]} onChange={v => setForm(f => ({ ...f, [fd.name]: v }))} folder={table} editing={!!editing.row} />
                  {fd.help && <div className="help">{fd.help}</div>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.7rem', marginTop: '1.4rem' }}>
              <button type="button" className="adm-btn" onClick={() => setEditing(null)}>Cancel</button>
              <button className="adm-btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
