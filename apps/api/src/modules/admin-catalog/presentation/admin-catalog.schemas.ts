import { z } from 'zod';

export const conditionGradeSchema = z.enum([
  'MINT',
  'EXCELLENT',
  'VERY_GOOD',
  'GOOD',
  'FAIR',
  'POOR',
]);

export const productStatusSchema = z.enum([
  'DRAFT',
  'ACTIVE',
  'UNAVAILABLE',
  'SOLD',
  'ARCHIVED',
]);

export const listAdminProductsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  status: productStatusSchema.optional(),
  availability: z.enum(['in_stock', 'out_of_stock', 'reserved']).optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListAdminProductsQueryDto = z.infer<
  typeof listAdminProductsQuerySchema
>;

export const productIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const productMediaParamsSchema = z.object({
  id: z.string().trim().min(1),
  mediaId: z.string().trim().min(1),
});

export const categoryIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

const mediaInputSchema = z.object({
  url: z.string().trim().url(),
  altText: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  isPrimary: z.boolean().optional(),
});

const specificationsSchema = z
  .record(z.string(), z.unknown())
  .nullable()
  .optional();

export const createProductSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case')
    .optional(),
  sku: z.string().trim().min(1).max(100).nullable().optional(),
  brand: z.string().trim().min(1).max(120).nullable().optional(),
  model: z.string().trim().min(1).max(120).nullable().optional(),
  shortDescription: z.string().trim().max(500).nullable().optional(),
  description: z.string().trim().min(1),
  categoryId: z.string().trim().min(1),
  priceMinor: z.number().int().nonnegative(),
  compareAtMinor: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().trim().length(3).default('USD'),
  conditionGrade: conditionGradeSchema,
  conditionNotes: z.string().trim().nullable().optional(),
  defects: z.string().trim().nullable().optional(),
  testingNotes: z.string().trim().nullable().optional(),
  restorationNotes: z.string().trim().nullable().optional(),
  provenanceNotes: z.string().trim().nullable().optional(),
  specifications: specificationsSchema,
  tags: z.array(z.string().trim().min(1)).default([]),
  isUniqueItem: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  status: productStatusSchema.optional(),
  quantityAvailable: z.number().int().nonnegative().optional(),
  media: z.array(mediaInputSchema).optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

export const updateProductSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case')
      .optional(),
    sku: z.string().trim().min(1).max(100).nullable().optional(),
    brand: z.string().trim().min(1).max(120).nullable().optional(),
    model: z.string().trim().min(1).max(120).nullable().optional(),
    shortDescription: z.string().trim().max(500).nullable().optional(),
    description: z.string().trim().min(1).optional(),
    categoryId: z.string().trim().min(1).optional(),
    priceMinor: z.number().int().nonnegative().optional(),
    compareAtMinor: z.number().int().nonnegative().nullable().optional(),
    currency: z.string().trim().length(3).optional(),
    conditionGrade: conditionGradeSchema.optional(),
    conditionNotes: z.string().trim().nullable().optional(),
    defects: z.string().trim().nullable().optional(),
    testingNotes: z.string().trim().nullable().optional(),
    restorationNotes: z.string().trim().nullable().optional(),
    provenanceNotes: z.string().trim().nullable().optional(),
    specifications: specificationsSchema,
    tags: z.array(z.string().trim().min(1)).optional(),
    isUniqueItem: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    quantityAvailable: z.number().int().nonnegative().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required.',
  });

export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export const addMediaByUrlSchema = z.object({
  url: z.string().trim().url(),
  altText: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  isPrimary: z.boolean().optional(),
});

export type AddMediaByUrlDto = z.infer<typeof addMediaByUrlSchema>;

export const updateMediaSchema = z
  .object({
    altText: z.string().trim().nullable().optional(),
    sortOrder: z.number().int().nonnegative().optional(),
    isPrimary: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required.',
  });

export type UpdateMediaDto = z.infer<typeof updateMediaSchema>;

export const reorderMediaSchema = z.object({
  mediaIds: z.array(z.string().trim().min(1)).min(1),
});

export type ReorderMediaDto = z.infer<typeof reorderMediaSchema>;

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case')
    .optional(),
  description: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case')
      .optional(),
    description: z.string().trim().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required.',
  });

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

export const importCommitRowSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1),
  categoryId: z.string().trim().min(1),
  priceMinor: z.number().int().nonnegative(),
  conditionGrade: conditionGradeSchema,
  brand: z.string().trim().min(1).max(120).nullable().optional(),
  model: z.string().trim().min(1).max(120).nullable().optional(),
  shortDescription: z.string().trim().max(500).nullable().optional(),
  compareAtMinor: z.number().int().nonnegative().nullable().optional(),
  quantityAvailable: z.number().int().nonnegative().optional(),
  isUniqueItem: z.boolean().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  conditionNotes: z.string().trim().nullable().optional(),
  defects: z.string().trim().nullable().optional(),
  testingNotes: z.string().trim().nullable().optional(),
  imageUrl: z.string().trim().url().nullable().optional(),
  sku: z.string().trim().min(1).max(100).nullable().optional(),
});

export const importCommitSchema = z.object({
  rows: z.array(importCommitRowSchema).min(1).max(200),
});

export type ImportCommitDto = z.infer<typeof importCommitSchema>;

export const importPublishSchema = z.object({
  productIds: z.array(z.string().trim().min(1)).min(1).max(200),
});

export type ImportPublishDto = z.infer<typeof importPublishSchema>;

export const importPreviewRowsSchema = z.object({
  rows: z
    .array(
      z.object({
        title: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
        price: z.union([z.string(), z.number()]).nullable().optional(),
        conditionGrade: z.string().nullable().optional(),
        brand: z.string().nullable().optional(),
        model: z.string().nullable().optional(),
        shortDescription: z.string().nullable().optional(),
        compareAtPrice: z.union([z.string(), z.number()]).nullable().optional(),
        quantity: z.union([z.string(), z.number()]).nullable().optional(),
        isUniqueItem: z
          .union([z.string(), z.boolean()])
          .nullable()
          .optional(),
        tags: z.string().nullable().optional(),
        conditionNotes: z.string().nullable().optional(),
        defects: z.string().nullable().optional(),
        testingNotes: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
        sku: z.string().nullable().optional(),
      }),
    )
    .min(1)
    .max(500),
});

export type ImportPreviewRowsDto = z.infer<typeof importPreviewRowsSchema>;
