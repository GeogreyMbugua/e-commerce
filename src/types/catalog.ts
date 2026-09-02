export type CatalogProductImage = {
  url: string;
  altText: string | null;
};

export type CatalogCategory = {
  slug: string;
  name: string;
  description?: string | null;
  productCount: number;
};

export type CatalogProductSummary = {
  slug: string;
  title: string;
  priceMinor: number;
  compareAtMinor: number | null;
  currency: string;
  conditionGrade: string;
  isUniqueItem: boolean;
  availableQuantity: number;
  isAvailable: boolean;
  primaryImage: CatalogProductImage | null;
  category: {
    slug: string;
    name: string;
  };
};

export type CatalogProductDetail = CatalogProductSummary & {
  description: string;
  conditionNotes: string | null;
  defects: string | null;
  testingNotes: string | null;
  restorationNotes: string | null;
  provenanceNotes: string | null;
  specifications: Record<string, unknown> | null;
  tags: string[];
  images: CatalogProductImage[];
};

export type CatalogProductsResponse = {
  data: CatalogProductSummary[];
  page: {
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export type CatalogSort = "newest" | "price_asc" | "price_desc";

export type CatalogListParams = {
  search?: string;
  category?: string;
  minPriceMinor?: number;
  maxPriceMinor?: number;
  sort?: CatalogSort;
  cursor?: string;
  limit?: number;
};
