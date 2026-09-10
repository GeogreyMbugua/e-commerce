import { Module } from '@nestjs/common';
import {
  AddProductMediaUseCase,
  ChangeProductStatusUseCase,
  CreateCategoryUseCase,
  CreateProductUseCase,
  DeleteCategoryImageUseCase,
  DeleteProductMediaUseCase,
  GetAdminProductUseCase,
  ListAdminCategoriesUseCase,
  ListAdminProductsUseCase,
  ReorderProductMediaUseCase,
  ReplaceProductMediaUseCase,
  SetCategoryActiveUseCase,
  UpdateCategoryUseCase,
  UpdateProductMediaUseCase,
  UpdateProductUseCase,
  UploadCategoryImageUseCase,
  UploadProductMediaUseCase,
} from './application/admin-catalog.use-cases.js';
import { ADMIN_CATALOG_REPOSITORY } from './application/ports/admin-catalog.repository.js';
import { PrismaAdminCatalogRepository } from './infrastructure/prisma-admin-catalog.repository.js';
import { AdminCategoriesController } from './presentation/admin-categories.controller.js';
import { AdminProductsController } from './presentation/admin-products.controller.js';

@Module({
  controllers: [AdminProductsController, AdminCategoriesController],
  providers: [
    ListAdminProductsUseCase,
    GetAdminProductUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    ChangeProductStatusUseCase,
    AddProductMediaUseCase,
    UploadProductMediaUseCase,
    ReplaceProductMediaUseCase,
    UpdateProductMediaUseCase,
    DeleteProductMediaUseCase,
    ReorderProductMediaUseCase,
    ListAdminCategoriesUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    SetCategoryActiveUseCase,
    UploadCategoryImageUseCase,
    DeleteCategoryImageUseCase,
    {
      provide: ADMIN_CATALOG_REPOSITORY,
      useClass: PrismaAdminCatalogRepository,
    },
  ],
})
export class AdminCatalogModule {}
