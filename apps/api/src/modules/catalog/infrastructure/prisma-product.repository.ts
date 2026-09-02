import type { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import { getSellableQuantity } from '../../../shared/inventory/inventory.utils.js';
import type { ProductRepository } from '../application/ports/product.repository.js';
import type {
  ListProductsQuery,
  PaginatedProducts,
  ProductDetail,
  ProductImage,
  ProductSummary,
} from '../domain/product.types.js';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    media: true;
    inventory: true;
  };
}>;

const publishedProductWhere = (
  query: Pick<
    ListProductsQuery,
    'search' | 'category' | 'minPriceMinor' | 'maxPriceMinor'
  >,
): Prisma.ProductWhereInput => ({
  status: 'ACTIVE',
  archivedAt: null,
  ...(query.category
    ? {
        category: {
          slug: query.category,
        },
      }
    : {}),
  ...(query.search
    ? {
        OR: [
          {
            title: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      }
    : {}),
  ...(query.minPriceMinor !== undefined || query.maxPriceMinor !== undefined
    ? {
        priceMinor: {
          ...(query.minPriceMinor !== undefined
            ? { gte: query.minPriceMinor }
            : {}),
          ...(query.maxPriceMinor !== undefined
            ? { lte: query.maxPriceMinor }
            : {}),
        },
      }
    : {}),
});

const sortOrder = (
  sort: ListProductsQuery['sort'],
): Prisma.ProductOrderByWithRelationInput[] => {
  switch (sort) {
    case 'price_asc':
      return [{ priceMinor: 'asc' }, { id: 'asc' }];
    case 'price_desc':
      return [{ priceMinor: 'desc' }, { id: 'desc' }];
    case 'newest':
    default:
      return [{ createdAt: 'desc' }, { id: 'desc' }];
  }
};

const toImage = (media: ProductWithRelations['media'][number]): ProductImage => ({
  url: media.url,
  altText: media.altText,
});

const toSummary = (product: ProductWithRelations): ProductSummary => {
  const sellableQuantity = getSellableQuantity(product.inventory);
  const primaryMedia =
    product.media.find((media) => media.isPrimary) ?? product.media[0] ?? null;

  return {
    slug: product.slug,
    title: product.title,
    priceMinor: product.priceMinor,
    compareAtMinor: product.compareAtMinor,
    currency: product.currency,
    conditionGrade: product.conditionGrade,
    isUniqueItem: product.isUniqueItem,
    availableQuantity: sellableQuantity,
    isAvailable: sellableQuantity > 0,
    primaryImage: primaryMedia ? toImage(primaryMedia) : null,
    category: {
      slug: product.category.slug,
      name: product.category.name,
    },
  };
};

const toDetail = (product: ProductWithRelations): ProductDetail => ({
  ...toSummary(product),
  description: product.description,
  conditionNotes: product.conditionNotes,
  defects: product.defects,
  testingNotes: product.testingNotes,
  restorationNotes: product.restorationNotes,
  provenanceNotes: product.provenanceNotes,
  specifications:
    product.specifications &&
    typeof product.specifications === 'object' &&
    !Array.isArray(product.specifications)
      ? (product.specifications as Record<string, unknown>)
      : null,
  tags: product.tags,
  images: product.media.map(toImage),
});

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished(query: ListProductsQuery): Promise<PaginatedProducts> {
    const products = await this.prisma.product.findMany({
      where: publishedProductWhere(query),
      orderBy: sortOrder(query.sort),
      take: query.limit + 1,
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
      include: {
        category: true,
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        inventory: true,
      },
    });

    const hasMore = products.length > query.limit;
    const pageItems = hasMore ? products.slice(0, query.limit) : products;

    return {
      data: pageItems.map(toSummary),
      page: {
        nextCursor: hasMore ? pageItems.at(-1)?.id ?? null : null,
        hasMore,
      },
    };
  }

  async findPublishedBySlug(slug: string): Promise<ProductDetail | null> {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: 'ACTIVE',
        archivedAt: null,
      },
      include: {
        category: true,
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        inventory: true,
      },
    });

    return product ? toDetail(product) : null;
  }
}
