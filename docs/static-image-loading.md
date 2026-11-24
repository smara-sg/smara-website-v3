# Static image delivery

Display photos and artwork use the existing Netlify Image CDN with responsive width candidates and quality 95. Source files are untouched. Browsers choose the appropriate derivative for the CSS display size and device pixel ratio, up to the source’s native width. The service negotiates modern formats and caches each derivative at the edge.

The shared `OptimizedImage` component handles homepage art, event photos, portraits, gallery art, art cards, AR preview thumbnails and the collection page. Accurate `sizes` hints reflect their layouts. Any transform failure falls back to the original source without retry loops. Local Vite development uses original files.

The top artwork carousel mounts only its selected slide; invisible slides no longer compete for initial bandwidth. Logos and QR PNGs, animated GIFs, existing optimized day/night wallpaper assets, and external photos with their own compression URLs stay on their existing delivery paths. Video, audio, original artwork downloads and AR canvas capture sources are not changed.

Responsive high-quality derivatives are intended to preserve visible display quality. They are not byte-identical or lossless copies; originals remain available at their existing paths. No additional image service account or dependency is introduced.

References:
- https://docs.netlify.com/build/image-cdn/overview/
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img
