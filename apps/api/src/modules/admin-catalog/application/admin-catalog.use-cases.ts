import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryMediaStorageService } from '../../../shared/media/cloudinary-media-storage.service.js';
import {
  ADMIN_CATALOG_REPOSITORY,
  type AdminCatalogRepository,
} from './ports/admin-catalog.repository.js';
import type {
  AdminMediaInput,
  AdminProductDetail,
  AdminProductStatus,
  AdminCategoryDetail,
  CreateAdminCategoryInput,
  CreateAdminProductInput,
  ListAdminProductsQuery,
  PaginatedAdminProducts,
  UpdateAdminCategoryInput,
  UpdateAdminMediaInput,
  UpdateAdminProductInput,
} from '../domain/admin-product.types.js';
import { parseProductImportFile } from '../domain/parse-product-import-file.js';
import {
  buildImportTemplateCsv,
  summarizeImportRows,
  toCreateInput,
  validateImportRow,
  type ProductImportCommitRow,
  type ProductImportParseResult,
  type ProductImportRowInput,
} from '../domain/product-import.js';
const ALLOWED_UPLOAD_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const assertPublishable = (product: {
  title: string;
  categoryId?: string;
  category?: { id: string } | null;
  priceMinor: number;
  conditionGrade: string | null | undefined;
}) => {
  const missing: string[] = [];

  if (!product.title?.trim()) {
    missing.push('title');
  }

  if (!product.categoryId && !product.category?.id) {
    missing.push('category');
  }

  if (product.priceMinor === undefined || product.priceMinor < 0) {
    missing.push('priceMinor');
  }

  if (!product.conditionGrade) {
    missing.push('conditionGrade');
  }

  if (missing.length > 0) {
    throw new BadRequestException({
      code: 'PRODUCT_NOT_PUBLISHABLE',
      message: `Product cannot be published. Missing or invalid: ${missing.join(', ')}.`,
      fields: missing,
    });
  }
};

const assertImageFile = (file: Express.Multer.File) => {
  if (!ALLOWED_UPLOAD_MIME.has(file.mimetype)) {
    throw new BadRequestException({
      code: 'INVALID_MEDIA_TYPE',
      message: 'Only JPEG, PNG, WebP, and GIF images are allowed.',
    });
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new BadRequestException({
      code: 'MEDIA_TOO_LARGE',
      message: 'Image must be 8MB or smaller.',
    });
  }
};

@Injectable()
export class ListAdminProductsUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  execute(query: ListAdminProductsQuery): Promise<PaginatedAdminProducts> {
    return this.catalog.listAdmin(query);
  }
}

@Injectable()
export class GetAdminProductUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  async execute(id: string): Promise<AdminProductDetail> {
    const product = await this.catalog.findAdminById(id);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return product;
  }
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  execute(input: CreateAdminProductInput): Promise<AdminProductDetail> {
    return this.catalog.create(input);
  }
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  execute(
    id: string,
    input: UpdateAdminProductInput,
  ): Promise<AdminProductDetail> {
    return this.catalog.update(id, input);
  }
}

@Injectable()
export class ChangeProductStatusUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  async execute(
    id: string,
    status: AdminProductStatus,
  ): Promise<AdminProductDetail> {
    const product = await this.catalog.findAdminById(id);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    if (status === 'ACTIVE') {
      assertPublishable({
        title: product.title,
        categoryId: product.category.id,
        priceMinor: product.priceMinor,
        conditionGrade: product.conditionGrade,
      });

      return this.catalog.setStatus(id, 'ACTIVE', null);
    }

    if (status === 'ARCHIVED') {
      return this.catalog.setStatus(id, 'ARCHIVED', new Date());
    }

    return this.catalog.setStatus(id, status, null);
  }
}

@Injectable()
export class AddProductMediaUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  async execute(
    productId: string,
    input: AdminMediaInput,
  ): Promise<AdminProductDetail> {
    await this.catalog.addMedia(productId, input);
    const product = await this.catalog.findAdminById(productId);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return product;
  }
}

