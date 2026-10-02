import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const [profile, setProfile] = useState(undefined); // undefined = not fetched yet, null = no profile row

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const uid = session?.user?.id;
  useEffect(() => {
    if (!uid) { setProfile(null); return; }
    let live = true;
    setProfile(undefined);
    supabase.from('profiles').select('*').eq('id', uid).maybeSingle().then(({ data }) => live && setProfile(data));
    return () => { live = false; };
  }, [uid]);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading: session === undefined || (!!uid && profile === undefined),
    isAdmin: profile?.role === 'admin',
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, full_name, phone) =>
      supabase.auth.signUp({ email, password, options: { data: { full_name, phone } } }),
    signOut: () => supabase.auth.signOut(),
    refreshProfile: async () => {
      if (!uid) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
      setProfile(data);
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
