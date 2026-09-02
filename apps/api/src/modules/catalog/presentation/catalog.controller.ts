import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetProductBySlugUseCase } from '../application/get-product-by-slug.use-case.js';
import { ListProductsUseCase } from '../application/list-products.use-case.js';
import {
  listProductsQuerySchema,
  productSlugParamSchema,
} from './catalog.schemas.js';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe.js';

@Controller('products')
export class CatalogController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProductBySlug: GetProductBySlugUseCase,
  ) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(listProductsQuerySchema))
    query: ReturnType<typeof listProductsQuerySchema.parse>,
  ) {
    return this.listProducts.execute(query);
  }

  @Get(':slug')
  getBySlug(
    @Param(new ZodValidationPipe(productSlugParamSchema))
    params: ReturnType<typeof productSlugParamSchema.parse>,
  ) {
    return this.getProductBySlug.execute(params);
  }
}
