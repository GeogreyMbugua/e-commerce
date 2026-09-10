export const slugify = (title: string): string => {
  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug.length > 0 ? slug : 'product';
};

/** Internal stock/reference code — not shown to shoppers. */
export const generateSku = (seed?: string): string => {
  const base = seed
    ? seed
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '')
        .slice(0, 10)
    : '';
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return base.length >= 3 ? `AV-${base}-${suffix}` : `AV-${suffix}`;
};
