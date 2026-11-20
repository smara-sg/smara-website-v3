export const workingFilterSlugs = ['moonlit-mandala', 'mountain-mandala'] as const;
export const filterSlugs = ['tropical-mandala', ...workingFilterSlugs] as const;

export function filterPath(slug: string) {
  if (!filterSlugs.some(value => value === slug)) throw new Error('Unknown AR filter');
  const path = workingFilterSlugs.some(value => value === slug) ? '/hiddenpage/camera/' : '/ar-camera/';
  return path + '?filter=' + encodeURIComponent(slug);
}

export function publicFilterUrl(slug: string) {
  return new URL(filterPath(slug), 'https://smara.online').href;
}
