import { imageSizes, type LocalImage } from '../imageSizes'
import { responsiveImage } from '../responsiveImages'

type Props = {
  src: string
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
  sizes?: string
  fetchPriority?: 'high' | 'low' | 'auto'
  objectPosition?: string
  animateChanges?: boolean
  nextImage?: { src: string; width?: number }
  /** Cover a relative or absolute parent. The parent needs a defined size. */
  fill?: boolean
  width?: number
  height?: number
}

function knownSize(src: string) {
  if (!src.startsWith('/images/')) return undefined
  const name = src.slice('/images/'.length)
  if (Object.prototype.hasOwnProperty.call(imageSizes, name)) {
    return imageSizes[name as LocalImage]
  }
  return undefined
}

export default function OptimizedImage({
  src,
  alt,
  className,
  loading = 'lazy',
  sizes = '100vw',
  fetchPriority = 'auto',
  objectPosition,
  animateChanges = false,
  nextImage,
  fill = false,
  width,
  height,
}: Props) {
  const imageRef = useRef<HTMLImageElement>(null)
  const nextSrc = nextImage?.src
  const nextWidth = nextImage?.width

  // Warm only the next screen-sized slide, only near a visible carousel.
  useEffect(() => {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }).connection
    if (!nextSrc || nextSrc === src || connection?.saveData
      || /(^|-)2g$/.test(connection?.effectiveType ?? '')
      || !imageRef.current || !('IntersectionObserver' in window)) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      timer = setTimeout(() => {
        const width = nextWidth ?? knownSize(nextSrc)?.width
        const variant = !import.meta.env.DEV && width ? responsiveImage(nextSrc, width) : undefined
        const preload = new Image()
        preload.decoding = 'async'
        preload.fetchPriority = 'low'
        if (variant) {
          preload.sizes = sizes
          preload.srcset = variant.srcSet
        }
        preload.src = variant?.src ?? nextSrc
      }, 300)
    }, { rootMargin: '100px' })
    observer.observe(imageRef.current)
    return () => { observer.disconnect(); clearTimeout(timer) }
  }, [nextSrc, nextWidth, sizes, src])

  const known = knownSize(src)
  const w = width ?? known?.width
  const h = height ?? known?.height
  if (!w || !h) {
    throw new Error(`Missing width and height for image ${src}`)
  }

  const imageClass = fill
    ? ['h-full w-full object-cover', className].filter(Boolean).join(' ')
    : className

  const responsive = import.meta.env.DEV ? undefined : responsiveImage(src, w)

  const image = (
    <img
      ref={imageRef}
      src={responsive?.src ?? src}
      srcSet={responsive?.srcSet}
      sizes={responsive ? sizes : undefined}
      alt={alt}
      width={w}
      height={h}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      className={imageClass}
      style={objectPosition ? { objectPosition } : undefined}
      onLoad={animateChanges ? (event) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        event.currentTarget.getAnimations().forEach(animation => animation.cancel())
        event.currentTarget.animate([
          { opacity: 0.65, transform: 'translateX(12px)' },
          { opacity: 1, transform: 'translateX(0)' },
        ], { duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
      } : undefined}
      onError={responsive ? (event) => {
        const image = event.currentTarget
        if (image.getAttribute('src') === src) return
        image.removeAttribute('srcset')
        image.removeAttribute('sizes')
        image.src = src
      } : undefined}
    />
  )

  if (responsive || !known?.webp) {
    if (!fill) return image
    return <div className="absolute inset-0">{image}</div>
  }

  const webpSrc = src.replace(/\.(png|jpe?g)$/i, '.webp')
  return (
    <picture className={fill ? 'absolute inset-0 block' : undefined}>
      <source srcSet={webpSrc} type="image/webp" />
      {image}
    </picture>
  )
}

import { useEffect, useRef } from 'react'
