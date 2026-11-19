import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/ar/mask.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { updatePersonAlpha, inferenceInterval } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));

test('matte retains foreground, removes background, and preserves soft edges', () => {
  const background = new Float32Array([0, 1, 0.5, 0.4, 0.6]);
  const rgba = new Uint8ClampedArray(20);
  updatePersonAlpha(background, new Float32Array(5), rgba, true);
  assert.equal(rgba[3], 255);
  assert.equal(rgba[7], 0);
  assert.ok(rgba[11] > 0 && rgba[11] < 255);
  assert.ok(rgba[15] > rgba[11] && rgba[11] > rgba[19]);
});

test('small confidence changes stabilize while moving boundaries update immediately', () => {
  const previous = new Float32Array([0.5, 0.1]);
  const rgba = new Uint8ClampedArray(8);
  updatePersonAlpha(new Float32Array([0.48, 0.02]), previous, rgba, false);
  assert.ok(previous[0] > 0.5 && previous[0] < 0.52);
  assert.ok(previous[1] > 0.97);
  assert.equal(rgba[7], 255);
});

test('adaptive scheduling limits inference demand on both fast and slow devices', () => {
  assert.equal(inferenceInterval(5), 1000 / 24);
  assert.ok(inferenceInterval(80) > 80);
  assert.equal(inferenceInterval(1000), 180);
});
