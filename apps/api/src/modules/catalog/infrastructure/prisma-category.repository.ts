import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import type { CategoryRepository } from '../application/ports/category.repository.js';
import type { CategorySummary } from '../domain/category.types.js';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishedWithCounts(): Promise<CategorySummary[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
                archivedAt: null,
              },
            },
          },
        },
      },
    });

    return categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.description,
      // Always emit the key (null if unset) so clients never miss the field.
      imageUrl: category.imageUrl ?? null,
      productCount: category._count.products,
    }));
  }
}
