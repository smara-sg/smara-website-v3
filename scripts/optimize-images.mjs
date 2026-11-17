/**
 * One-off image optimization for the public gallery, events, portraits, and hero art.
 * Not part of `vite build` — Netlify does not need sharp installed.
 *
 *   npm install --no-save sharp
 *   node scripts/optimize-images.mjs
 *
 * Rewrites files under public/images and writes src/imageSizes.ts.
 * Run it against the original assets; running it again recompresses the results.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
const root = process.cwd()
const imgDir = path.join(root, 'public/images')
const publicDir = path.join(root, 'public')

const report = []

function bytesOf(file) {
  return fs.statSync(file).size
}

function record(entry) {
  report.push(entry)
  const webp = entry.webp == null ? '—' : fmt(entry.webp)
  console.log(
    `${entry.name.padEnd(28)} ${fmt(entry.before).padStart(10)} -> jpg/png ${fmt(entry.fallback).padStart(10)}  webp ${webp.padStart(10)}  ${entry.width}x${entry.height}`
  )
}

function fmt(n) {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${n} B`
}

async function encodeResized(input, { maxEdge, webpQuality, jpegQuality, chroma }) {
  let pipeline = sharp(input, { failOn: 'none' })
  if (maxEdge) {
    pipeline = pipeline.resize({
      width: maxEdge,
      height: maxEdge,
      fit: 'inside',
      withoutEnlargement: true,
    })
  }
  const jpeg = await pipeline
    .clone()
    .jpeg({
      quality: jpegQuality,
      mozjpeg: true,
      chromaSubsampling: chroma,
      progressive: true,
    })
    .toBuffer()
  const webp = await pipeline
    .clone()
    .webp({ quality: webpQuality, effort: 6 })
    .toBuffer()
  const meta = await sharp(jpeg).metadata()
  return { jpeg, webp, width: meta.width, height: meta.height }
}

function writeImage(name, buffer) {
  fs.writeFileSync(path.join(imgDir, name), buffer)
}

function removeImage(name) {
  const file = path.join(imgDir, name)
  if (fs.existsSync(file)) fs.unlinkSync(file)
}

async function photoToJpeg(sourceName, destBase, options) {
  const source = path.join(imgDir, sourceName)
  const before = bytesOf(source)
  const encoded = await encodeResized(source, options)
  const useWebp = encoded.webp.length < encoded.jpeg.length
  writeImage(`${destBase}.jpg`, encoded.jpeg)
  if (useWebp) writeImage(`${destBase}.webp`, encoded.webp)
  if (sourceName !== `${destBase}.jpg`) removeImage(sourceName)
  record({
    name: `${destBase}.jpg`,
    before,
    fallback: encoded.jpeg.length,
    webp: useWebp ? encoded.webp.length : null,
    width: encoded.width,
    height: encoded.height,
    sourceName,
  })
  return {
    width: encoded.width,
    height: encoded.height,
    webp: useWebp,
  }
}

async function addWebpKeepOriginal(name, quality) {
  const source = path.join(imgDir, name)
  const before = bytesOf(source)
  const original = fs.readFileSync(source)
  const webp = await sharp(original).webp({ quality, effort: 6 }).toBuffer()
  const meta = await sharp(original).metadata()
  const useWebp = webp.length < original.length * 0.95
  if (useWebp) writeImage(name.replace(/\.(png|jpe?g)$/i, '.webp'), webp)
  record({
    name,
    before,
    fallback: before,
    webp: useWebp ? webp.length : null,
    width: meta.width,
    height: meta.height,
    sourceName: name,
  })
  return { width: meta.width, height: meta.height, webp: useWebp }
}

async function contentBounds(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let minX = info.width
  let minY = info.height
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * 4 + 3]
      if (alpha > 20) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  return { minX, minY, maxX, maxY, width: info.width, height: info.height }
}

function toIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + 16 * images.length
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += png.length
    return entry
  })
  return Buffer.concat([header, ...entries, ...images.map((image) => image.png)])
}

const sizes = {}

const artwork = {
  maxEdge: null,
  webpQuality: 90,
  jpegQuality: 92,
  chroma: '4:4:4',
}

for (const [source, dest] of [
  ['clear_blue.png', 'clear_blue'],
  ['godray_valley.png', 'godray_valley'],
  ['midnight_pond.png', 'midnight_pond'],
  ['serene_seclusion.png', 'serene_seclusion'],
]) {
  sizes[`${dest}.jpg`] = await photoToJpeg(source, dest, artwork)
}

sizes['enchanted_lavender.jpg'] = await photoToJpeg('enchanted_lavendar.jpg', 'enchanted_lavender', {
  maxEdge: 2800,
  webpQuality: 90,
  jpegQuality: 92,
  chroma: '4:4:4',
})

for (const name of ['samh1.jpg', 'samh2.jpg', 'samh3.jpg']) {
  sizes[name] = await photoToJpeg(name, name.replace(/\.jpg$/, ''), {
    maxEdge: 2000,
    webpQuality: 84,
    jpegQuality: 85,
    chroma: '4:2:0',
  })
}

sizes['alvinpfp.jpeg'] = await (async () => {
  const source = path.join(imgDir, 'alvinpfp.jpeg')
  const before = bytesOf(source)
  const encoded = await encodeResized(source, {
    maxEdge: 960,
    webpQuality: 86,
    jpegQuality: 86,
    chroma: '4:2:0',
  })
  writeImage('alvinpfp.jpeg', encoded.jpeg)
  writeImage('alvinpfp.webp', encoded.webp)
  record({
    name: 'alvinpfp.jpeg',
    before,
    fallback: encoded.jpeg.length,
    webp: encoded.webp.length,
    width: encoded.width,
    height: encoded.height,
  })
  return { width: encoded.width, height: encoded.height, webp: true }
})()

for (const [source, dest] of [
  ['cosmic-card.png', 'cosmic-card'],
  ['ocean-card.png', 'ocean-card'],
  ['mountain-card.png', 'mountain-card'],
  ['urban-card.png', 'urban-card'],
]) {
  sizes[`${dest}.jpg`] = await photoToJpeg(source, dest, {
    maxEdge: null,
    webpQuality: 88,
    jpegQuality: 90,
    chroma: '4:2:0',
  })
}

for (const name of [
  'smarainplaces1.jpg',
  'smarainplaces2.jpg',
  'smarainplaces3.jpg',
  'smarainplaces4.jpg',
  'abstract-card.jpg',
  'landscape-card.jpg',
  'clarencepfp.jpeg',
  'lilianpfp.jpeg',
]) {
  sizes[name] = await addWebpKeepOriginal(name, 84)
}

for (const [source, dest] of [
  ['smara1a.png', 'smara1a'],
  ['smara2a.png', 'smara2a'],
  ['smara3a.png', 'smara3a'],
  ['smara4.png', 'smara4'],
]) {
  const sourcePath = path.join(imgDir, source)
  const before = bytesOf(sourcePath)
  const original = fs.readFileSync(sourcePath)
  const webp = await sharp(original).webp({ quality: 86, effort: 6 }).toBuffer()
  const meta = await sharp(original).metadata()
  writeImage(`${dest}.jpg`, original)
  writeImage(`${dest}.webp`, webp)
  removeImage(source)
  record({
    name: `${dest}.jpg`,
    before,
    fallback: original.length,
    webp: webp.length,
    width: meta.width,
    height: meta.height,
    note: 'jpeg bytes copied; extension corrected from .png',
  })
  if (dest === 'smara4') {
    sizes['smara4.jpg'] = { width: meta.width, height: meta.height, webp: webp.length < original.length }
  }
}

const logoPath = path.join(imgDir, 'SMARA_icon.png')
const logoBefore = bytesOf(logoPath)
const logoOriginal = fs.readFileSync(logoPath)
const bounds = await contentBounds(logoPath)
const contentW = bounds.maxX - bounds.minX + 1
const contentH = bounds.maxY - bounds.minY + 1
const pad = Math.round(Math.max(contentW, contentH) * 0.08)
const left = Math.max(0, bounds.minX - pad)
const top = Math.max(0, bounds.minY - pad)
const right = Math.min(bounds.width - 1, bounds.maxX + pad)
const bottom = Math.min(bounds.height - 1, bounds.maxY + pad)
const extract = {
  left,
  top,
  width: right - left + 1,
  height: bottom - top + 1,
}

async function faviconPng(size, background) {
  let pipeline = sharp(logoOriginal).extract(extract).resize(size, size, {
    fit: 'contain',
    background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
  })
  if (background) pipeline = pipeline.flatten({ background })
  return pipeline.png({ compressionLevel: 9 }).toBuffer()
}

const logoPng = await sharp(logoOriginal)
  .resize(256, 256, { fit: 'fill' })
  .png({ compressionLevel: 9 })
  .toBuffer()
writeImage('SMARA_icon.png', logoPng)
const logoMeta = await sharp(logoPng).metadata()
sizes['SMARA_icon.png'] = { width: logoMeta.width, height: logoMeta.height, webp: false }
record({
  name: 'SMARA_icon.png',
  before: logoBefore,
  fallback: logoPng.length,
  webp: null,
  width: logoMeta.width,
  height: logoMeta.height,
})

const icoImages = []
for (const size of [16, 32, 48]) {
  const png = await faviconPng(size)
  icoImages.push({ size, png })
  if (size === 32) fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png)
}
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), toIco(icoImages))
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), await faviconPng(180, '#ffffff'))

const og = await sharp(path.join(imgDir, 'smara4.jpg'))
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4', progressive: true })
  .toBuffer()
writeImage('og-image.jpg', og)
const ogMeta = await sharp(og).metadata()
record({
  name: 'og-image.jpg',
  before: 0,
  fallback: og.length,
  webp: null,
  width: ogMeta.width,
  height: ogMeta.height,
  note: 'derived from smara4',
})

for (const name of ['nightsky-qr.png', 'doortobeach-qr.png', 'flowers-qr.png', 'cate.gif']) {
  const meta = await sharp(path.join(imgDir, name)).metadata()
  sizes[name] = { width: meta.width, height: meta.height, webp: false }
}

const ordered = Object.keys(sizes).sort()
const body = ordered
  .map((name) => {
    const size = sizes[name]
    return `  ${JSON.stringify(name)}: { width: ${size.width}, height: ${size.height}, webp: ${size.webp} },`
  })
  .join('\n')

fs.writeFileSync(
  path.join(root, 'src/imageSizes.ts'),
  `// Generated by scripts/optimize-images.mjs. Do not edit by hand.\nexport const imageSizes = {\n${body}\n} as const\n\nexport type LocalImage = keyof typeof imageSizes\n`
)

const changed = report.filter((entry) => entry.before > 0)
const beforeTotal = changed.reduce((sum, entry) => sum + entry.before, 0)
const afterTotal = changed.reduce((sum, entry) => sum + entry.fallback + (entry.webp ?? 0), 0)
console.log(`\nTracked originals ${fmt(beforeTotal)}; deployed fallback+webp ${fmt(afterTotal)}`)
fs.writeFileSync('/tmp/image-report.json', JSON.stringify({ report, beforeTotal, afterTotal }, null, 2))
