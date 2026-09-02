export type Money = {
  amountMinor: number;
  currency: string;
};

export type CartLineImage = {
  url: string;
  altText: string | null;
};

export type CartLine = {
  productSlug: string;
  title: string;
  conditionGrade: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
  isAvailable: boolean;
  availableQuantity: number;
  isUniqueItem: boolean;
  primaryImage: CartLineImage | null;
};

export type Cart = {
  id: string;
  guestToken: string;
  currency: string;
  version: number;
  expiresAt: string;
  lines: CartLine[];
  subtotal: Money;
  itemCount: number;
};

export type AddCartLineInput = {
  guestToken: string;
  productSlug: string;
  quantity: number;
  idempotencyKey?: string;
  requestHash?: string;
};

export type UpdateCartLineInput = {
  guestToken: string;
  productSlug: string;
  quantity: number;
};

export type CartTokenInput = {
  guestToken: string;
};
