import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { createWorkingFilterGate } from '../netlify/edge-functions/working-filters.js';

const password = 'test-only-password';
const salt = 'test-salt';
const gate = createWorkingFilterGate({ username: 'smara', salt, passwordHash: createHash('sha256').update(`smara-working-filters-v1:${salt}:${password}`).digest('hex') });
const authorization = 'Basic ' + Buffer.from(`smara:${password}`).toString('base64');
const run = (path, headers = {}, next = () => new Response('page')) => gate(new Request('https://smara.online' + path, { headers }), { next });

test('public pages, beach camera and collection posters stay public', async () => {
  for (const path of ['/ar-experience/', '/ar-camera/?filter=tropical-mandala', '/images/ar-mandala-2g.jpg']) assert.equal((await run(path)).status, 200);
});
test('private pages, camera, aliases and raw videos require authentication', async () => {
  for (const path of ['/hidden-working-filters/', '/hidden-working-filters/index.html', '/hidden-working-filters/camera/?filter=moonlit-mandala', '/hidden-working-filters/access.json', '/hidden-working-filters/media/moonlit-mandala.mp4', '/images/ar-mandala-2g.mp4', '/images/ar-mandala-3b.mp4', '/%68idden-working-filters/camera/index.html']) {
    const response = await run(path);
    assert.equal(response.status, 401, path);
    assert.match(response.headers.get('WWW-Authenticate'), /^Basic /);
    assert.match(response.headers.get('Cache-Control'), /no-store/);
  }
});
test('incorrect and malformed credentials cannot access private routes', async () => {
  for (const value of ['Basic !!!', 'Bearer token', 'Basic ' + Buffer.from('smara:wrong').toString('base64'), 'Basic ' + Buffer.from('other:test-only-password').toString('base64')]) assert.equal((await run('/hidden-working-filters/', { authorization: value })).status, 401);
});
test('authenticated owner can load page, access check and ranged media without public caching', async () => {
  const response = await run('/hidden-working-filters/', { authorization });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'page');
  assert.match(response.headers.get('Vary'), /Authorization/);
  assert.match(response.headers.get('X-Robots-Tag'), /noindex/);
  assert.match(response.headers.get('Netlify-CDN-Cache-Control'), /no-store/);
  assert.deepEqual(await (await run('/hidden-working-filters/access.json', { authorization })).json(), { authorized: true });
  const range = await run('/images/ar-mandala-2g.mp4', { authorization, range: 'bytes=0-3' }, () => new Response('data', { status: 206, headers: { 'Content-Range': 'bytes 0-3/100' } }));
  assert.equal(range.status, 206);
  assert.equal(range.headers.get('Content-Range'), 'bytes 0-3/100');
});
test('old private links redirect to password-protected camera, retired links to gallery', async () => {
  for (const route of ['/ar-camera/', '/ar-experience/', '/ar-camera/index.html']) {
    for (const slug of ['moonlit-mandala', 'mountain-mandala']) {
      const response = await run(`${route}?filter=${slug}`);
      assert.equal(response.status, 302);
      assert.equal(response.headers.get('Location'), `/hidden-working-filters/camera/?filter=${slug}`);
    }
    for (const slug of ['moonlit-lotus-pond', 'misty-mountain', 'tropical-beach']) assert.equal((await run(`${route}?filter=${slug}`)).headers.get('Location'), '/ar-experience/');
  }
});
