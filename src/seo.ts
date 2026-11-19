export const SITE_URL = 'https://smara.online'
export const OG_IMAGE = `${SITE_URL}/images/og-image.jpg`
export const OG_IMAGE_ALT = 'Self-gaze meditation practice'

export type PageHead = {
  title: string
  description: string
  canonical?: string
  noindex: boolean
  preloadHero: boolean
  image: string
  imageAlt: string
}

const pages: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'SMARA — Self-Gaze Meditation Augmented Reality Art',
    description:
      'Self-gaze meditation augmented reality art. Discover inner peace as art, music, and your own reflection guide you inward.',
  },
  '/gallery': {
    title: 'SMARA Artworks For Sale',
    description:
      'SMARA artworks do more than just promote mental wellbeing. They also function as affordable art pieces to beautify homes, offices, hospitals, and schools.',
  },
  '/events': {
    title: 'SMARA Events',
    description:
      'Join our community for workshops, retreats, and gatherings focused on self-gaze meditation and mindful living.',
  },
  '/ar-experience': {
    title: 'Augment Reality (AR) Experience | SMARA',
    description: 'Explore SMARA’s interactive augmented reality camera filters as they become available.',
  },
  '/ar-camera': {
    title: 'AR Camera | SMARA',
    description: 'Experience SMARA artwork with your camera.',
  },
  '/about': {
    title: 'About SMARA',
    description:
      "SMARA is a mindfulness practice that involves a deep and direct gaze at one's own reflection, for relaxation, self-awareness, and self-acceptance.",
  },
  '/art-cards': {
    title: 'SMARA Art Cards',
    description:
      'Discover SMARA Art Cards, where beautiful artwork meets mindful technology. Transform art into interactive meditation.',
  },
}

function normalizePath(pathname: string) {
  if (!pathname) return '/'
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (withSlash.length > 1 && withSlash.endsWith('/')) return withSlash.slice(0, -1)
  return withSlash
}

export function pageHead(pathname: string): PageHead {
  const path = normalizePath(pathname)
  const page = pages[path]
  if (!page) {
    return {
      title: 'Page Not Found | SMARA',
      description:
        'That address does not match a page on SMARA. Explore self-gaze meditation, artworks, events, and about the practice.',
      noindex: true,
      preloadHero: false,
      image: OG_IMAGE,
      imageAlt: OG_IMAGE_ALT,
    }
  }

  return {
    title: page.title,
    description: page.description,
    // Netlify serves directory indexes at a trailing slash (/gallery → 301 /gallery/).
    canonical: `${SITE_URL}${path === '/' ? '/' : `${path}/`}`,
    noindex: path === '/ar-camera',
    preloadHero: path === '/',
    image: OG_IMAGE,
    imageAlt: OG_IMAGE_ALT,
  }
}

