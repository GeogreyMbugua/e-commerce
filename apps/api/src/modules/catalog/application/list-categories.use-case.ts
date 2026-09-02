import { Inject, Injectable } from '@nestjs/common';
import type { CategorySummary } from '../domain/category.types.js';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from './ports/category.repository.js';

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepository,
  ) {}

  execute(): Promise<CategorySummary[]> {
    return this.categories.listPublishedWithCounts();
  }
}
