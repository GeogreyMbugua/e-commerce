export type CartMoney = {
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
  unitPrice: CartMoney;
  lineTotal: CartMoney;
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
  subtotal: CartMoney;
  itemCount: number;
};

export type AddCartLineInput = {
  productSlug: string;
  quantity?: number;
};

export type UpdateCartLineInput = {
  quantity: number;
};
