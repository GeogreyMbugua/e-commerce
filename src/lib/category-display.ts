/**
 * Storefront category visuals come from admin (`imageUrl`).
 * Optional short labels keep tight rails readable for long names.
 */
const SHORT_LABELS: Record<string, string> = {
  speakers: "Speakers",
  turntables: "Turntables",
  "amplifiers-receivers": "Amps",
  "vinyl-records": "Vinyl",
  cds: "CDs",
  cassettes: "Cassettes",
  dvds: "DVDs",
  "vhs-tapes": "VHS",
};

export function resolveCategoryImage(
  category: { slug: string; imageUrl?: string | null },
): string | null {
  const url = category.imageUrl?.trim();
  return url || null;
}

export function getCategoryShortLabel(slug: string, name: string): string {
  return SHORT_LABELS[slug] ?? name;
}

export function getCategoryInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}
