import type {
  CatalogCategory,
  CatalogListParams,
  CatalogProductsResponse,
  CatalogProductDetail,
} from "@/types/catalog";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001/api/v1";

const buildUrl = (path: string, params?: Record<string, string | number | undefined>) => {
  const url = new URL(`${apiBaseUrl}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

async function catalogFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchProducts(
  params: CatalogListParams = {},
): Promise<CatalogProductsResponse> {
  return catalogFetch<CatalogProductsResponse>(
    buildUrl("/products", {
      search: params.search,
      category: params.category,
      featured:
        params.featured === undefined ? undefined : String(params.featured),
      minPriceMinor: params.minPriceMinor,
      maxPriceMinor: params.maxPriceMinor,
      sort: params.sort ?? "newest",
      cursor: params.cursor,
      limit: params.limit ?? 20,
    }),
  );
}

export async function fetchProductBySlug(
  slug: string,
): Promise<CatalogProductDetail> {
  return catalogFetch<CatalogProductDetail>(buildUrl(`/products/${slug}`));
}

export const FALLBACK_PRODUCT_SLUGS = [
  "sony-ta-stereo-amplifier",
  "technics-sl-1200mk2-turntable",
  "vintage-integrated-stereo-amplifier",
  "classic-stereo-receiver",
  "curated-vinyl-records",
  "vintage-cassette-deck",
  "pre-owned-music-cds",
  "classic-film-and-music-collection",
] as const;

export async function fetchProductSlugs(): Promise<Array<{ slug: string }>> {
  try {
    const slugs: string[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const response = await fetchProducts({
        limit: 50,
        sort: "newest",
        cursor,
      });

      for (const product of response.data) {
        slugs.push(product.slug);
      }

      hasMore = response.page.hasMore;
      cursor = response.page.nextCursor ?? undefined;

      if (!hasMore || !cursor) {
        break;
      }
    }

    if (slugs.length === 0) {
      return FALLBACK_PRODUCT_SLUGS.map((slug) => ({ slug }));
    }

    return slugs.map((slug) => ({ slug }));
  } catch {
    return FALLBACK_PRODUCT_SLUGS.map((slug) => ({ slug }));
  }
}

export async function fetchCategories(): Promise<CatalogCategory[]> {
  return catalogFetch<CatalogCategory[]>(buildUrl("/categories"));
}
