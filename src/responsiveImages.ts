const widths = [160, 240, 320, 480, 640, 800, 960, 1280, 1600, 1920, 2560];

/** Display-only derivatives. Originals remain the source for downloads and AR capture. */
export function responsiveImage(src: string, sourceWidth: number) {
  if (!/^\/images\/[^?#]+\.(jpe?g|webp)$/i.test(src)
    || !Number.isFinite(sourceWidth) || sourceWidth < 320) return undefined;
  const maximum = Math.floor(sourceWidth);
  const candidates = [...widths.filter(width => width < maximum), maximum];
  const url = (width: number) => '/.netlify/images?url=' + encodeURIComponent(src) + '&w=' + width + '&q=95';
  return {
    src: url(Math.min(960, maximum)),
    srcSet: candidates.map(width => `${url(width)} ${width}w`).join(', '),
  };
}
