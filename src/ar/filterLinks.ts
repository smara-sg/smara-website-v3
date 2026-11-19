export const filterSlugs = ['moonlit-lotus-pond', 'misty-mountain', 'tropical-beach', 'mandala'] as const;

export function filterPath(slug: string) {
  if (!filterSlugs.some(value => value === slug)) throw new Error('Unknown AR filter');
  return '/ar-camera/?filter=' + encodeURIComponent(slug);
}

export function publicFilterUrl(slug: string) {
  return new URL(filterPath(slug), 'https://smara.online').href;
}
