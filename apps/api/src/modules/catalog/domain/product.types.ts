export type ProductImage = {
  url: string;
  altText: string | null;
};

export type ProductCategorySummary = {
  slug: string;
  name: string;
};

export type ProductSummary = {
  slug: string;
  title: string;
  priceMinor: number;
  compareAtMinor: number | null;
  currency: string;
  conditionGrade: string;
  isUniqueItem: boolean;
  availableQuantity: number;
  isAvailable: boolean;
  primaryImage: ProductImage | null;
  category: ProductCategorySummary;
};

export type ProductDetail = ProductSummary & {
  description: string;
  conditionNotes: string | null;
  defects: string | null;
  testingNotes: string | null;
  restorationNotes: string | null;
  provenanceNotes: string | null;
  specifications: Record<string, unknown> | null;
  tags: string[];
  images: ProductImage[];
};

export type ListProductsQuery = {
  search?: string;
  category?: string;
  minPriceMinor?: number;
  maxPriceMinor?: number;
  sort: 'newest' | 'price_asc' | 'price_desc';
  cursor?: string;
  limit: number;
};

export type PaginatedProducts = {
  data: ProductSummary[];
  page: {
    nextCursor: string | null;
    hasMore: boolean;
  };
};
