export type CreateProviderPaymentLineItem = {
  title: string;
  quantity: number;
  unitAmountMinor: number;
};

export type CreateProviderPaymentInput = {
  orderId: string;
  orderReference: string;
  amountMinor: number;
  currency: string;
  email: string;
  lineItems: CreateProviderPaymentLineItem[];
  shippingAmountMinor: number;
  shippingLabel: string;
};

export type CreateProviderPaymentResult = {
  provider: string;
  providerPaymentId: string;
  clientSecret: string | null;
  checkoutUrl: string | null;
};

export type VerifiedWebhookEvent = {
  providerEventId: string;
  providerPaymentId: string;
  eventType: 'payment_succeeded' | 'payment_failed' | 'ignored';
};

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

export interface PaymentProvider {
  readonly name: string;
  createPayment(
    input: CreateProviderPaymentInput,
  ): Promise<CreateProviderPaymentResult>;
  verifyWebhook(
    payload: Buffer,
    signature: string | undefined,
  ): Promise<VerifiedWebhookEvent>;
}
