export type Money = {
  amountMinor: number;
  currency: string;
};

export type OrderLine = {
  productSlug: string;
  title: string;
  conditionGrade: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
};

export type PaymentSummary = {
  id: string;
  provider: string;
  providerPaymentId: string;
  status: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  amount: Money;
  clientSecret: string | null;
  checkoutUrl: string | null;
};

export type Order = {
  id: string;
  reference: string;
  guestAccessToken: string;
  email: string;
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED';
  fulfillmentStatus:
    | 'PENDING'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';
  currency: string;
  shippingMethod: string;
  lines: OrderLine[];
  subtotal: Money;
  shipping: Money;
  tax: Money;
  discount: Money;
  total: Money;
  payment: PaymentSummary | null;
  paidAt: string | null;
  createdAt: string;
};

export type CreateOrderInput = {
  checkoutGuestToken: string;
  idempotencyKey?: string;
  customerId?: string;
};

export type CreateOrderResult = Order;

export type GetOrderInput = {
  reference: string;
  guestAccessToken?: string;
  customerId?: string;
};

export type LookupOrderInput = {
  reference: string;
  email: string;
};

export type CapturePaymentInput = {
  providerPaymentId: string;
  providerEventId?: string;
};
