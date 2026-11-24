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
  fill = false,
  width,
  height,
}: Props) {
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

