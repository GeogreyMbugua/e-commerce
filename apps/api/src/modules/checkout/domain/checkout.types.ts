export type Money = {
  amountMinor: number;
  currency: string;
};

export type QuoteLine = {
  productSlug: string;
  title: string;
  conditionGrade: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
  isAvailable: boolean;
  sellableQuantity: number;
  isUniqueItem: boolean;
};

export type Quote = {
  currency: string;
  expiresAt: string;
  shippingMethod: string;
  shippingLabel: string;
  lines: QuoteLine[];
  subtotal: Money;
  shipping: Money;
  tax: Money;
  discount: Money;
  total: Money;
  itemCount: number;
};

export type CheckoutReservation = {
  productSlug: string;
  quantity: number;
  expiresAt: string;
};

export type CheckoutSession = Quote & {
  id: string;
  guestToken: string;
  status: 'OPEN' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';
  email: string | null;
  reservations: CheckoutReservation[];
};

export type CreateQuoteInput = {
  cartGuestToken: string;
  shippingMethod?: string;
};

export type CreateCheckoutSessionInput = {
  cartGuestToken: string;
  email: string;
  shippingMethod?: string;
  idempotencyKey?: string;
};
