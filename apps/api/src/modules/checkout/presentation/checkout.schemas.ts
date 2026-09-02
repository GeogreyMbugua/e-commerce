import { z } from 'zod';

export const createQuoteBodySchema = z.object({
  shippingMethod: z.enum(['standard', 'pickup']).optional(),
});

export const createCheckoutSessionBodySchema = z.object({
  email: z.string().trim().email(),
  shippingMethod: z.enum(['standard', 'pickup']).optional(),
});
