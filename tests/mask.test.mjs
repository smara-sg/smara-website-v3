import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/ar/mask.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { updatePersonAlpha, inferenceInterval } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));

test('optimized matte matches bilinear alpha for flat regions, soft edges and both cameras', async () => {
  const { applyPersonMatte } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
  let seed = 734;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 24);
  for (const mirrored of [false, true]) {
    const width = 81, height = 119, maskWidth = 13, maskHeight = 21;
    const matte = new Uint8ClampedArray(maskWidth * maskHeight * 4);
    for (let y = 0; y < maskHeight; y++) for (let x = 0; x < maskWidth; x++) {
      matte[(y * maskWidth + x) * 4 + 3] = x < 4 ? 0 : x > 8 ? 255 : random();
    }
    const actual = Uint8ClampedArray.from({ length: width * height * 4 }, random);
    const expected = actual.slice();
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const sx = Math.max(0, Math.min(maskWidth - 1, ((mirrored ? width - 1 - x : x) + 0.5) * maskWidth / width - 0.5));
      const sy = Math.max(0, Math.min(maskHeight - 1, (y + 0.5) * maskHeight / height - 0.5));
      const x0 = Math.floor(sx), x1 = Math.min(maskWidth - 1, x0 + 1), fx = sx - x0;
      const y0 = Math.floor(sy), y1 = Math.min(maskHeight - 1, y0 + 1), fy = sy - y0;
      const alpha = (x, y) => matte[(y * maskWidth + x) * 4 + 3];
      const top = alpha(x0, y0) * (1 - fx) + alpha(x1, y0) * fx;
      const bottom = alpha(x0, y1) * (1 - fx) + alpha(x1, y1) * fx;
      const offset = (y * width + x) * 4 + 3;
      expected[offset] = Math.round((top * (1 - fy) + bottom * fy) * expected[offset] / 255);
    }
    applyPersonMatte(actual, width, height, matte, maskWidth, maskHeight, mirrored);
    assert.deepEqual(actual, expected);
  }
});

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

test('small interior mask gaps are repaired without filling larger background openings', async () => {
  const { backgroundFromCategories } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
  const isolated = new Uint8Array(25); isolated[12] = 255;
  assert.deepEqual([...backgroundFromCategories(isolated, 5, 5, true)], Array(25).fill(0));
  const opening = new Uint8Array(25);
  for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) opening[y * 5 + x] = 255;
  assert.equal(backgroundFromCategories(opening, 5, 5, true)[12], 1);
});

test('mobile edges stabilize small changes, retain faint details and follow large motion immediately', () => {
  const previous = new Float32Array([.5, 0, 1]);
  const rgba = new Uint8ClampedArray(12);
  updatePersonAlpha(new Float32Array([.25, 0, 1]), previous, rgba, false, true);
  assert.ok(Math.abs(previous[0] - .675) < .00001);
  assert.equal(previous[1], 1); assert.equal(previous[2], 0);
  assert.equal(rgba[7], 255); assert.equal(rgba[11], 0);
  const standard = new Uint8ClampedArray(4), softened = new Uint8ClampedArray(4);
  updatePersonAlpha(new Float32Array([.75]), new Float32Array(1), standard, true);
  updatePersonAlpha(new Float32Array([.75]), new Float32Array(1), softened, true, true);
  assert.ok(softened[3] > standard[3] && softened[3] < 128);
});

test('category work buffers are reused and resized without retaining old mask pixels', async () => {
  const { backgroundFromCategories } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
  const workspace = {};
  const first = backgroundFromCategories(new Uint8Array(16), 4, 4, true, workspace);
  const raw = workspace.background, horizontal = workspace.horizontal;
  const next = backgroundFromCategories(new Uint8Array(16).fill(255), 4, 4, true, workspace);
  assert.equal(first, next); assert.equal(workspace.background, raw); assert.equal(workspace.horizontal, horizontal);
  assert.deepEqual([...next], Array(16).fill(1));
  const resized = backgroundFromCategories(new Uint8Array(6), 3, 2, true, workspace);
  assert.notEqual(resized, next); assert.equal(resized.length, 6);
  assert.deepEqual([...resized], Array(6).fill(0));
});

test('cached alpha sampling keeps front/back alignment and respects source opacity', async () => {
  const { createMatteSamplingMap, applyPersonMatte } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
  const matte = new Uint8ClampedArray([0, 0, 0, 0, 0, 0, 0, 255]);
  const map = createMatteSamplingMap(4, 2, false);
  const image = new Uint8ClampedArray(16).fill(128);
  applyPersonMatte(image, 4, 1, matte, 2, 1, false, map);
  assert.deepEqual([image[3], image[7], image[11], image[15]], [0, 32, 96, 128]);
  const mirrored = new Uint8ClampedArray(16).fill(255);
  applyPersonMatte(mirrored, 4, 1, matte, 2, 1, true, map);
  assert.deepEqual([mirrored[3], mirrored[7], mirrored[11], mirrored[15]], [255, 191, 64, 0]);
});
