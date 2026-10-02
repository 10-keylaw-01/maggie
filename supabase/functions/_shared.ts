import { createClient } from 'npm:@supabase/supabase-js@2';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

// Service-role client: bypasses RLS, so it only ever runs server-side inside edge functions.
export const admin = () =>
  createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SB_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

export const darajaBase = () =>
  Deno.env.get('MPESA_ENV') === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

// 07XXXXXXXX / 01XXXXXXXX / +2547XXXXXXXX / 2547XXXXXXXX  ->  2547XXXXXXXX
export function normalisePhone(raw: string): string | null {
  const d = (raw || '').replace(/\D/g, '');
  const n = d.startsWith('254') ? d.slice(3) : d.startsWith('0') ? d.slice(1) : d;
  return /^(7|1)\d{8}$/.test(n) ? '254' + n : null;
}
