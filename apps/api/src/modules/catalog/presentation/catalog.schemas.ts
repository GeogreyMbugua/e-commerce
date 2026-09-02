import { z } from 'zod';

export const listProductsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
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
