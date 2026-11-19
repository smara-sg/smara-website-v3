export const filterSlugs = ['moonlit-lotus-pond', 'misty-mountain', 'tropical-beach'] as const;

export function filterPath(slug: string) {
  if (!filterSlugs.some(value => value === slug)) throw new Error('Unknown AR filter');
  return '/ar-experience/?filter=' + encodeURIComponent(slug);
}

export function publicFilterUrl(slug: string) {
  return new URL(filterPath(slug), 'https://smara.online').href;
}
