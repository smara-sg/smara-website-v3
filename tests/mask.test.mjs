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
  assert.equal(inferenceInterval(180, false), 240);
  assert.equal(inferenceInterval(300, false), 360);
});

test('rejects malformed masks before they can corrupt the composite', async () => {
  const { validateConfidenceMask } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
  assert.doesNotThrow(() => validateConfidenceMask(new Float32Array([0, 0.5, 1, 0]), 2, 2));
  for (const values of [[0, 1], [0, NaN, 1, 0], [0, Infinity, 1, 0], [0, -0.5, 1, 0], [0, 2, 1, 0]]) {
    assert.throws(() => validateConfidenceMask(new Float32Array(values), 2, 2));
  }
  assert.throws(() => validateConfidenceMask(new Float32Array(4), 2.5, 2));
});

test('byte masks keep hair, face, skin, clothes and accessories, removing only background', async () => {
  const { backgroundFromCategories } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
  for (const category of [0, 1, 2, 3, 4, 5]) {
    assert.deepEqual([...backgroundFromCategories(new Uint8Array(9).fill(category), 3, 3)], Array(9).fill(category === 0 ? 1 : 0));
  }
  const edge = backgroundFromCategories(new Uint8Array([0, 0, 1, 1]), 4, 1);
  assert.deepEqual([...edge], [1, .75, .25, 0]);
  assert.throws(() => backgroundFromCategories(new Uint8Array([0, 255]), 2, 1));
  assert.throws(() => backgroundFromCategories(new Uint8Array([0]), 2, 1));
});

test('software alpha preserves RGB and aligns both mirrored and rear camera masks', async () => {
  const { applyPersonMatte } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
  const matte = new Uint8ClampedArray([0, 0, 0, 0, 0, 0, 0, 255]);
  for (const mirrored of [false, true]) {
    const image = new Uint8ClampedArray([12, 34, 56, 255, 78, 90, 12, 255]);
    applyPersonMatte(image, 2, 1, matte, 2, 1, mirrored);
    assert.deepEqual([...image], [12, 34, 56, mirrored ? 255 : 0, 78, 90, 12, mirrored ? 0 : 255]);
  }
  const image = new Uint8ClampedArray(16).fill(255);
  applyPersonMatte(image, 4, 1, matte, 2, 1, false);
  assert.deepEqual([image[3], image[7], image[11], image[15]], [0, 64, 191, 255]);
  assert.throws(() => applyPersonMatte(image, 2, 2, matte, 2, 2, false));
});

test('single-output selfie masks preserve category zero people and remove category 255 background', async () => {
  const { backgroundFromCategories } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
  assert.deepEqual([...backgroundFromCategories(new Uint8Array([0, 0, 255, 255]), 4, 1, true)], [0, .25, .75, 1]);
  const person = backgroundFromCategories(new Uint8Array(9), 3, 3, true);
  const rgba = new Uint8ClampedArray(36);
  updatePersonAlpha(person, new Float32Array(9), rgba, true);
  assert.equal(rgba[3], 255);
  const background = backgroundFromCategories(new Uint8Array(9).fill(255), 3, 3, true);
  updatePersonAlpha(background, new Float32Array(9), rgba, true);
  assert.equal(rgba[3], 0);
  assert.throws(() => backgroundFromCategories(new Uint8Array([1]), 1, 1, true));
});
