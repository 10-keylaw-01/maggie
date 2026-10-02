// npm run create-admin -- email password   -> creates a confirmed auth user with the admin role
// npm run make-admin   -- email            -> promotes an existing (signed-up) user
import { createClient } from '@supabase/supabase-js';
import { loadSecrets } from './_env.mjs';

const [mode, email, password] = process.argv.slice(2);
if (!['create', 'promote'].includes(mode) || !email || (mode === 'create' && !password)) {
  console.error('Usage: admin-user.mjs create <email> <password> | promote <email>');
  process.exit(1);
}
const env = loadSecrets();
const sb = createClient(env.SUPABASE_URL, env.SB_SECRET_KEY, { auth: { persistSession: false } });

let id;
if (mode === 'create') {
  const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: 'Admin' } });
  if (error) { console.error(error.message); process.exit(1); }
  id = data.user.id;
} else {
  const { data, error } = await sb.from('profiles').select('id').eq('email', email).maybeSingle();
  if (error || !data) { console.error(error?.message || `No signed-up user with email ${email}`); process.exit(1); }
  id = data.id;
}
const { error } = await sb.from('profiles').update({ role: 'admin' }).eq('id', id);
if (error) { console.error(error.message); process.exit(1); }
console.log(`${email} is now an admin (${id})`);
