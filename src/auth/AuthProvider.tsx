import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getAuthClient } from './client';
import { AuthContext, type AuthState } from './context';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, 'signOut'>>({
    user: null, loading: true, available: false, recovery: false, notice: '',
    providers: { google: false, facebook: false },
  });
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    let controller: AbortController | undefined;
    const sync = async (session: Session | null, recovery = false) => {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch('/.netlify/functions/member-session', {
          method: session ? 'POST' : 'DELETE', credentials: 'same-origin',
          headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Please sign in again to open your filters.');
        if (active) setState(current => ({ ...current, user: session?.user ?? null, loading: false, recovery, notice: '' }));
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === 'AbortError')) {
          setState(current => ({ ...current, user: null, loading: false, notice: 'Please sign in again to open your filters.' }));
        }
      }
    };
    void getAuthClient().then(({ client, config }) => {
      if (!active) return;
      setState(current => ({ ...current, available: true, providers: { google: config.google, facebook: config.facebook } }));
      const { data } = client.auth.onAuthStateChange((event, session) => {
        // Do not call another auth method while inside Supabase's session lock.
        queueMicrotask(() => { if (active) void sync(session, event === 'PASSWORD_RECOVERY'); });
      });
      unsubscribe = () => data.subscription.unsubscribe();
    }).catch(() => {
      if (active) setState(current => ({ ...current, loading: false, notice: 'Account sign-in is being set up. Please check back shortly.' }));
    });
    return () => { active = false; unsubscribe?.(); controller?.abort(); };
  }, []);

  const signOut = async () => {
    const { client } = await getAuthClient();
    const { error } = await client.auth.signOut();
    // Always clear our media cookie, including when the remote session has expired.
    await fetch('/.netlify/functions/member-session', { method: 'DELETE', credentials: 'same-origin' });
    setState(current => ({ ...current, user: null, recovery: false }));
    if (error) throw error;
  };
  return <AuthContext.Provider value={{ ...state, signOut }}>{children}</AuthContext.Provider>;
}
