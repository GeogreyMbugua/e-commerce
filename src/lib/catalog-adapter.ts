import type { CatalogProductDetail, CatalogProductSummary } from "@/types/catalog";
import type { Product } from "@/types/product";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/product-images";

const slugIdMap = new Map<string, number>();

const stableNumericId = (slug: string) => {
  const existing = slugIdMap.get(slug);
  if (existing) {
    return existing;
  }

  const nextId = slugIdMap.size + 1;
  slugIdMap.set(slug, nextId);
  return nextId;
};

export const toViewProduct = (
  product: CatalogProductSummary | CatalogProductDetail,
): Product => {
  const images =
    "images" in product && product.images.length > 0
      ? product.images
      : product.primaryImage
        ? [product.primaryImage]
        : [];
  const imageUrl = images[0]?.url || DEFAULT_PRODUCT_IMAGE;
  const imageAlts = images.map(
    (image) => image.altText?.trim() || product.title,
  );

  return {
    slug: product.slug,
    title: product.title,
    reviews: 0,
    price: (product.compareAtMinor ?? product.priceMinor) / 100,
    discountedPrice: product.priceMinor / 100,
    id: stableNumericId(product.slug),
    isAvailable: product.isAvailable,
    conditionGrade: product.conditionGrade,
    categorySlug: product.category.slug,
    imgs: {
      thumbnails: images.map((image) => image.url),
      previews: images.map((image) => image.url),
      alts: imageAlts,
    },
    primaryImageUrl: imageUrl,
    imageAlt: imageAlts[0] ?? product.title,
  };
};

export const toViewProducts = (products: CatalogProductSummary[]) =>
  products.map(toViewProduct);
