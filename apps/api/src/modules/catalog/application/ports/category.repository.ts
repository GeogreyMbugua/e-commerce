import type { CategorySummary } from '../../domain/category.types.js';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface CategoryRepository {
  listPublishedWithCounts(): Promise<CategorySummary[]>;
}
