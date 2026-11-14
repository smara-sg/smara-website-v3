import { useEffect, useRef, useState } from 'react'

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function MountainPicture({ name, eager }: { name: string; eager?: boolean }) {
  return (
    <picture className="absolute inset-0 block">
      <source media="(max-width: 767px)" srcSet={`/images/${name}-mobile.webp`} type="image/webp" />
      <source media="(max-width: 767px)" srcSet={`/images/${name}-mobile.jpg`} type="image/jpeg" />
      <source srcSet={`/images/${name}.webp`} type="image/webp" />
      <img
        src={`/images/${name}.jpg`}
        alt=""
        width={1280}
        height={720}
        className="h-full w-full object-cover object-center"
        decoding="async"
        fetchPriority={eager ? 'high' : 'low'}
        loading={eager ? 'eager' : 'lazy'}
      />
    </picture>
  )
}

export default function DayNightBackdrop() {
  const sunsetRef = useRef<HTMLDivElement>(null)
  const nightRef = useRef<HTMLDivElement>(null)
  const [showLater, setShowLater] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShowLater(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const sunsetEl = sunsetRef.current
    const nightEl = nightRef.current
    if (!sunsetEl || !nightEl) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const apply = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      const sunset = media.matches
        ? (progress >= 0.34 ? 1 : 0)
        : smoothstep(0.08, 0.48, progress)
      const night = media.matches
        ? (progress >= 0.67 ? 1 : 0)
        : smoothstep(0.42, 0.92, progress)
      sunsetEl.style.opacity = sunset.toFixed(3)
      nightEl.style.opacity = night.toFixed(3)
      document.querySelector('.over-landscape')?.classList.toggle('is-night', night >= 0.4)
    }

    const onScroll = () => {
      if (media.matches) {
        apply()
        return
      }
      if (!frame) frame = requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    media.addEventListener('change', apply)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      media.removeEventListener('change', apply)
      document.querySelector('.over-landscape')?.classList.remove('is-night')
      if (frame) cancelAnimationFrame(frame)
    }
  }, [showLater])

  return (
    <div className="day-night" aria-hidden="true">
      <div className="day-night__layer">
        <MountainPicture name="hero-mountains" eager />
      </div>
      {showLater && (
        <>
          <div ref={sunsetRef} className="day-night__layer day-night__fade">
            <MountainPicture name="hero-mountains-sunset" />
          </div>
          <div ref={nightRef} className="day-night__layer day-night__fade">
            <MountainPicture name="hero-mountains-night" />
          </div>
        </>
      )}
    </div>
  )
}
