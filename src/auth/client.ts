import type { SupabaseClient } from '@supabase/supabase-js';

type AuthConfig = { url: string; publicKey: string; google: boolean; facebook: boolean };
let pending: Promise<{ client: SupabaseClient; config: AuthConfig }> | undefined;

export function getAuthClient() {
  if (!pending) pending = (async () => {
    const response = await fetch('/.netlify/functions/auth-config');
    if (!response.ok) throw new Error('Account sign-in is being set up. Please check back shortly.');
    const config: AuthConfig = await response.json();
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(config.url, config.publicKey, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return { client, config };
  })();
  return pending;
}

export function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || (value.includes('\\') || [...value].some(char => char.charCodeAt(0) <= 32))) return '/my-filters/';
  try {
    const url = new URL(value, 'https://smara.online');
    if (url.origin !== 'https://smara.online' || url.pathname.startsWith('/account')) return '/my-filters/';
    return url.pathname + url.search + url.hash;
  } catch { return '/my-filters/'; }
}
