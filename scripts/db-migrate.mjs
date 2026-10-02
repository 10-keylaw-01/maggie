// Applies supabase/migrations/*.sql in order over the Supabase pooler connection.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { loadSecrets } from './_env.mjs';

const env = loadSecrets();
if (!env.DB_PASSWORD) {
  console.error('Set DB_PASSWORD in supabase/.env.secrets (Supabase dashboard > Project Settings > Database).');
  process.exit(1);
}
const dir = fileURLToPath(new URL('../supabase/migrations/', import.meta.url));
const client = new pg.Client({
  host: env.DB_HOST, port: Number(env.DB_PORT), database: env.DB_NAME,
  user: env.DB_USER, password: env.DB_PASSWORD, ssl: { rejectUnauthorized: false },
});
await client.connect();
try {
  for (const f of readdirSync(dir).filter(f => f.endsWith('.sql')).sort()) {
    process.stdout.write(`Applying ${f} ... `);
    await client.query(readFileSync(dir + f, 'utf8'));
    console.log('ok');
  }
} finally {
  await client.end();
}
