import type {
  AdminCategoryDetail,
  AdminMediaInput,
  AdminProductDetail,
  AdminProductMedia,
  AdminProductStatus,
  CreateAdminCategoryInput,
  CreateAdminProductInput,
  ListAdminProductsQuery,
  PaginatedAdminProducts,
  SetCategoryImageInput,
  UpdateAdminCategoryInput,
  UpdateAdminMediaInput,
  UpdateAdminProductInput,
} from '../../domain/admin-product.types.js';

export const ADMIN_CATALOG_REPOSITORY = Symbol('ADMIN_CATALOG_REPOSITORY');

export type CreateMediaFromUploadInput = {
  productId: string;
  publicUrl: string;
  storageKey?: string | null;
  altText?: string | null;
  isPrimary?: boolean;
};

export interface AdminCatalogRepository {
  listAdmin(query: ListAdminProductsQuery): Promise<PaginatedAdminProducts>;
  findAdminById(id: string): Promise<AdminProductDetail | null>;
  create(input: CreateAdminProductInput): Promise<AdminProductDetail>;
  update(id: string, input: UpdateAdminProductInput): Promise<AdminProductDetail>;
  setStatus(
    id: string,
    status: AdminProductStatus,
    archivedAt?: Date | null,
  ): Promise<AdminProductDetail>;
  addMedia(
    productId: string,
    input: AdminMediaInput,
  ): Promise<AdminProductMedia>;
  updateMedia(
    productId: string,
    mediaId: string,
    input: UpdateAdminMediaInput,
  ): Promise<AdminProductMedia>;
  deleteMedia(productId: string, mediaId: string): Promise<void>;
  reorderMedia(productId: string, mediaIds: string[]): Promise<AdminProductMedia[]>;
  createMediaFromUpload(
    input: CreateMediaFromUploadInput,
  ): Promise<AdminProductMedia>;
  replaceMediaFile(
    productId: string,
    mediaId: string,
    input: { url: string; storageKey: string | null; altText?: string | null },
  ): Promise<{ previousStorageKey: string | null; media: AdminProductMedia }>;
  findMedia(
    productId: string,
    mediaId: string,
  ): Promise<AdminProductMedia | null>;
  listAdminCategories(): Promise<AdminCategoryDetail[]>;
  createCategory(input: CreateAdminCategoryInput): Promise<AdminCategoryDetail>;
  updateCategory(
    id: string,
    input: UpdateAdminCategoryInput,
  ): Promise<AdminCategoryDetail>;
  setCategoryActive(id: string, isActive: boolean): Promise<AdminCategoryDetail>;
  findAdminCategoryById(id: string): Promise<AdminCategoryDetail | null>;
  setCategoryImage(
    id: string,
    input: SetCategoryImageInput,
  ): Promise<{ previousStorageKey: string | null; category: AdminCategoryDetail }>;
  clearCategoryImage(
    id: string,
  ): Promise<{ previousStorageKey: string | null; category: AdminCategoryDetail }>;
}
