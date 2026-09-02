import { z } from 'zod';

export const updateCustomerProfileSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).nullable().optional(),
});

export const customerAddressSchema = z.object({
  label: z.string().trim().min(1).optional(),
  type: z.enum(['SHIPPING', 'BILLING']).optional(),
  name: z.string().trim().min(1),
  line1: z.string().trim().min(1),
  line2: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1),
  region: z.string().trim().min(1).optional(),
  postalCode: z.string().trim().min(1),
  country: z.string().trim().min(2).max(2),
  phone: z.string().trim().min(1).optional(),
  isDefault: z.boolean().optional(),
});

export const claimOrderSchema = z.object({
  guestAccessToken: z.string().trim().min(1).optional(),
});

export const addressIdParamSchema = z.object({
  addressId: z.string().trim().min(1),
});

export const orderReferenceParamSchema = z.object({
  reference: z.string().trim().min(1),
});
