import { bearerToken, createMemberService, privateHeaders, SESSION_COOKIE } from '../lib/member-access.mjs';

export function createSessionHandler(service, origin = 'https://smara.online') {
  return async event => {
    const reply = (statusCode, data, cookie) => ({ statusCode, headers: { ...privateHeaders, ...(cookie ? { 'Set-Cookie': cookie } : {}) }, body: JSON.stringify(data) });
    if (!['POST', 'DELETE'].includes(event.httpMethod)) return reply(405, { error: 'Method not allowed' });
    if (event.headers?.origin !== origin) return reply(403, { error: 'Request not allowed' });
    const flags = '; Path=/; Secure; HttpOnly; SameSite=Lax';
    if (event.httpMethod === 'DELETE') return reply(200, { signedOut: true }, `${SESSION_COOKIE}=; Max-Age=0${flags}`);
    const token = bearerToken(event.headers?.authorization);
    const user = await service.user(token);
    if (!user) return reply(401, { error: 'Sign in required' });
    let age;
    try { age = Math.min(3600, Math.floor(JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).exp - Date.now() / 1000)); } catch { return reply(401, { error: 'Sign in required' }); }
    if (!Number.isFinite(age) || age <= 0) return reply(401, { error: 'Sign in required' });
    return reply(200, { signedIn: true }, `${SESSION_COOKIE}=${token}; Max-Age=${age}${flags}`);
  };
}
export const handler = event => createSessionHandler(createMemberService({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_PUBLISHABLE_KEY }))(event);
