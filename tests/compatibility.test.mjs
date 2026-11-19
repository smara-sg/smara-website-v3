import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/ar/compatibility.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { needsMobileMaskCompatibility } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));

test('phones and tablets use compatible masks, including desktop-mode iPads', () => {
  for (const userAgent of ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'Mozilla/5.0 (Linux; Android 15; Pixel 9)', 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)']) {
    assert.equal(needsMobileMaskCompatibility({ userAgent, maxTouchPoints: 5 }), true);
  }
});
test('desktop acceleration remains available, including Windows touch laptops', () => {
  for (const [userAgent, maxTouchPoints] of [['Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)', 0], ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 10], ['Mozilla/5.0 (X11; Linux x86_64)', 0]]) {
    assert.equal(needsMobileMaskCompatibility({ userAgent, maxTouchPoints }), false);
  }
});

test('Android Edge uses byte masks while Chrome keeps its working confidence masks', async () => {
  const { needsByteMaskCompatibility } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
  assert.equal(needsByteMaskCompatibility({ userAgent: 'Mozilla/5.0 (Linux; Android 15) Chrome/140 Mobile Safari/537.36 EdgA/140' }), true);
  assert.equal(needsByteMaskCompatibility({ userAgent: 'Mozilla/5.0 (Linux; Android 15) Chrome/140 Mobile Safari/537.36' }), false);
  assert.equal(needsByteMaskCompatibility({ userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/140 Edg/140' }), false);
});
