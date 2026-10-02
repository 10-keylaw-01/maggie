import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageHead } from '../components/ui/Bits';

export default function Login() {
  const { signIn, signUp, user } = useAuth();
  const [params] = useSearchParams();
  const next = params.get('next') || '/account';
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [f, setF] = useState({ email: '', password: '', name: '', phone: '' });
  const [state, setState] = useState({ busy: false, error: '', info: '' });
  const set = e => setF(x => ({ ...x, [e.target.name]: e.target.value }));

  if (user) return <Navigate to={next} replace />;

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: '', info: '' });
    const { data, error } = mode === 'signin' ? await signIn(f.email, f.password) : await signUp(f.email, f.password, f.name, f.phone);
    if (error) return setState({ busy: false, error: error.message, info: '' });
    if (mode === 'signup' && !data.session) return setState({ busy: false, error: '', info: 'Check your email to confirm your account, then sign in.' });
    navigate(next, { replace: true });
  }

  return (
    <div style={{ background: 'var(--bg-ink)', minHeight: '100vh' }}>
      <PageHead eyebrow="Account" title={mode === 'signin' ? 'Welcome back' : 'Create your account'} sub="Save your delivery details and see your order history." />
      <div className="container-x" style={{ maxWidth: 480, padding: '2.5rem 1.5rem 5rem' }}>
        <form onSubmit={submit} className="card-dark" style={{ padding: '1.8rem', display: 'grid', gap: '.9rem' }}>
          {mode === 'signup' && <>
            <input className="field" name="name" required placeholder="Full name" value={f.name} onChange={set} />
            <input className="field" name="phone" type="tel" placeholder="Phone (07…)" value={f.phone} onChange={set} />
          </>}
          <input className="field" name="email" type="email" required placeholder="Email" value={f.email} onChange={set} autoComplete="email" />
          <input className="field" name="password" type="password" required minLength={6} placeholder="Password (min 6 characters)" value={f.password} onChange={set} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
          {state.error && <div style={{ color: '#FCA5A5', fontSize: '.86rem' }}>{state.error}</div>}
          {state.info && <div style={{ color: '#9FD96A', fontSize: '.86rem' }}>{state.info}</div>}
          <button className="btn-primary" disabled={state.busy}>{state.busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
          <button type="button" onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setState({ busy: false, error: '', info: '' }); }}
            style={{ background: 'none', border: 0, color: '#9FD96A', fontWeight: 700, cursor: 'pointer', fontSize: '.86rem' }}>
            {mode === 'signin' ? "New here? Create an account" : 'Already have an account? Sign in'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.4rem', fontSize: '.84rem' }}><Link to="/track" style={{ color: 'rgba(244,250,240,.55)' }}>Just want to track an order? No account needed.</Link></p>
      </div>
    </div>
  );
}
