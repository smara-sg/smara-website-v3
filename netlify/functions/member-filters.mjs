import { cookieToken, createMemberService, privateHeaders } from '../lib/member-access.mjs';

export const createFiltersHandler = service => async event => {
  const reply = (statusCode, body) => ({ statusCode, headers: privateHeaders, body: JSON.stringify(body) });
  if (event.httpMethod !== 'GET') return reply(405, { error: 'Method not allowed' });
  const token = cookieToken(event.headers?.cookie);
  const member = await service.user(token);
  if (!member) return reply(401, { error: 'Sign in required' });
  const filters = await service.filters(token, member);
  if (!filters) return reply(503, { error: 'Your filters could not be loaded. Please try again.' });
  return reply(200, { filters });
};
export const handler = event => createFiltersHandler(createMemberService({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_PUBLISHABLE_KEY }))(event);
