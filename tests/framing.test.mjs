import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/ar/framing.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { cameraFrameGeometry, personPlacement } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));

test('mobile preserves all four sensor edges in portrait, landscape and square frames', () => {
  for (const [width, height] of [[1280, 720], [720, 1280], [640, 480], [480, 640], [1024, 1024]]) {
    const frame = cameraFrameGeometry(width, height, true);
    assert.equal(frame.x, 0); assert.equal(frame.y, 0);
    assert.equal(frame.cropWidth, width); assert.equal(frame.cropHeight, height);
    assert.ok(Math.abs(frame.width / frame.height - width / height) < .005);
    const fit = personPlacement(frame.width, frame.height, 1080, 1920, true);
    assert.ok(fit.x >= 0 && fit.y > 0);
    assert.ok(fit.x + fit.width <= 1080 && fit.y + fit.height <= 1920);
    assert.ok(Math.abs(fit.width / fit.height - frame.width / frame.height) < .00001);
  }
});
test('desktop retains its centered portrait camera crop', () => {
  const frame = cameraFrameGeometry(1280, 720, false);
  assert.equal(frame.cropHeight, 720);
  assert.equal(frame.cropWidth, 405);
  assert.ok(frame.x > 400);
  assert.equal(frame.y, 0);
});
