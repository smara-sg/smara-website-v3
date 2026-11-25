import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { getAuthClient, safeReturnPath } from '../auth/client';
import { useAuth } from '../auth/context';
import Footer from './Footer';

export default function AccountPage() {
  const auth = useAuth();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const destination = safeReturnPath(params.get('next'));
  const callback = () => `${window.location.origin}/account/?next=${encodeURIComponent(destination)}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    setBusy(true); setMessage(''); setFailed(false);
    try {
      const { client } = await getAuthClient();
      if (auth.recovery) {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        window.location.assign('/account/');
      } else if (mode === 'signup') {
        const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: callback(), data: { display_name: String(data.get('name') ?? '').trim().slice(0, 80) } } });
        if (error) throw error;
        setMessage('Check your email to confirm your account. If you already have an account, sign in instead.');
      } else if (mode === 'reset') {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: callback() });
        if (error) throw error;
        setMessage('If an account exists for this email, you’ll receive a password reset link.');
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('You’re signed in. Your filters are ready.');
      }
    } catch {
      setFailed(true);
      setMessage(mode === 'login' ? 'We couldn’t sign you in. Check your email and password, and confirm your email if you just registered.' : 'We couldn’t complete that request. Please try again shortly.');
    } finally { setBusy(false); }
  }

  async function social(provider: 'google' | 'facebook') {
    setBusy(true); setMessage(''); setFailed(false);
    try {
      const { client } = await getAuthClient();
      const { error } = await client.auth.signInWithOAuth({ provider, options: { redirectTo: callback() } });
      if (error) throw error;
    } catch { setFailed(true); setMessage('We couldn’t open that sign-in option. Please try email instead.'); setBusy(false); }
  }

  const disabled = busy || auth.loading || !auth.available;
  const title = auth.recovery ? 'Choose a new password' : auth.user ? 'Your SMARA account' : mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back';
  return <div className="min-h-screen bg-white">
    <main className="mx-auto max-w-md px-6 pb-24 pt-16 sm:pt-24">
      <div className="mb-9 text-center">
        <LockKeyhole size={28} strokeWidth={1.4} className="mx-auto mb-5 text-accent" />
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-3 text-mute">A little art. Your own moment of calm.</p>
      </div>
      {auth.loading && <p role="status" className="mb-5 text-center text-mute">Checking your account…</p>}
      {auth.notice && <p role="status" className="mb-6 rounded-2xl bg-mist p-4 text-sm text-ink">{auth.notice}</p>}
      {auth.user && !auth.recovery ? <div className="space-y-5 rounded-3xl bg-mist p-7">
        <p className="break-words text-mute">Signed in as {auth.user.email}</p>
        <Link to={destination} className="btn-primary w-full">My filters <ArrowRight size={18} /></Link>
        <button onClick={() => { void auth.signOut().catch(() => setMessage('Please try signing out again.')); }} className="min-h-12 w-full text-sm text-ink underline underline-offset-4">Sign out</button>
      </div> : <>
        {!auth.recovery && mode !== 'reset' && <>
          <div className="flex rounded-2xl bg-mist p-1" aria-label="Account options">
            {(['login', 'signup'] as const).map(option => <button key={option} type="button" aria-pressed={mode === option} onClick={() => { setMode(option); setMessage(''); }} className={`min-h-12 flex-1 rounded-xl text-sm font-medium ${mode === option ? 'bg-white text-ink shadow-sm' : 'text-mute'}`}>{option === 'login' ? 'Sign in' : 'Create account'}</button>)}
          </div>
          {(auth.providers.google || auth.providers.facebook) && <div className="my-6 space-y-3">
            {auth.providers.google && <button disabled={disabled} onClick={() => void social('google')} className="min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-ink disabled:opacity-50">Continue with Google</button>}
            {auth.providers.facebook && <button disabled={disabled} onClick={() => void social('facebook')} className="min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-ink disabled:opacity-50">Continue with Facebook</button>}
            <p className="pt-2 text-center text-sm text-mute">or use your email</p>
          </div>}
        </>}
        <form onSubmit={event => void submit(event)} className="mt-6 space-y-5">
          {!auth.recovery && mode === 'signup' && <label className="block text-sm font-medium text-ink">Name <span className="font-normal text-mute">(optional)</span><input name="name" autoComplete="name" maxLength={80} className="field mt-2 w-full" /></label>}
          {!auth.recovery && <label className="block text-sm font-medium text-ink">Email<input name="email" type="email" autoComplete="email" required maxLength={254} className="field mt-2 w-full" /></label>}
          {(auth.recovery || mode !== 'reset') && <label className="block text-sm font-medium text-ink">Password<input name="password" type="password" autoComplete={auth.recovery || mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' || auth.recovery ? 10 : 1} maxLength={128} className="field mt-2 w-full" />{(auth.recovery || mode === 'signup') && <span className="mt-2 block font-normal text-mute">Use at least 10 characters.</span>}</label>}
          <button disabled={disabled} className="btn-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Please wait…' : auth.recovery ? 'Save new password' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</button>
        </form>
        {!auth.recovery && <button onClick={() => { setMode(mode === 'reset' ? 'login' : 'reset'); setMessage(''); }} className="mt-5 min-h-12 w-full text-sm text-mute underline underline-offset-4">{mode === 'reset' ? 'Back to sign in' : 'Forgot your password?'}</button>}
      </>}
      {message && <p role={failed ? 'alert' : 'status'} className={`mt-6 rounded-2xl p-4 text-sm ${failed ? 'bg-red-50 text-red-800' : 'bg-mist text-ink'}`}>{message}</p>}
      <p className="mt-8 text-center text-xs leading-relaxed text-mute">Your account keeps your purchased filters together, ready whenever you need a pause.</p>
    </main><Footer />
  </div>;
}
