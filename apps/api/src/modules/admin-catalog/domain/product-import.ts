import type {
  AdminConditionGrade,
  CreateAdminProductInput,
} from './admin-product.types.js';

export const PRODUCT_IMPORT_COLUMNS = [
  'title',
  'description',
  'category',
  'price',
  'conditionGrade',
  'brand',
  'model',
  'shortDescription',
  'compareAtPrice',
  'quantity',
  'isUniqueItem',
  'tags',
  'conditionNotes',
  'defects',
  'testingNotes',
  'imageUrl',
  'sku',
] as const;

export type ProductImportColumn = (typeof PRODUCT_IMPORT_COLUMNS)[number];

export type ImportRowSeverity = 'ok' | 'warning' | 'error';

export type ProductImportRowInput = {
  title?: string | null;
  description?: string | null;
  category?: string | null;
  price?: string | number | null;
  conditionGrade?: string | null;
  brand?: string | null;
  model?: string | null;
  shortDescription?: string | null;
  compareAtPrice?: string | number | null;
  quantity?: string | number | null;
  isUniqueItem?: string | boolean | null;
  tags?: string | null;
  conditionNotes?: string | null;
  defects?: string | null;
  testingNotes?: string | null;
  imageUrl?: string | null;
  sku?: string | null;
};

export type ProductImportRowPreview = {
  rowNumber: number;
  severity: ImportRowSeverity;
  errors: string[];
  warnings: string[];
  raw: ProductImportRowInput;
  normalized: {
    title: string;
    description: string;
    categoryId: string | null;
    categoryLabel: string;
    priceMinor: number | null;
    compareAtMinor: number | null;
    conditionGrade: AdminConditionGrade | null;
    brand: string | null;
    model: string | null;
    shortDescription: string | null;
    quantityAvailable: number;
    isUniqueItem: boolean;
    tags: string[];
    conditionNotes: string | null;
    defects: string | null;
    testingNotes: string | null;
    imageUrl: string | null;
    sku: string | null;
  };
};

export type ProductImportParseResult = {
  rows: ProductImportRowPreview[];
  summary: {
    total: number;
    ok: number;
    warning: number;
    error: number;
  };
};

export type ProductImportCommitRow = {
  title: string;
  description: string;
  categoryId: string;
  priceMinor: number;
  conditionGrade: AdminConditionGrade;
  brand?: string | null;
  model?: string | null;
  shortDescription?: string | null;
  compareAtMinor?: number | null;
  quantityAvailable?: number;
  isUniqueItem?: boolean;
  tags?: string[];
  conditionNotes?: string | null;
  defects?: string | null;
  testingNotes?: string | null;
  imageUrl?: string | null;
  sku?: string | null;
};

export type CategoryLookup = {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
};

const CONDITION_ALIASES: Record<string, AdminConditionGrade> = {
  mint: 'MINT',
  excellent: 'EXCELLENT',
  'very good': 'VERY_GOOD',
  very_good: 'VERY_GOOD',
  verygood: 'VERY_GOOD',
  good: 'GOOD',
  fair: 'FAIR',
  poor: 'POOR',
};

const HEADER_ALIASES: Record<string, ProductImportColumn> = {
  title: 'title',
  name: 'title',
  product: 'title',
  product_name: 'title',
  description: 'description',
  desc: 'description',
  category: 'category',
  category_slug: 'category',
  category_name: 'category',
  price: 'price',
  price_usd: 'price',
  amount: 'price',
  condition: 'conditionGrade',
  condition_grade: 'conditionGrade',
  conditiongrade: 'conditionGrade',
  brand: 'brand',
  model: 'model',
  short_description: 'shortDescription',
  shortdescription: 'shortDescription',
  compare_at_price: 'compareAtPrice',
  compareatprice: 'compareAtPrice',
  compare_at: 'compareAtPrice',
  quantity: 'quantity',
  qty: 'quantity',
  stock: 'quantity',
  is_unique_item: 'isUniqueItem',
  isuniqueitem: 'isUniqueItem',
  unique: 'isUniqueItem',
  tags: 'tags',
  condition_notes: 'conditionNotes',
  conditionnotes: 'conditionNotes',
  defects: 'defects',
  testing_notes: 'testingNotes',
  testingnotes: 'testingNotes',
  image_url: 'imageUrl',
  imageurl: 'imageUrl',
  image: 'imageUrl',
  sku: 'sku',
};

