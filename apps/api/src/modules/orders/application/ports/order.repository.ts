import type {
  CapturePaymentInput,
  CreateOrderInput,
  CreateOrderResult,
  GetOrderInput,
  LookupOrderInput,
  Order,
} from '../../domain/order.types.js';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderRepository {
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  getOrder(input: GetOrderInput): Promise<Order | null>;
  lookupOrder(input: LookupOrderInput): Promise<Order | null>;
  listOrdersForCustomer(customerId: string): Promise<Order[]>;
  claimOrderForCustomer(input: {
    customerId: string;
    customerEmail: string;
    reference: string;
    guestAccessToken?: string;
  }): Promise<Order>;
  capturePayment(input: CapturePaymentInput): Promise<Order>;
  failPayment(providerPaymentId: string): Promise<Order | null>;
  simulateDevCapture(paymentId: string): Promise<Order>;
  syncStripeCheckoutSession(sessionId: string): Promise<Order>;
}
