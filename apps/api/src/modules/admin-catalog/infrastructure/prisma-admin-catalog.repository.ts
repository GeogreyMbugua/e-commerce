import { Prisma } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import type {
  AdminCatalogRepository,
  CreateMediaFromUploadInput,
} from '../application/ports/admin-catalog.repository.js';
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
} from '../domain/admin-product.types.js';
import { slugify, generateSku } from '../domain/slugify.js';

type AdminProductRecord = Prisma.ProductGetPayload<{
  include: {
    category: true;
    media: true;
    inventory: true;
  };
}>;

const toSpecifications = (
  value: Prisma.JsonValue | null | undefined,
): Record<string, unknown> | null => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
};

const toMedia = (
  media: AdminProductRecord['media'][number],
): AdminProductMedia => ({
  id: media.id,
  url: media.url,
  storageKey: media.storageKey,
  altText: media.altText,
  sortOrder: media.sortOrder,
  isPrimary: media.isPrimary,
});

const toAdminProduct = (product: AdminProductRecord): AdminProductDetail => ({
  id: product.id,
  slug: product.slug,
  sku: product.sku,
  title: product.title,
  brand: product.brand,
  model: product.model,
  shortDescription: product.shortDescription,
  description: product.description,
  status: product.status,
  priceMinor: product.priceMinor,
  compareAtMinor: product.compareAtMinor,
  currency: product.currency,
  conditionGrade: product.conditionGrade,
  conditionNotes: product.conditionNotes,
  defects: product.defects,
  testingNotes: product.testingNotes,
  restorationNotes: product.restorationNotes,
  provenanceNotes: product.provenanceNotes,
  specifications: toSpecifications(product.specifications),
  tags: product.tags,
  isUniqueItem: product.isUniqueItem,
  isFeatured: product.isFeatured,
  category: {
    id: product.category.id,
    slug: product.category.slug,
    name: product.category.name,
  },
  media: product.media.map(toMedia),
  inventory: product.inventory
    ? {
        quantityAvailable: product.inventory.quantityAvailable,
        quantityReserved: product.inventory.quantityReserved,
        status: product.inventory.status,
      }
    : null,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
  archivedAt: product.archivedAt?.toISOString() ?? null,
});

const adminInclude = {
  category: true,
  media: {
    orderBy: { sortOrder: 'asc' as const },
  },
  inventory: true,
} satisfies Prisma.ProductInclude;

const toCategoryDetail = (
  category: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    imageStorageKey: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: { products: number };
  },
): AdminCategoryDetail => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  description: category.description,
  imageUrl: category.imageUrl,
  imageStorageKey: category.imageStorageKey,
  isActive: category.isActive,
  productCount: category._count?.products ?? 0,
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString(),
});

const isUniqueConstraintError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: string }).code === 'P2002';