const normalizeHeader = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

export const mapImportHeaders = (
  headers: string[],
): Partial<Record<ProductImportColumn, number>> => {
  const mapping: Partial<Record<ProductImportColumn, number>> = {};

  headers.forEach((header, index) => {
    const key = HEADER_ALIASES[normalizeHeader(header)];
    if (key && mapping[key] === undefined) {
      mapping[key] = index;
    }
  });

  return mapping;
};

const asTrimmed = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

const parseMoneyToMinor = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value * 100);
  }

  const raw = String(value).trim().replace(/[$,]/g, '');
  if (!raw) return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
};

const parseQuantity = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return null;
  return n;
};

const parseBoolean = (value: unknown, defaultValue: boolean): boolean => {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  const text = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(text)) return true;
  if (['false', '0', 'no', 'n'].includes(text)) return false;
  return defaultValue;
};

const parseCondition = (value: unknown): AdminConditionGrade | null => {
  const text = asTrimmed(value);
  if (!text) return null;

  const grades: AdminConditionGrade[] = [
    'MINT',
    'EXCELLENT',
    'VERY_GOOD',
    'GOOD',
    'FAIR',
    'POOR',
  ];
  const upper = text.toUpperCase().replace(/\s+/g, '_');
  if (grades.includes(upper as AdminConditionGrade)) {
    return upper as AdminConditionGrade;
  }

  const normalized = text.toLowerCase().replace(/_/g, ' ');
  const compact = normalized.replace(/\s+/g, '');
  return CONDITION_ALIASES[normalized] ?? CONDITION_ALIASES[compact] ?? null;
};

