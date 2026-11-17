import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { pageHead, type PageHead } from './seo'

export function render(url: string): { html: string; head: PageHead } {
  const head = pageHead(url)
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>
  )
  return { html, head }
}