@Injectable()
export class PrismaAdminCatalogRepository implements AdminCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let candidate = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!existing || existing.id === excludeId) {
        return candidate;
      }

      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  private async ensureUniqueSku(baseSku: string): Promise<string> {
    let candidate = baseSku;
    let suffix = 2;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { sku: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }

      candidate = `${baseSku}-${suffix}`;
      suffix += 1;
    }
  }

  private async ensureUniqueCategorySlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let candidate = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!existing || existing.id === excludeId) {
        return candidate;
      }

      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  private async loadProduct(id: string): Promise<AdminProductDetail> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: adminInclude,
    });

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return toAdminProduct(product);
  }

  async listAdmin(query: ListAdminProductsQuery): Promise<PaginatedAdminProducts> {
    const filters: Prisma.ProductWhereInput[] = [];

    if (query.status) {
      filters.push({ status: query.status });
    }

    if (query.category) {
      filters.push({
        OR: [
          { categoryId: query.category },
          { category: { slug: query.category } },
        ],
      });
    }

    if (query.search) {
      filters.push({
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { brand: { contains: query.search, mode: 'insensitive' } },
          { model: { contains: query.search, mode: 'insensitive' } },
          { sku: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          {
            shortDescription: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (query.availability === 'in_stock') {
      filters.push({
        inventory: {
          quantityAvailable: { gt: 0 },
          status: 'AVAILABLE',
        },
      });
    }

    if (query.availability === 'out_of_stock') {
      filters.push({
        OR: [
          { inventory: null },
          { inventory: { quantityAvailable: { lte: 0 } } },
        ],
      });
    }

    if (query.availability === 'reserved') {
      filters.push({
        inventory: {
          quantityReserved: { gt: 0 },
        },
      });
    }

    const where: Prisma.ProductWhereInput =
      filters.length > 0 ? { AND: filters } : {};

    const products = await this.prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
      include: adminInclude,
    });

    const hasMore = products.length > query.limit;
    const pageItems = hasMore ? products.slice(0, query.limit) : products;

    return {
      data: pageItems.map(toAdminProduct),
      page: {
        nextCursor: hasMore ? pageItems.at(-1)?.id ?? null : null,
        hasMore,
      },
    };
  }

  async findAdminById(id: string): Promise<AdminProductDetail | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: adminInclude,
    });

    return product ? toAdminProduct(product) : null;
  }

  async create(input: CreateAdminProductInput): Promise<AdminProductDetail> {
    const category = await this.prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found.',
      });
    }

    const slug = await this.ensureUniqueSlug(
      input.slug?.trim() || slugify(input.title),
    );
    const status = input.status ?? 'DRAFT';
    const sku =
      input.sku?.trim() ||
      (await this.ensureUniqueSku(
        generateSku(input.brand || input.model || input.title),
      ));
    const quantityAvailable = input.quantityAvailable ?? 1;
    const isUniqueItem = input.isUniqueItem ?? true;

    try {
      const product = await this.prisma.product.create({
        data: {
          slug,
          sku,
          title: input.title,
          brand: input.brand ?? null,
          model: input.model ?? null,
          shortDescription: input.shortDescription ?? null,
          description: input.description,
          status,
          categoryId: input.categoryId,
          priceMinor: input.priceMinor,
          compareAtMinor: input.compareAtMinor ?? null,
          currency: input.currency ?? 'USD',
          conditionGrade: input.conditionGrade,
          conditionNotes: input.conditionNotes ?? null,
          defects: input.defects ?? null,
          testingNotes: input.testingNotes ?? null,
          restorationNotes: input.restorationNotes ?? null,
          provenanceNotes: input.provenanceNotes ?? null,
          specifications:
            input.specifications === undefined
              ? undefined
              : input.specifications === null
                ? Prisma.JsonNull
                : (input.specifications as Prisma.InputJsonValue),
          tags: input.tags ?? [],
          isUniqueItem,
          isFeatured: input.isFeatured ?? false,
          archivedAt: status === 'ARCHIVED' ? new Date() : null,
          inventory: {
            create: {
              quantityAvailable,
              quantityReserved: 0,
              status: quantityAvailable > 0 ? 'AVAILABLE' : 'ARCHIVED',
            },
          },
          ...(input.media && input.media.length > 0
            ? {
                media: {
                  create: input.media.map((item, index) => ({
                    url: item.url,
                    altText: item.altText ?? null,
                    sortOrder: item.sortOrder ?? index,
                    isPrimary: item.isPrimary ?? index === 0,
                  })),
                },
              }
            : {}),
        },
        include: adminInclude,
      });

      return toAdminProduct(product);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException({
          code: 'PRODUCT_CONFLICT',
          message: 'A product with this slug or SKU already exists.',
        });
      }

      throw error;
    }
  }

  async update(
    id: string,
    input: UpdateAdminProductInput,
  ): Promise<AdminProductDetail> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    if (input.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: input.categoryId },
        select: { id: true },
      });

      if (!category) {
        throw new NotFoundException({
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found.',
        });
      }
    }

    const nextSlug =
      input.slug !== undefined
        ? await this.ensureUniqueSlug(
            input.slug.trim() || slugify(input.title ?? existing.title),
            id,
          )
        : undefined;

    try {
      await this.prisma.$transaction(async (tx) => {
        const data: Prisma.ProductUncheckedUpdateInput = {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
          ...(input.sku !== undefined
            ? { sku: input.sku?.trim() || null }
            : {}),
          ...(input.brand !== undefined ? { brand: input.brand } : {}),
          ...(input.model !== undefined ? { model: input.model } : {}),
          ...(input.shortDescription !== undefined
            ? { shortDescription: input.shortDescription }
            : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.categoryId !== undefined
            ? { categoryId: input.categoryId }
            : {}),
          ...(input.priceMinor !== undefined
            ? { priceMinor: input.priceMinor }
            : {}),
          ...(input.compareAtMinor !== undefined
            ? { compareAtMinor: input.compareAtMinor }
            : {}),
          ...(input.currency !== undefined ? { currency: input.currency } : {}),
          ...(input.conditionGrade !== undefined
            ? { conditionGrade: input.conditionGrade }
            : {}),
          ...(input.conditionNotes !== undefined
            ? { conditionNotes: input.conditionNotes }
            : {}),
          ...(input.defects !== undefined ? { defects: input.defects } : {}),
          ...(input.testingNotes !== undefined
            ? { testingNotes: input.testingNotes }
            : {}),
          ...(input.restorationNotes !== undefined
            ? { restorationNotes: input.restorationNotes }
            : {}),
          ...(input.provenanceNotes !== undefined
            ? { provenanceNotes: input.provenanceNotes }
            : {}),
          ...(input.specifications !== undefined
            ? {
                specifications:
                  input.specifications === null
                    ? Prisma.JsonNull
                    : (input.specifications as Prisma.InputJsonValue),
              }
            : {}),
          ...(input.tags !== undefined ? { tags: input.tags } : {}),
          ...(input.isUniqueItem !== undefined
            ? { isUniqueItem: input.isUniqueItem }
            : {}),
          ...(input.isFeatured !== undefined
            ? { isFeatured: input.isFeatured }
            : {}),
        };

        await tx.product.update({
          where: { id },
          data,
        });

        if (input.quantityAvailable !== undefined) {
          await tx.inventoryItem.upsert({
            where: { productId: id },
            update: {
              quantityAvailable: input.quantityAvailable,
              status: input.quantityAvailable > 0 ? 'AVAILABLE' : 'ARCHIVED',
            },
            create: {
              productId: id,
              quantityAvailable: input.quantityAvailable,
              quantityReserved: 0,
              status: input.quantityAvailable > 0 ? 'AVAILABLE' : 'ARCHIVED',
            },
          });
        }
      });

      return this.loadProduct(id);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException({
          code: 'PRODUCT_CONFLICT',
          message: 'A product with this slug or SKU already exists.',
        });
      }

      throw error;
    }
  }

  async setStatus(
    id: string,
    status: AdminProductStatus,
    archivedAt?: Date | null,
  ): Promise<AdminProductDetail> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: { inventory: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          status,
          archivedAt:
            archivedAt === undefined
              ? status === 'ARCHIVED'
                ? new Date()
                : null
              : archivedAt,
        },
      });

      if (status === 'SOLD' && existing.inventory) {
        await tx.inventoryItem.update({
          where: { productId: id },
          data: {
            status: 'SOLD',
            quantityAvailable: 0,
          },
        });
      }
    });

    return this.loadProduct(id);
  }

  async addMedia(
    productId: string,
    input: AdminMediaInput,
  ): Promise<AdminProductMedia> {
    await this.ensureProductExists(productId);

    return this.prisma.$transaction(async (tx) => {
      const maxSort = await tx.productMedia.aggregate({
        where: { productId },
        _max: { sortOrder: true },
      });
      const sortOrder = input.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1;
      const isPrimary = input.isPrimary ?? false;

      if (isPrimary) {
        await tx.productMedia.updateMany({
          where: { productId },
          data: { isPrimary: false },
        });
      }

      const media = await tx.productMedia.create({
        data: {
          productId,
          url: input.url,
          storageKey: input.storageKey ?? null,
          altText: input.altText ?? null,
          sortOrder,
          isPrimary,
        },
      });

      const count = await tx.productMedia.count({ where: { productId } });
      if (count === 1 && !media.isPrimary) {
        return tx.productMedia.update({
          where: { id: media.id },
          data: { isPrimary: true },
        });
      }

      return media;
    }).then(toMedia);
  }

  async updateMedia(
    productId: string,
    mediaId: string,
    input: UpdateAdminMediaInput,
  ): Promise<AdminProductMedia> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.productMedia.findFirst({
        where: { id: mediaId, productId },
      });

      if (!existing) {
        throw new NotFoundException({
          code: 'MEDIA_NOT_FOUND',
          message: 'Product media not found.',
        });
      }

      if (input.isPrimary === true) {
        await tx.productMedia.updateMany({
          where: { productId, id: { not: mediaId } },
          data: { isPrimary: false },
        });
      }

      const media = await tx.productMedia.update({
        where: { id: mediaId },
        data: {
          ...(input.altText !== undefined ? { altText: input.altText } : {}),
          ...(input.sortOrder !== undefined
            ? { sortOrder: input.sortOrder }
            : {}),
          ...(input.isPrimary !== undefined
            ? { isPrimary: input.isPrimary }
            : {}),
        },
      });

      return toMedia(media);
    });
  }

  async deleteMedia(productId: string, mediaId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.productMedia.findFirst({
        where: { id: mediaId, productId },
      });

      if (!existing) {
        throw new NotFoundException({
          code: 'MEDIA_NOT_FOUND',
          message: 'Product media not found.',
        });
      }

      await tx.productMedia.delete({ where: { id: mediaId } });

      if (existing.isPrimary) {
        const next = await tx.productMedia.findFirst({
          where: { productId },
          orderBy: { sortOrder: 'asc' },
        });

        if (next) {
          await tx.productMedia.update({
            where: { id: next.id },
            data: { isPrimary: true },
          });
        }
      }
    });
  }

  async reorderMedia(
    productId: string,
    mediaIds: string[],
  ): Promise<AdminProductMedia[]> {
    await this.ensureProductExists(productId);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.productMedia.findMany({
        where: { productId },
        select: { id: true },
      });

      const existingIds = new Set(existing.map((item) => item.id));

      if (
        mediaIds.length !== existingIds.size ||
        mediaIds.some((id) => !existingIds.has(id))
      ) {
        throw new ConflictException({
          code: 'MEDIA_ORDER_MISMATCH',
          message: 'mediaIds must include every media item for the product.',
        });
      }

      for (const [index, id] of mediaIds.entries()) {
        await tx.productMedia.update({
          where: { id },
          data: { sortOrder: index },
        });
      }

      const media = await tx.productMedia.findMany({
        where: { productId },
        orderBy: { sortOrder: 'asc' },
      });

      return media.map(toMedia);
    });
  }

  async createMediaFromUpload(
    input: CreateMediaFromUploadInput,
  ): Promise<AdminProductMedia> {
    return this.addMedia(input.productId, {
      url: input.publicUrl,
      storageKey: input.storageKey ?? null,
      altText: input.altText ?? null,
      isPrimary: input.isPrimary,
    });
  }

  async replaceMediaFile(
    productId: string,
    mediaId: string,
    input: { url: string; storageKey: string | null; altText?: string | null },
  ): Promise<{ previousStorageKey: string | null; media: AdminProductMedia }> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.productMedia.findFirst({
        where: { id: mediaId, productId },
      });

      if (!existing) {
        throw new NotFoundException({
          code: 'MEDIA_NOT_FOUND',
          message: 'Product media not found.',
        });
      }

      const media = await tx.productMedia.update({
        where: { id: mediaId },
        data: {
          url: input.url,
          storageKey: input.storageKey,
          ...(input.altText !== undefined ? { altText: input.altText } : {}),
        },
      });

      return {
        previousStorageKey: existing.storageKey,
        media: toMedia(media),
      };
    });
  }

  async findMedia(
    productId: string,
    mediaId: string,
  ): Promise<AdminProductMedia | null> {
    const media = await this.prisma.productMedia.findFirst({
      where: { id: mediaId, productId },
    });

    return media ? toMedia(media) : null;
  }

  async listAdminCategories(): Promise<AdminCategoryDetail[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return categories.map(toCategoryDetail);
  }

  async createCategory(
    input: CreateAdminCategoryInput,
  ): Promise<AdminCategoryDetail> {
    const slug = await this.ensureUniqueCategorySlug(
      input.slug?.trim() || slugify(input.name),
    );

    try {
      const category = await this.prisma.category.create({
        data: {
          name: input.name,
          slug,
          description: input.description ?? null,
          isActive: input.isActive ?? true,
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      return toCategoryDetail(category);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException({
          code: 'CATEGORY_CONFLICT',
          message: 'A category with this slug already exists.',
        });
      }

      throw error;
    }
  }

  async updateCategory(
    id: string,
    input: UpdateAdminCategoryInput,
  ): Promise<AdminCategoryDetail> {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found.',
      });
    }

    const slug =
      input.slug !== undefined
        ? await this.ensureUniqueCategorySlug(
            input.slug.trim() || slugify(input.name ?? existing.name),
            id,
          )
        : undefined;

    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(slug !== undefined ? { slug } : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      return toCategoryDetail(category);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException({
          code: 'CATEGORY_CONFLICT',
          message: 'A category with this slug already exists.',
        });
      }

      throw error;
    }
  }

  async setCategoryActive(
    id: string,
    isActive: boolean,
  ): Promise<AdminCategoryDetail> {
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: { isActive },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      return toCategoryDetail(category);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2025'
      ) {
        throw new NotFoundException({
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found.',
        });
      }

      throw error;
    }
  }

  async findAdminCategoryById(id: string): Promise<AdminCategoryDetail | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return category ? toCategoryDetail(category) : null;
  }

  async setCategoryImage(
    id: string,
    input: SetCategoryImageInput,
  ): Promise<{ previousStorageKey: string | null; category: AdminCategoryDetail }> {
    try {
      const existing = await this.prisma.category.findUnique({
        where: { id },
        select: { imageStorageKey: true },
      });

      if (!existing) {
        throw new NotFoundException({
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found.',
        });
      }

      const category = await this.prisma.category.update({
        where: { id },
        data: {
          imageUrl: input.url,
          imageStorageKey: input.storageKey,
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      return {
        previousStorageKey: existing.imageStorageKey,
        category: toCategoryDetail(category),
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2025'
      ) {
        throw new NotFoundException({
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found.',
        });
      }

      throw error;
    }
  }

  async clearCategoryImage(
    id: string,
  ): Promise<{ previousStorageKey: string | null; category: AdminCategoryDetail }> {
    try {
      const existing = await this.prisma.category.findUnique({
        where: { id },
        select: { imageStorageKey: true },
      });

      if (!existing) {
        throw new NotFoundException({
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found.',
        });
      }

      const category = await this.prisma.category.update({
        where: { id },
        data: {
          imageUrl: null,
          imageStorageKey: null,
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      return {
        previousStorageKey: existing.imageStorageKey,
        category: toCategoryDetail(category),
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2025'
      ) {
        throw new NotFoundException({
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found.',
        });
      }

      throw error;
    }
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }
  }
}
