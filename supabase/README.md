# Supabase setup

1. **Schema + seed** – run `supabase/migrations/0001_schema.sql` then `0002_seed.sql` in the
   Supabase SQL Editor, or `npm run db:migrate` after putting `DB_PASSWORD` in `supabase/.env.secrets`.
2. **First admin** – sign up on the site, then `npm run make-admin -- you@example.com`
   (or `npm run create-admin -- you@example.com 'StrongPassword'` to create the account directly).
3. **M-Pesa (Daraja)** – install the Supabase CLI, `supabase login`, then:
   ```
   supabase link --project-ref rgffdzyiwqmlyvbazxuc
   supabase secrets set --env-file supabase/.env.secrets
   supabase functions deploy mpesa-stk-push --no-verify-jwt
   supabase functions deploy mpesa-callback --no-verify-jwt
   ```
   Defaults to the Daraja **sandbox** (shortcode 174379). For live payments set `MPESA_ENV=production`
   and your own `MPESA_SHORTCODE` / `MPESA_PASSKEY`, then re-run `secrets set`.

`supabase/.env.secrets` holds server-side secrets and is git-ignored. Never import it from `src/`.
