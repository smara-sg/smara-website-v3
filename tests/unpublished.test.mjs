import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('development branch skips Netlify builds while main is still allowed to build', () => {
  const script = fileURLToPath(new URL('../scripts/ignore-unpublished-build.mjs', import.meta.url));
  for (const [branch, status] of [['v4.1.2', 0], ['main', 1], ['v4.1.1', 1]]) {
    assert.equal(spawnSync(process.execPath, [script], { env: { ...process.env, BRANCH: branch } }).status, status);
  }
});
