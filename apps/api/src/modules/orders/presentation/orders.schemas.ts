import { z } from 'zod';

export const lookupOrderSchema = z.object({
  reference: z.string().trim().min(1),
  email: z.string().trim().email(),
});

export type LookupOrderBody = z.infer<typeof lookupOrderSchema>;
