import type {
  ListProductsQuery,
  PaginatedProducts,
  ProductDetail,
} from '../../domain/product.types.js';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepository {
  listPublished(query: ListProductsQuery): Promise<PaginatedProducts>;
  findPublishedBySlug(slug: string): Promise<ProductDetail | null>;
}
