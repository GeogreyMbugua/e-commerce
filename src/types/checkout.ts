export type CheckoutMoney = {
  amountMinor: number;
  currency: string;
};

export type QuoteLine = {
  productSlug: string;
  title: string;
  conditionGrade: string;
  quantity: number;
  unitPrice: CheckoutMoney;
  lineTotal: CheckoutMoney;
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
  subtotal: CheckoutMoney;
  shipping: CheckoutMoney;
  tax: CheckoutMoney;
  discount: CheckoutMoney;
  total: CheckoutMoney;
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
  status: "OPEN" | "EXPIRED" | "CANCELLED" | "COMPLETED";
  email: string | null;
  reservations: CheckoutReservation[];
};

export type ShippingMethodSlug = "standard" | "pickup";

export const SHIPPING_OPTIONS: Array<{
  slug: ShippingMethodSlug;
  label: string;
  description: string;
}> = [
  {
    slug: "standard",
    label: "Standard shipping",
    description: "Ships within 3–5 business days",
  },
  {
    slug: "pickup",
    label: "Local pickup",
    description: "Collect by appointment",
  },
];
