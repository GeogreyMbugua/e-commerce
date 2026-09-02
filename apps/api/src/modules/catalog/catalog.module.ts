import { Module } from '@nestjs/common';
import { GetProductBySlugUseCase } from './application/get-product-by-slug.use-case.js';
import { ListCategoriesUseCase } from './application/list-categories.use-case.js';
import { ListProductsUseCase } from './application/list-products.use-case.js';
import { CATEGORY_REPOSITORY } from './application/ports/category.repository.js';
import { PRODUCT_REPOSITORY } from './application/ports/product.repository.js';
import { PrismaCategoryRepository } from './infrastructure/prisma-category.repository.js';
import { PrismaProductRepository } from './infrastructure/prisma-product.repository.js';
import { CatalogController } from './presentation/catalog.controller.js';
import { CategoriesController } from './presentation/categories.controller.js';

@Module({
  controllers: [CatalogController, CategoriesController],
  providers: [
    ListProductsUseCase,
    GetProductBySlugUseCase,
    ListCategoriesUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
  ],
})
export class CatalogModule {}
