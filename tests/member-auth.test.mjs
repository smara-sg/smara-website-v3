import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
import { createMemberService, SESSION_COOKIE } from '../netlify/lib/member-access.mjs';
import { createSessionHandler } from '../netlify/functions/member-session.mjs';
import { createFiltersHandler } from '../netlify/functions/member-filters.mjs';
import { createWorkingFilterGate } from '../netlify/edge-functions/working-filters.js';
import { isPublicKey } from '../netlify/functions/auth-config.mjs';

const token = `testheader.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 600 })).toString('base64url')}.testsignature`;
const service = { user: async value => value === token ? { id: 'member-a' } : null, filters: async () => ['moonlit-mandala'] };

test('public configuration rejects secret and service-role keys', () => {
  const legacy = role => `header.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`;
  assert.equal(isPublicKey('sb_publishable_example'), true);
  assert.equal(isPublicKey(legacy('anon')), true);
  assert.equal(isPublicKey(legacy('service_role')), false);
  assert.equal(isPublicKey('sb_secret_example'), false);
  assert.equal(isPublicKey(undefined), false);
});

test('media session rejects cross-site requests, absent credentials and forged tokens', async () => {
  const handler = createSessionHandler(service);
  for (const event of [
    { httpMethod: 'POST', headers: { origin: 'https://elsewhere.example', authorization: `Bearer ${token}` } },
    { httpMethod: 'POST', headers: { origin: 'https://smara.online' } },
    { httpMethod: 'POST', headers: { origin: 'https://smara.online', authorization: 'Bearer forged.invalid.token' } },
  ]) {
    const response = await handler(event);
    assert.ok([401, 403].includes(response.statusCode));
    assert.equal(response.headers['Set-Cookie'], undefined);
    assert.match(response.headers['Cache-Control'], /no-store/);
  }
});
test('verified sessions get a short-lived secure HttpOnly cookie and sign-out clears it', async () => {
  const handler = createSessionHandler(service);
  const result = await handler({ httpMethod: 'POST', headers: { origin: 'https://smara.online', authorization: `Bearer ${token}` } });
  assert.equal(result.statusCode, 200);
  const cookie = result.headers['Set-Cookie'];
  for (const flag of ['__Host-smara-member=', 'HttpOnly', 'SameSite=Lax', 'Secure', 'Path=/']) assert.ok(cookie.includes(flag));
  assert.ok(Number(cookie.match(/Max-Age=(\d+)/)[1]) <= 600);
  const cleared = await handler({ httpMethod: 'DELETE', headers: { origin: 'https://smara.online' } });
  assert.match(cleared.headers['Set-Cookie'], /Max-Age=0/);
});
test('database access verifies the user first and scopes reads to that verified user', async () => {
  const calls = [];
  const memberService = createMemberService({ url: 'https://example.supabase.co', key: 'public-key', fetcher: async (url, options) => {
    calls.push(url);
    if (url.endsWith('/auth/v1/user')) return Response.json(options.headers.Authorization === `Bearer ${token}` ? { id: 'member-a', email_confirmed_at: '2026-01-01' } : {}, { status: options.headers.Authorization === `Bearer ${token}` ? 200 : 401 });
    const query = new URL(url).searchParams;
    assert.equal(query.get('user_id'), 'eq.member-a');
    assert.equal(query.get('revoked_at'), 'is.null');
    assert.match(query.get('or'), /expires_at.gt/);
    return Response.json([{ filter_slug: 'moonlit-mandala' }, { filter_slug: 'unknown' }]);
  } });
  assert.deepEqual(await memberService.filters('forged.invalid.token'), null);
  assert.equal(calls.length, 1);
  assert.deepEqual(await memberService.filters(token), ['moonlit-mandala']);
  assert.equal(await memberService.allowed(token, 'mountain-mandala'), false);
});
test('member library is private and never grants access from client-supplied product names', async () => {
  const handler = createFiltersHandler(service);
  assert.equal((await handler({ httpMethod: 'GET', headers: {} })).statusCode, 401);
  const result = await handler({ httpMethod: 'GET', headers: { cookie: `${SESSION_COOKIE}=${token}` } });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body).filters, ['moonlit-mandala']);
  assert.match(result.headers['Cache-Control'], /no-store/);
  assert.equal((await handler({ httpMethod: 'POST', headers: {} })).statusCode, 405);
});
test('customer purchases unlock only their media; owner tools remain owner-only', async () => {
  const gate = createWorkingFilterGate({ username: 'owner', salt: 'test', passwordHash: '00'.repeat(32) }, async (_request, slug) => slug === 'moonlit-mandala');
  const run = path => gate(new Request('https://smara.online' + path), { next: async () => new Response('media', { status: 206, headers: { 'Content-Range': 'bytes 0-4/5' } }) });
  const allowed = await run('/images/ar-mandala-2g.mp4');
  assert.equal(allowed.status, 206);
  assert.match(allowed.headers.get('Vary'), /Cookie/);
  assert.match(allowed.headers.get('Cache-Control'), /no-store/);
  assert.equal((await run('/images/ar-mandala-3b.mp4')).status, 401);
  assert.equal((await run('/hiddenpage/')).status, 401);
  assert.equal((await run('/hiddenpage/access.json')).status, 401);
});
test('auth service fails closed when configuration is missing or its provider is unavailable', async () => {
  const missing = createMemberService({});
  assert.equal(await missing.allowed(token, 'moonlit-mandala'), false);
  const offline = createMemberService({ url: 'https://example.supabase.co', key: 'public', fetcher: async () => { throw new Error('offline'); } });
  assert.equal(await offline.allowed(token, 'moonlit-mandala'), false);
});
test('post-login destinations cannot redirect to another website or back into login', async () => {
  const source = fs.readFileSync(new URL('../src/auth/client.ts', import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  const { safeReturnPath } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
  for (const value of ['https://evil.example', '//evil.example', '/\\evil.example', '/account/?next=bad', 'javascript:alert(1)', '/\n/evil.example']) assert.equal(safeReturnPath(value), '/my-filters/');
  assert.equal(safeReturnPath('/my-filters/camera/?filter=moonlit-mandala'), '/my-filters/camera/?filter=moonlit-mandala');
});
