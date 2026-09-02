import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  CreateProviderPaymentInput,
  CreateProviderPaymentResult,
  PaymentProvider,
  VerifiedWebhookEvent,
} from '../application/ports/payment.provider.js';
import { createDevProviderPaymentId } from '../domain/order.constants.js';

@Injectable()
export class DevPaymentProvider implements PaymentProvider {
  readonly name = 'dev';

  createPayment(
    input: CreateProviderPaymentInput,
  ): Promise<CreateProviderPaymentResult> {
    return Promise.resolve({
      provider: this.name,
      providerPaymentId: createDevProviderPaymentId(),
      clientSecret: null,
      checkoutUrl: null,
    });
  }

  verifyWebhook(): Promise<VerifiedWebhookEvent> {
    return Promise.reject(new Error('Dev provider does not accept webhooks.'));
  }
}

export const createSimulatedWebhookEvent = (
  providerPaymentId: string,
): VerifiedWebhookEvent => ({
  providerEventId: `dev_evt_${randomUUID()}`,
  providerPaymentId,
  eventType: 'payment_succeeded',
});
