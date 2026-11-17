import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pageHead } from '../seo'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function removeMeta(attribute: 'name' | 'property', key: string) {
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove()
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }
  element.href = href
}

function removeLink(rel: string) {
  document.head.querySelector(`link[rel="${rel}"]`)?.remove()
}

export default function PageSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const head = pageHead(pathname)
    document.title = head.title
    upsertMeta('name', 'description', head.description)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', 'SMARA')
    upsertMeta('property', 'og:title', head.title)
    upsertMeta('property', 'og:description', head.description)
    upsertMeta('property', 'og:image', head.image)
    upsertMeta('property', 'og:image:width', '1200')
    upsertMeta('property', 'og:image:height', '630')
    upsertMeta('property', 'og:image:alt', head.imageAlt)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', head.title)
    upsertMeta('name', 'twitter:description', head.description)
    upsertMeta('name', 'twitter:image', head.image)
    upsertMeta('name', 'twitter:image:alt', head.imageAlt)

    if (head.canonical) {
      upsertLink('canonical', head.canonical)
      upsertMeta('property', 'og:url', head.canonical)
    } else {
      removeLink('canonical')
      removeMeta('property', 'og:url')
    }

    if (head.noindex) upsertMeta('name', 'robots', 'noindex')
    else removeMeta('name', 'robots')

    const existing = document.head.querySelectorAll('link[data-hero-preload]')
    if (head.preloadHero) {
      if (existing.length === 0) {
        const specs = [
          ['/images/hero-mountains.webp', '(min-width: 768px)'],
          ['/images/hero-mountains-mobile.webp', '(max-width: 767px)'],
        ] as const
        for (const [href, media] of specs) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.type = 'image/webp'
          link.href = href
          link.media = media
          link.setAttribute('data-hero-preload', '')
          document.head.appendChild(link)
        }
      }
    } else {
      existing.forEach((link) => link.remove())
    }
  }, [pathname])

  return null
}
