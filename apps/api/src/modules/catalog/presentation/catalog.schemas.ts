import { z } from 'zod';

export const listProductsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  featured: z.preprocess((value) => {
    if (value === undefined || value === '') {
      return undefined;
    }

    if (value === true || value === 'true') {
      return true;
    }

    if (value === false || value === 'false') {
      return false;
    }

    return value;
  }, z.boolean().optional()),
  minPriceMinor: z.coerce.number().int().nonnegative().optional(),
  maxPriceMinor: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListProductsQueryDto = z.infer<typeof listProductsQuerySchema>;

export const productSlugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

export type ProductSlugParamDto = z.infer<typeof productSlugParamSchema>;
