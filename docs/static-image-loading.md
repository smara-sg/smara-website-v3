# Static image delivery

Display photos and artwork use the existing Netlify Image CDN with responsive width candidates and quality 95. Source files are untouched. Browsers choose the appropriate derivative for the CSS display size and device pixel ratio, up to the source’s native width. The service negotiates modern formats and caches each derivative at the edge.

The shared `OptimizedImage` component handles homepage art, event photos, portraits, gallery art, art cards, AR preview thumbnails and the collection page. Accurate `sizes` hints reflect their layouts. Any transform failure falls back to the original source without retry loops. Local Vite development uses original files.

The top artwork carousel mounts only its selected slide; invisible slides no longer compete for initial bandwidth. Logos and QR PNGs, animated GIFs, existing optimized day/night wallpaper assets, and external photos with their own compression URLs stay on their existing delivery paths. Video, audio, original artwork downloads and AR canvas capture sources are not changed.

Responsive high-quality derivatives are intended to preserve visible display quality. They are not byte-identical or lossless copies; originals remain available at their existing paths. No additional image service account or dependency is introduced.

References:
- https://docs.netlify.com/build/image-cdn/overview/
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img
# Carousel interaction

All Artwork and Events carousels use the shared responsive image delivery. They retain the same image element between slides so the previous image can remain visible while the next one downloads. A 360 ms, 12 px glide-and-fade runs only after the replacement image loads. The image frames clip motion at their edges. Reduced-motion preferences disable this animation and the arrow press response.

Only the next slide is warmed at low priority, after 300 ms and only when the carousel is within 100 px of the viewport. The preload uses the same `sizes` and `srcset` as display, so the browser can reuse its screen-appropriate download. Data Saver and reported 2G connections skip this extra download. One-image carousels do not preload themselves. No animation libraries or image originals were added.

