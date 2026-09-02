import type { CatalogProductImage } from "@/types/catalog";
import type { Product } from "@/types/product";

/** Placeholder when a product has no media in the catalog. */
export const DEFAULT_PRODUCT_IMAGE = "/images/products/sony-ta.webp";

/**
 * Normalizes a catalog media URL to a renderable src.
 * Returns a site-relative path or absolute CDN URL — does not apply basePath.
 */
export const normalizeProductImageUrl = (
  url: string | null | undefined,
): string => {
  if (!url) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return url.startsWith("/") ? url : `/${url}`;
};

export const productImageAlt = (
  image: CatalogProductImage | null | undefined,
  productTitle: string,
): string => image?.altText?.trim() || productTitle;

export const getProductPreviewUrl = (
  product: Product,
  index = 0,
): string =>
  normalizeProductImageUrl(
    product.imgs?.previews?.[index] ??
      product.primaryImageUrl ??
      DEFAULT_PRODUCT_IMAGE,
  );

export const getProductPreviewAlt = (product: Product, index = 0): string =>
  product.imgs?.alts?.[index] ?? product.imageAlt ?? product.title;
