// Only a verifier is deployed. The random owner password is never included in source.
const owner = {"username":"smara","salt":"9e188771f76145a04293ba5637ee1191","passwordHash":"028b73912d1da7137169debf9b26f5a71f041eb821df6803f048b8b3333bea28"};

const privateSlugs = new Set(['moonlit-mandala', 'mountain-mandala']);
const retiredSlugs = new Set(['moonlit-lotus-pond', 'misty-mountain', 'tropical-beach']);
function secureHeaders(headers = new Headers()) {
  headers.set('Cache-Control', 'private, no-store, max-age=0');
  headers.set('CDN-Cache-Control', 'no-store');
  headers.set('Netlify-CDN-Cache-Control', 'no-store');
  headers.set('Vary', [headers.get('Vary'), 'Authorization'].filter(Boolean).join(', '));
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Security-Policy', "frame-ancestors 'none'");
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  return headers;
}
async function authorized(request, owner) {
  const value = request.headers.get('Authorization') || '';
  if (value.length > 1024 || !/^Basic [A-Za-z0-9+/]+=*$/i.test(value)) return false;
  let decoded;
  try { decoded = atob(value.slice(6)); } catch { return false; }
  const separator = decoded.indexOf(':');
  if (separator < 0 || decoded.slice(0, separator) !== owner.username) return false;
  const password = decoded.slice(separator + 1);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('smara-working-filters-v1:' + owner.salt + ':' + password)));
  const expected = owner.passwordHash.match(/../g).map(hex => parseInt(hex, 16));
  let difference = digest.length ^ expected.length;
  for (let i = 0; i < digest.length; i++) difference |= digest[i] ^ expected[i];
  return difference === 0;
}
export function createWorkingFilterGate(owner) {
  return async (request, context) => {
    const url = new URL(request.url);
    let path;
    try { path = decodeURIComponent(url.pathname).replace(/\/+/g, '/').toLowerCase().replace(/\/index\.html$/, '').replace(/\/$/, '') || '/'; }
    catch { return new Response('Invalid address', { status: 400 }); }
    const slug = url.searchParams.get('filter');
    if (path === '/ar-camera' || path === '/ar-experience') {
      const destination = privateSlugs.has(slug) ? '/hidden-working-filters/camera/?filter=' + encodeURIComponent(slug)
        : retiredSlugs.has(slug) ? '/ar-experience/' : null;
      if (destination) return new Response(null, { status: 302, headers: secureHeaders(new Headers({ Location: destination })) });
    }
    const protectedPath = path === '/hidden-working-filters' || path.startsWith('/hidden-working-filters/')
      || /^\/images\/ar-mandala-(2g|3b)\.mp4$/.test(path);
    if (!protectedPath) return context.next();
    if (!await authorized(request, owner)) {
      const headers = secureHeaders(new Headers({
        'WWW-Authenticate': 'Basic realm="SMARA working filters", charset="UTF-8"',
        'Content-Type': 'text/html; charset=utf-8',
      }));
      return new Response(request.method === 'HEAD' ? null : '<!doctype html><title>Owner access required</title><h1>Owner access required</h1>', { status: 401, headers });
    }
    if (path === '/hidden-working-filters/access.json') {
      return new Response(request.method === 'HEAD' ? null : JSON.stringify({ authorized: true }), {
        headers: secureHeaders(new Headers({ 'Content-Type': 'application/json' })),
      });
    }
    const response = await context.next();
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: secureHeaders(new Headers(response.headers)) });
  };
}
export default createWorkingFilterGate(owner);
export const config = { path: '/*' };

