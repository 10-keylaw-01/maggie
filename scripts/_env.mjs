import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Minimal .env loader for the git-ignored server-side secrets file.
export function loadSecrets() {
  const path = fileURLToPath(new URL('../supabase/.env.secrets', import.meta.url));
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}