@Injectable()
export class UploadProductMediaUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
    private readonly mediaStorage: CloudinaryMediaStorageService,
  ) {}

  async execute(input: {
    productId: string;
    file: Express.Multer.File;
    altText?: string | null;
  }): Promise<AdminProductDetail> {
    const product = await this.catalog.findAdminById(input.productId);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    assertImageFile(input.file);

    const uploaded = await this.mediaStorage.uploadImage({
      buffer: input.file.buffer,
      mimeType: input.file.mimetype,
      folderSuffix: input.productId,
      originalName: input.file.originalname,
    });

    await this.catalog.createMediaFromUpload({
      productId: input.productId,
      publicUrl: uploaded.url,
      storageKey: uploaded.storageKey,
      altText: input.altText ?? null,
      isPrimary: product.media.length === 0,
    });

    const updated = await this.catalog.findAdminById(input.productId);

    if (!updated) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return updated;
  }
}

@Injectable()
export class ReplaceProductMediaUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
    private readonly mediaStorage: CloudinaryMediaStorageService,
  ) {}

  async execute(input: {
    productId: string;
    mediaId: string;
    file: Express.Multer.File;
    altText?: string | null;
  }): Promise<AdminProductDetail> {
    const existing = await this.catalog.findMedia(
      input.productId,
      input.mediaId,
    );

    if (!existing) {
      throw new NotFoundException({
        code: 'MEDIA_NOT_FOUND',
        message: 'Product media not found.',
      });
    }

    assertImageFile(input.file);

    const uploaded = await this.mediaStorage.uploadImage({
      buffer: input.file.buffer,
      mimeType: input.file.mimetype,
      folderSuffix: input.productId,
      originalName: input.file.originalname,
    });

    const replaced = await this.catalog.replaceMediaFile(
      input.productId,
      input.mediaId,
      {
        url: uploaded.url,
        storageKey: uploaded.storageKey,
        altText: input.altText,
      },
    );

    if (replaced.previousStorageKey) {
      await this.mediaStorage.deleteImage(replaced.previousStorageKey);
    }

    const product = await this.catalog.findAdminById(input.productId);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return product;
  }
}

@Injectable()
export class UpdateProductMediaUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  async execute(
    productId: string,
    mediaId: string,
    input: UpdateAdminMediaInput,
  ): Promise<AdminProductDetail> {
    await this.catalog.updateMedia(productId, mediaId, input);
    const product = await this.catalog.findAdminById(productId);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return product;
  }
}

@Injectable()
export class DeleteProductMediaUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
    private readonly mediaStorage: CloudinaryMediaStorageService,
  ) {}

  async execute(
    productId: string,
    mediaId: string,
  ): Promise<AdminProductDetail> {
    const existing = await this.catalog.findMedia(productId, mediaId);

    if (!existing) {
      throw new NotFoundException({
        code: 'MEDIA_NOT_FOUND',
        message: 'Product media not found.',
      });
    }

    await this.catalog.deleteMedia(productId, mediaId);

    if (existing.storageKey) {
      await this.mediaStorage.deleteImage(existing.storageKey);
    }

    const product = await this.catalog.findAdminById(productId);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return product;
  }
}

@Injectable()
export class ReorderProductMediaUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  async execute(
    productId: string,
    mediaIds: string[],
  ): Promise<AdminProductDetail> {
    await this.catalog.reorderMedia(productId, mediaIds);
    const product = await this.catalog.findAdminById(productId);

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return product;
  }
}

@Injectable()
export class ListAdminCategoriesUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  execute() {
    return this.catalog.listAdminCategories();
  }
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  execute(input: CreateAdminCategoryInput) {
    return this.catalog.createCategory(input);
  }
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  execute(id: string, input: UpdateAdminCategoryInput) {
    return this.catalog.updateCategory(id, input);
  }
}

@Injectable()
export class SetCategoryActiveUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  execute(id: string, isActive: boolean) {
    return this.catalog.setCategoryActive(id, isActive);
  }
}

@Injectable()
export class UploadCategoryImageUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
    private readonly mediaStorage: CloudinaryMediaStorageService,
  ) {}

  async execute(input: {
    categoryId: string;
    file: Express.Multer.File;
  }): Promise<AdminCategoryDetail> {
    const existing = await this.catalog.findAdminCategoryById(input.categoryId);

    if (!existing) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found.',
      });
    }

    assertImageFile(input.file);

    const uploaded = await this.mediaStorage.uploadImage({
      buffer: input.file.buffer,
      mimeType: input.file.mimetype,
      folderSuffix: `categories/${input.categoryId}`,
      originalName: input.file.originalname,
    });

    const { previousStorageKey, category } = await this.catalog.setCategoryImage(
      input.categoryId,
      {
        url: uploaded.url,
        storageKey: uploaded.storageKey,
      },
    );

    if (previousStorageKey && previousStorageKey !== uploaded.storageKey) {
      await this.mediaStorage.deleteImage(previousStorageKey);
    }

    return category;
  }
}

