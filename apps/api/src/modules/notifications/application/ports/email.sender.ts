export type OrderConfirmationEmail = {
  to: string;
  reference: string;
  totalLabel: string;
  orderUrl: string;
  lines: Array<{
    title: string;
    quantity: number;
    lineTotalLabel: string;
  }>;
};

export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface EmailSender {
  sendOrderConfirmation(input: OrderConfirmationEmail): Promise<void>;
}