const parseTags = (value: unknown): string[] => {
  const text = asTrimmed(value);
  if (!text) return [];
  return text
    .split(/[,|;]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const isLikelyUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const resolveCategory = (
  label: string | null,
  categories: CategoryLookup[],
): CategoryLookup | null => {
  if (!label) return null;
  const needle = label.trim().toLowerCase();
  return (
    categories.find((c) => c.slug.toLowerCase() === needle) ??
    categories.find((c) => c.name.toLowerCase() === needle) ??
    null
  );
};

export const rowFromMappedValues = (
  values: Partial<Record<ProductImportColumn, unknown>>,
): ProductImportRowInput => ({
  title: asTrimmed(values.title),
  description: asTrimmed(values.description),
  category: asTrimmed(values.category),
  price: values.price as string | number | null | undefined,
  conditionGrade: asTrimmed(values.conditionGrade),
  brand: asTrimmed(values.brand),
  model: asTrimmed(values.model),
  shortDescription: asTrimmed(values.shortDescription),
  compareAtPrice: values.compareAtPrice as string | number | null | undefined,
  quantity: values.quantity as string | number | null | undefined,
  isUniqueItem: values.isUniqueItem as string | boolean | null | undefined,
  tags: asTrimmed(values.tags),
  conditionNotes: asTrimmed(values.conditionNotes),
  defects: asTrimmed(values.defects),
  testingNotes: asTrimmed(values.testingNotes),
  imageUrl: asTrimmed(values.imageUrl),
  sku: asTrimmed(values.sku),
});

export const validateImportRow = (
  rowNumber: number,
  raw: ProductImportRowInput,
  categories: CategoryLookup[],
): ProductImportRowPreview => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const title = asTrimmed(raw.title);
  const description = asTrimmed(raw.description);
  const categoryLabel = asTrimmed(raw.category) ?? '';
  const category = resolveCategory(asTrimmed(raw.category), categories);
  const priceMinor = parseMoneyToMinor(raw.price);
  const compareAtMinor = parseMoneyToMinor(raw.compareAtPrice);
  const conditionGrade = parseCondition(raw.conditionGrade);
  const quantityParsed = parseQuantity(raw.quantity);
  const imageUrl = asTrimmed(raw.imageUrl);

  if (!title) errors.push('title is required');
  if (!description) errors.push('description is required');
  if (!categoryLabel) errors.push('category is required');
  else if (!category) errors.push(`Unknown category "${categoryLabel}"`);
  else if (!category.isActive) {
    errors.push(`Category "${category.name}" is inactive`);
  }

  if (priceMinor === null) errors.push('price must be a valid non-negative amount');
  if (!conditionGrade) {
    errors.push(
      'conditionGrade must be MINT, EXCELLENT, VERY_GOOD, GOOD, FAIR, or POOR',
    );
  }

  if (raw.quantity !== null && raw.quantity !== undefined && raw.quantity !== '') {
    if (quantityParsed === null) {
      errors.push('quantity must be a whole number >= 0');
    }
  }

  if (imageUrl && !isLikelyUrl(imageUrl)) {
    errors.push('imageUrl must be a valid http(s) URL');
  }

  if (!imageUrl) {
    warnings.push('No imageUrl — add photos before publishing if needed');
  }

  if (compareAtMinor !== null && priceMinor !== null && compareAtMinor < priceMinor) {
    warnings.push('compareAtPrice is lower than price');
  }

  let severity: ImportRowSeverity = 'ok';
  if (errors.length > 0) severity = 'error';
  else if (warnings.length > 0) severity = 'warning';

  return {
    rowNumber,
    severity,
    errors,
    warnings,
    raw,
    normalized: {
      title: title ?? '',
      description: description ?? '',
      categoryId: category?.id ?? null,
      categoryLabel,
      priceMinor,
      compareAtMinor,
      conditionGrade,
      brand: asTrimmed(raw.brand),
      model: asTrimmed(raw.model),
      shortDescription: asTrimmed(raw.shortDescription),
      quantityAvailable: quantityParsed ?? 1,
      isUniqueItem: parseBoolean(raw.isUniqueItem, true),
      tags: parseTags(raw.tags),
      conditionNotes: asTrimmed(raw.conditionNotes),
      defects: asTrimmed(raw.defects),
      testingNotes: asTrimmed(raw.testingNotes),
      imageUrl,
      sku: asTrimmed(raw.sku),
    },
  };
};

export const summarizeImportRows = (
  rows: ProductImportRowPreview[],
): ProductImportParseResult['summary'] => ({
  total: rows.length,
  ok: rows.filter((row) => row.severity === 'ok').length,
  warning: rows.filter((row) => row.severity === 'warning').length,
  error: rows.filter((row) => row.severity === 'error').length,
});

export const toCreateInput = (
  row: ProductImportCommitRow,
): CreateAdminProductInput => ({
  title: row.title,
  description: row.description,
  categoryId: row.categoryId,
  priceMinor: row.priceMinor,
  conditionGrade: row.conditionGrade,
  brand: row.brand ?? null,
  model: row.model ?? null,
  shortDescription: row.shortDescription ?? null,
  compareAtMinor: row.compareAtMinor ?? null,
  quantityAvailable: row.quantityAvailable ?? 1,
  isUniqueItem: row.isUniqueItem ?? true,
  tags: row.tags ?? [],
  conditionNotes: row.conditionNotes ?? null,
  defects: row.defects ?? null,
  testingNotes: row.testingNotes ?? null,
  sku: row.sku ?? null,
  status: 'DRAFT',
  media: row.imageUrl
    ? [
        {
          url: row.imageUrl,
          altText: row.title,
          isPrimary: true,
          sortOrder: 0,
        },
      ]
    : undefined,
});

export const buildImportTemplateCsv = (exampleCategorySlug: string): string => {
  const headers = PRODUCT_IMPORT_COLUMNS.join(',');
  const example = [
    'Technics SL-1200MK2 Turntable',
    'Classic direct-drive turntable serviced and tested.',
    exampleCategorySlug || 'turntables',
    '449.00',
    'VERY_GOOD',
    'Technics',
    'SL-1200MK2',
    'Iconic DJ and listening turntable',
    '599.00',
    '1',
    'true',
    'turntable,technics',
    'Light cosmetic wear on lid',
    '',
    'Speed stable after service',
    '',
    '',
  ]
    .map((cell) => {
      if (cell.includes(',') || cell.includes('"')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    })
    .join(',');

  return `${headers}\n${example}\n`;
};
