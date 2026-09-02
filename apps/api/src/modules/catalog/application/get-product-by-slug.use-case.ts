import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ProductDetail } from '../domain/product.types.js';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from './ports/product.repository.js';

@Injectable()
export class GetProductBySlugUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,
  ) {}

  async execute(input: { slug: string }): Promise<ProductDetail> {
    const product = await this.products.findPublishedBySlug(input.slug);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return product;
  }
}
