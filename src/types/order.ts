export type OrderMoney = {
  amountMinor: number;
  currency: string;
};

export type OrderLine = {
  productSlug: string;
  title: string;
  conditionGrade: string;
  quantity: number;
  unitPrice: OrderMoney;
  lineTotal: OrderMoney;
};

export type OrderPayment = {
  id: string;
  provider: string;
  providerPaymentId: string;
  status:
    | "PENDING"
    | "AUTHORIZED"
    | "CAPTURED"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";
  amount: OrderMoney;
  clientSecret: string | null;
  checkoutUrl: string | null;
};

export type Order = {
  id: string;
  reference: string;
  guestAccessToken: string;
  email: string;
  status: "PENDING_PAYMENT" | "PAID" | "CANCELLED";
  fulfillmentStatus:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  currency: string;
  shippingMethod: string;
  lines: OrderLine[];
  subtotal: OrderMoney;
  shipping: OrderMoney;
  tax: OrderMoney;
  discount: OrderMoney;
  total: OrderMoney;
  payment: OrderPayment | null;
  paidAt: string | null;
  createdAt: string;
};
