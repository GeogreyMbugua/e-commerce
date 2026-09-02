import { z } from 'zod';

export const createCartBodySchema = z.object({
  currency: z.string().length(3).optional(),
});

export const cartLineBodySchema = z.object({
  productSlug: z.string().trim().min(1),
  quantity: z.coerce.number().int().positive().default(1),
});

export const updateCartLineBodySchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

export const cartProductSlugParamSchema = z.object({
  productSlug: z.string().trim().min(1),
});

export const cartTokenHeaderSchema = z.object({
  'x-cart-token': z.string().trim().min(1),
});
