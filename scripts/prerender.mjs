import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const distDir = path.resolve(process.argv[2] || 'dist')
const serverEntry = path.resolve(process.argv[3] || '.ssr-build/entry-server.js')

if (!fs.existsSync(serverEntry)) {
  const parent = path.dirname(serverEntry)
  const listing = fs.existsSync(parent) ? fs.readdirSync(parent).join(', ') : '(missing)'
  throw new Error(`SSR bundle not found at ${serverEntry}. Directory contains: ${listing}`)
}

const templatePath = path.join(distDir, 'index.html')
const template = fs.readFileSync(templatePath, 'utf8')
if (!template.includes('<!--app-html-->') || !template.includes('<!--seo:start-->')) {
  throw new Error('dist/index.html is missing prerender markers')
}

const { render } = await import(pathToFileURL(serverEntry).href)

const routes = ['/', '/gallery', '/events', '/about', '/art-cards']
const markers = {
  '/': 'Self-Gaze Meditation Augmented Reality Art',
  '/gallery': 'SMARA Artworks For Sale',
  '/events': 'SMARA Events',
  '/about': 'About SMARA',
  '/art-cards': 'Transform Art into Interactive Meditation',
}

function escapeAttr(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
}

function seoBlock(head) {
  const lines = [
    `<title>${escapeAttr(head.title)}</title>`,
    `<meta name="description" content="${escapeAttr(head.description)}" />`,
  ]
  if (head.canonical) {
    lines.push(`<link rel="canonical" href="${escapeAttr(head.canonical)}" />`)
  }
  if (head.noindex) {
    lines.push('<meta name="robots" content="noindex" />')
  }
  lines.push(
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="SMARA" />',
    `<meta property="og:title" content="${escapeAttr(head.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(head.description)}" />`
  )
  if (head.canonical) {
    lines.push(`<meta property="og:url" content="${escapeAttr(head.canonical)}" />`)
  }
  lines.push(
    `<meta property="og:image" content="${escapeAttr(head.image)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${escapeAttr(head.imageAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(head.description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(head.image)}" />`,
    `<meta name="twitter:image:alt" content="${escapeAttr(head.imageAlt)}" />`
  )
  if (head.preloadHero) {
    lines.push(
      '<link rel="preload" as="image" href="/images/smara1a.webp" type="image/webp" data-hero-preload="" />'
    )
  }
  return lines.map((line) => `    ${line}`).join('\n')
}

function pageHtml(appHtml, head) {
  let html = template.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `<!--seo:start-->\n${seoBlock(head)}\n    <!--seo:end-->`)
  html = html.replace('<!--app-html-->', appHtml)
  if (html.includes('<!--app-html-->') || html.includes('vite.svg')) {
    throw new Error(`Prerender left a placeholder in ${head.title}`)
  }
  if (!html.includes('<script type="module"')) {
    throw new Error(`Prerendered ${head.title} is missing the client bundle`)
  }
  return html
}

for (const route of routes) {
  const { html: appHtml, head } = render(route)
  if (!appHtml.includes(markers[route]) || !appHtml.includes('<h1')) {
    throw new Error(`Prerendered ${route} did not include its page content`)
  }
  const html = pageHtml(appHtml, head)
  if (!html.includes(`<title>${head.title}</title>`) && !html.includes(`<title>${head.title.replaceAll('&', '&amp;')}</title>`)) {
    if (!html.includes('<title>')) throw new Error(`Missing title for ${route}`)
  }
  const file = route === '/' ? path.join(distDir, 'index.html') : path.join(distDir, route.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
  console.log(`prerendered ${route} -> ${path.relative(distDir, file)} (${html.length} bytes)`)
}

const notFound = render('/this-page-does-not-exist')
if (!notFound.html.includes('Page not found')) {
  throw new Error('404 prerender did not include the not-found page')
}
const notFoundHtml = pageHtml(notFound.html, notFound.head)
if (!notFoundHtml.includes('name="robots" content="noindex"')) {
  throw new Error('404 page is missing noindex')
}
fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml)
console.log(`prerendered 404 -> 404.html (${notFoundHtml.length} bytes)`)