@Injectable()
export class DeleteCategoryImageUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
    private readonly mediaStorage: CloudinaryMediaStorageService,
  ) {}

  async execute(categoryId: string): Promise<AdminCategoryDetail> {
    const existing = await this.catalog.findAdminCategoryById(categoryId);

    if (!existing) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found.',
      });
    }

    const { previousStorageKey, category } =
      await this.catalog.clearCategoryImage(categoryId);

    if (previousStorageKey) {
      await this.mediaStorage.deleteImage(previousStorageKey);
    }

    return category;
  }
}

@Injectable()
export class ParseProductImportUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  async executeFromFile(file: Express.Multer.File): Promise<ProductImportParseResult> {
    let rawRows: ProductImportRowInput[];

    try {
      rawRows = parseProductImportFile({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      });
    } catch (error) {
      throw new BadRequestException({
        code: 'IMPORT_PARSE_FAILED',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to parse import file.',
      });
    }

    return this.buildPreview(rawRows);
  }

  async executeFromRows(
    rows: ProductImportRowInput[],
  ): Promise<ProductImportParseResult> {
    return this.buildPreview(rows);
  }

  async templateCsv(): Promise<string> {
    const categories = await this.catalog.listAdminCategories();
    const example =
      categories.find((category) => category.isActive)?.slug ?? 'turntables';
    return buildImportTemplateCsv(example);
  }

  private async buildPreview(
    rawRows: ProductImportRowInput[],
  ): Promise<ProductImportParseResult> {
    if (rawRows.length === 0) {
      throw new BadRequestException({
        code: 'IMPORT_EMPTY',
        message: 'No product rows found in the file.',
      });
    }

    if (rawRows.length > 500) {
      throw new BadRequestException({
        code: 'IMPORT_TOO_LARGE',
        message: 'Import is limited to 500 rows at a time.',
      });
    }

    const categories = await this.catalog.listAdminCategories();
    const lookups = categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      isActive: category.isActive,
    }));

    const rows = rawRows.map((raw, index) =>
      validateImportRow(index + 2, raw, lookups),
    );

    return {
      rows,
      summary: summarizeImportRows(rows),
    };
  }
}

@Injectable()
export class CommitProductImportUseCase {
  constructor(
    @Inject(ADMIN_CATALOG_REPOSITORY)
    private readonly catalog: AdminCatalogRepository,
  ) {}

  async execute(rows: ProductImportCommitRow[]): Promise<{
    created: AdminProductDetail[];
    failed: Array<{ index: number; title: string; message: string }>;
  }> {
    const created: AdminProductDetail[] = [];
    const failed: Array<{ index: number; title: string; message: string }> = [];

    for (const [index, row] of rows.entries()) {
      try {
        const product = await this.catalog.create(toCreateInput(row));
        created.push(product);
      } catch (error) {
        failed.push({
          index,
          title: row.title,
          message: extractErrorMessage(error),
        });
      }
    }

    return { created, failed };
  }
}

@Injectable()
export class PublishImportedProductsUseCase {
  constructor(private readonly changeStatus: ChangeProductStatusUseCase) {}

  async execute(productIds: string[]): Promise<{
    published: AdminProductDetail[];
    failed: Array<{ productId: string; message: string }>;
  }> {
    const published: AdminProductDetail[] = [];
    const failed: Array<{ productId: string; message: string }> = [];

    for (const productId of productIds) {
      try {
        const product = await this.changeStatus.execute(productId, 'ACTIVE');
        published.push(product);
      } catch (error) {
        failed.push({
          productId,
          message: extractErrorMessage(error),
        });
      }
    }

    return { published, failed };
  }
}

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof HttpException) {
    const response = error.getResponse();
    if (typeof response === 'string') return response;
    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      const message = (response as { message?: string | string[] }).message;
      if (Array.isArray(message)) return message.join(', ');
      if (typeof message === 'string') return message;
    }
    return error.message;
  }

  if (error instanceof Error) return error.message;
  return 'Unable to complete import action.';
};
