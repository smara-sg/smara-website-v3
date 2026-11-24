import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

export type EventImage = { src: string; width?: number; height?: number; alt?: string; position?: string };

export default function EventPhotoCarousel({ title, images }: { title: string; images: EventImage[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element || images.length < 2 || paused || hovered || focused) return;
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.25 });
    observer.observe(element);
    const timer = window.setInterval(() => {
      const image = element.querySelector('img');
      if (visible && !document.hidden && image?.complete && image.naturalWidth > 0) {
        setIndex(current => (current + 1) % images.length);
      }
    }, 2000);
    return () => { observer.disconnect(); window.clearInterval(timer); };
  }, [images.length, paused, hovered, focused]);

  if (!images.length) return null;
  const image = images[index];
  return (
    <div
      ref={frame}
      className="relative aspect-[4/3] shrink-0 overflow-hidden"
      role="region"
      aria-label={`Photos for ${title}`}
      aria-roledescription="carousel"
      onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
      <OptimizedImage
        src={image.src}
        alt={image.alt ?? `${title} - Image ${index + 1}`}
        width={image.width}
        height={image.height}
        sizes="(min-width: 1152px) 347px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, calc(100vw - 48px)"
        fill
        animateChanges
        nextImage={images[(index + 1) % images.length]}
        objectPosition={image.position ?? '50% 50%'}
      />
      {images.length > 1 && <>
        <button onClick={() => setIndex(current => (current + images.length - 1) % images.length)} className="icon-btn left-3" aria-label={`Previous image for ${title}`}>
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => setIndex(current => (current + 1) % images.length)} className="icon-btn right-3" aria-label={`Next image for ${title}`}>
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => setPaused(current => !current)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm"
          aria-label={`${paused ? 'Play' : 'Pause'} slideshow for ${title}`}
        >
          {paused ? <Play size={15} /> : <Pause size={15} />}
        </button>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
          {images.map((_, imageIndex) => <button
            key={imageIndex}
            onClick={() => setIndex(imageIndex)}
            aria-label={`View image ${imageIndex + 1} for ${title}`}
            aria-current={index === imageIndex ? 'true' : undefined}
            className="inline-flex h-11 w-11 items-center justify-center"
          >
            <span aria-hidden="true" className={`h-2 w-2 rounded-full transition-colors ${index === imageIndex ? 'bg-white' : 'bg-white/50'}`} />
          </button>)}
        </div>
      </>}
    </div>
  );
}
