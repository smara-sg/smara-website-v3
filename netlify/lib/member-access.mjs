export const SESSION_COOKIE = '__Host-smara-member';
export const PAID_FILTERS = new Set(['moonlit-mandala', 'mountain-mandala', 'waterfall-kingfisher']);
export const privateHeaders = {
  'Content-Type': 'application/json', 'Cache-Control': 'private, no-store',
  'CDN-Cache-Control': 'no-store', 'Netlify-CDN-Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
};
export function bearerToken(header) {
  return /^Bearer [A-Za-z0-9_.-]{20,8192}$/.test(header ?? '') ? header.slice(7) : null;
}
export function cookieToken(header) {
  const value = (header ?? '').split(';').map(part => part.trim()).find(part => part.startsWith(SESSION_COOKIE + '='))?.slice(SESSION_COOKIE.length + 1);
  return value && /^[A-Za-z0-9_.-]{20,8192}$/.test(value) ? value : null;
}
export function createMemberService({ url, key, fetcher = fetch }) {
  const configured = !!url && !!key && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url);
  const headers = token => ({ apikey: key, Authorization: `Bearer ${token}`, 'Cache-Control': 'no-store' });
  async function user(token) {
    if (!configured || !token) return null;
    try {
      const response = await fetcher(`${url}/auth/v1/user`, { headers: headers(token), cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!response.ok) return null;
      const result = await response.json();
      return typeof result.id === 'string' && result.email_confirmed_at ? { id: result.id } : null;
    } catch { return null; }
  }
  async function filters(token, verifiedUser) {
    const member = verifiedUser ?? await user(token);
    if (!member) return null;
    try {
      const query = new URLSearchParams({ select: 'filter_slug', user_id: `eq.${member.id}`, revoked_at: 'is.null', or: `(expires_at.is.null,expires_at.gt.${new Date().toISOString()})` });
      const response = await fetcher(`${url}/rest/v1/filter_access?${query}`, { headers: headers(token), cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!response.ok) return null;
      const rows = await response.json();
      if (!Array.isArray(rows)) return null;
      return [...new Set(rows.map(row => row.filter_slug).filter(slug => PAID_FILTERS.has(slug)))];
    } catch { return null; }
  }
  return { configured, user, filters, async allowed(token, slug) {
    if (!PAID_FILTERS.has(slug)) return false;
    return (await filters(token))?.includes(slug) ?? false;
  } };
}
