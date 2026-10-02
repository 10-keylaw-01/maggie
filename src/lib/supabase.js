import { createClient } from '@supabase/supabase-js';

// Only the publishable (anon) key ever ships to the browser. Row level security protects the data.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
