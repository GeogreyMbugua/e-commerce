import { Inject, Injectable } from '@nestjs/common';
import type { ListProductsQuery, PaginatedProducts } from '../domain/product.types.js';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from './ports/product.repository.js';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,
  ) {}

  execute(query: ListProductsQuery): Promise<PaginatedProducts> {
    return this.products.listPublished(query);
  }
}
