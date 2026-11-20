import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import jsQR from 'jsqr';
import jpeg from 'jpeg-js';

const require = createRequire(import.meta.url);
async function loadTs(path) {
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
  let code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  code = code.replace("'qrcode-generator'", JSON.stringify(pathToFileURL(require.resolve('qrcode-generator')).href));
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}
const { createQrMatrix } = await loadTs('../src/ar/qr.ts');
const { filterSlugs, filterPath, publicFilterUrl } = await loadTs('../src/ar/filterLinks.ts');

test('each JPEG QR decodes to its distinct public filter URL', () => {
  const urls = new Set();
  for (const slug of filterSlugs) {
    const url = publicFilterUrl(slug);
    urls.add(url);
    assert.equal(new URL(url).searchParams.get('filter'), slug);
    assert.equal(new URL(url).pathname, '/ar-camera/');
    assert.equal(new URL(url).origin, 'https://smara.online');
    const matrix = createQrMatrix(url);
    const scale = 8, border = 4;
    const size = (matrix.length + border * 2) * scale;
    const data = new Uint8Array(size * size * 4).fill(255);
    for (let row = 0; row < matrix.length; row++) for (let col = 0; col < matrix.length; col++) {
      if (!matrix[row][col]) continue;
      for (let y = 0; y < scale; y++) for (let x = 0; x < scale; x++) {
        const offset = (((row + border) * scale + y) * size + (col + border) * scale + x) * 4;
        data[offset] = data[offset + 1] = data[offset + 2] = 0;
      }
    }
    const compressed = jpeg.encode({ data, width: size, height: size }, 95).data;
    const decoded = jpeg.decode(compressed, { useTArray: true });
    assert.equal(jsQR(new Uint8ClampedArray(decoded.data), size, size)?.data, url);
  }
  assert.equal(urls.size, 6);
});

test('filter URLs reject unknown experiences instead of producing broken links', () => {
  assert.throws(() => filterPath('missing-filter'), /Unknown AR filter/);
  assert.throws(() => filterPath('mandala'), /Unknown AR filter/);
});
