import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/responsiveImages.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { responsiveImage } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));

test('display images offer a native-resolution ceiling and high-density screen choices without cropping', () => {
  const result = responsiveImage('/images/self-gaze-watercolour.webp', 1448);
  const candidates = result.srcSet.split(', ').map(value => {
    const [path, descriptor] = value.split(' ');
    const url = new URL(path, 'https://smara.online');
    const width = Number(descriptor.slice(0, -1));
    assert.equal(url.pathname, '/.netlify/images');
    assert.equal(url.searchParams.get('url'), '/images/self-gaze-watercolour.webp');
    assert.equal(Number(url.searchParams.get('w')), width);
    assert.equal(url.searchParams.get('q'), '95');
    assert.equal(url.searchParams.has('h'), false);
    assert.equal(url.searchParams.has('fit'), false);
    return width;
  });
  assert.equal(Math.max(...candidates), 1448);
  assert.ok(candidates.includes(320) && candidates.includes(640) && candidates.includes(1280));
  assert.equal(new Set(candidates).size, candidates.length);
});

test('small sources, logos, QR codes, animated media, private videos and external images bypass transforms', () => {
  for (const src of ['/images/nightsky-qr.png', '/images/SMARA_icon.png', '/images/cate.gif', '/images/ar-mandala-1h.mp4', '/hiddenpage/media/moonlit-mandala.mp4', 'https://example.com/photo.jpg', '/images/photo.jpg?variant=other']) assert.equal(responsiveImage(src, 1920), undefined);
  assert.equal(responsiveImage('/images/lilianpfp.jpeg', 138), undefined);
  assert.equal(responsiveImage('/images/photo.jpg', NaN), undefined);
});

test('source URLs are encoded safely and candidates never upscale a small photo', () => {
  const result = responsiveImage('/images/a & b.jpg', 500);
  assert.equal(new URL(result.src, 'https://smara.online').searchParams.get('url'), '/images/a & b.jpg');
  assert.match(result.src, /w=500/);
  assert.equal(result.srcSet.split(', ').at(-1).split(' ')[1], '500w');
});
