#!/bin/sh
# Run by the Supabase project owner from the project root:  sh supabase/deploy-functions.sh
# Needs the Supabase CLI (brew install supabase/tap/supabase) and supabase/.env.secrets.
set -e
REF=rgffdzyiwqmlyvbazxuc
supabase login
supabase secrets set --env-file supabase/.env.secrets --project-ref $REF
supabase functions deploy mpesa-stk-push --no-verify-jwt --project-ref $REF
supabase functions deploy mpesa-callback --no-verify-jwt --project-ref $REF
echo "Done. Callback URL: https://$REF.supabase.co/functions/v1/mpesa-callback"
