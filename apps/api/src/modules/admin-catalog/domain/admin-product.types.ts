export type AdminProductStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'UNAVAILABLE'
  | 'SOLD'
  | 'ARCHIVED';

export type AdminConditionGrade =
  | 'MINT'
  | 'EXCELLENT'
  | 'VERY_GOOD'
  | 'GOOD'
  | 'FAIR'
  | 'POOR';

export type AdminAvailabilityFilter =
  | 'in_stock'
  | 'out_of_stock'
  | 'reserved';

export type AdminProductMedia = {
  id: string;
  url: string;
  storageKey: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type AdminInventorySummary = {
  quantityAvailable: number;
  quantityReserved: number;
  status: string;
} | null;

export type AdminProductCategory = {
  id: string;
  slug: string;
  name: string;
};

export type AdminProductDetail = {
  id: string;
  slug: string;
  sku: string | null;
  title: string;
  brand: string | null;
  model: string | null;
  shortDescription: string | null;
  description: string;
  status: AdminProductStatus;
  priceMinor: number;
  compareAtMinor: number | null;
  currency: string;
  conditionGrade: AdminConditionGrade;
  conditionNotes: string | null;
  defects: string | null;
  testingNotes: string | null;
  restorationNotes: string | null;
  provenanceNotes: string | null;
  specifications: Record<string, unknown> | null;
  tags: string[];
  isUniqueItem: boolean;
  isFeatured: boolean;
  category: AdminProductCategory;
  media: AdminProductMedia[];
  inventory: AdminInventorySummary;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

export type ListAdminProductsQuery = {
  search?: string;
  category?: string;
  status?: AdminProductStatus;
  availability?: AdminAvailabilityFilter;
  cursor?: string;
  limit: number;
};

export type PaginatedAdminProducts = {
  data: AdminProductDetail[];
  page: {
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export type AdminMediaInput = {
  url: string;
  storageKey?: string | null;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type CreateAdminProductInput = {
  title: string;
  slug?: string;
  sku?: string | null;
  brand?: string | null;
  model?: string | null;
  shortDescription?: string | null;
  description: string;
  categoryId: string;
  priceMinor: number;
  compareAtMinor?: number | null;
  currency?: string;
  conditionGrade: AdminConditionGrade;
  conditionNotes?: string | null;
  defects?: string | null;
  testingNotes?: string | null;
  restorationNotes?: string | null;
  provenanceNotes?: string | null;
  specifications?: Record<string, unknown> | null;
  tags?: string[];
  isUniqueItem?: boolean;
  isFeatured?: boolean;
  status?: AdminProductStatus;
  quantityAvailable?: number;
  media?: AdminMediaInput[];
};

export type UpdateAdminProductInput = {
  title?: string;
  slug?: string;
  sku?: string | null;
  brand?: string | null;
  model?: string | null;
  shortDescription?: string | null;
  description?: string;
  categoryId?: string;
  priceMinor?: number;
  compareAtMinor?: number | null;
  currency?: string;
  conditionGrade?: AdminConditionGrade;
  conditionNotes?: string | null;
  defects?: string | null;
  testingNotes?: string | null;
  restorationNotes?: string | null;
  provenanceNotes?: string | null;
  specifications?: Record<string, unknown> | null;
  tags?: string[];
  isUniqueItem?: boolean;
  isFeatured?: boolean;
  quantityAvailable?: number;
};

export type UpdateAdminMediaInput = {
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type AdminCategoryDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageStorageKey: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SetCategoryImageInput = {
  url: string;
  storageKey: string;
};

export type CreateAdminCategoryInput = {
  name: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
};

export type UpdateAdminCategoryInput = {
  name?: string;
  slug?: string;
  description?: string | null;
};
