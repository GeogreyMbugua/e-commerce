import {
  ConflictException,
  Inject,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import type { Env } from '../../../shared/config/env.schema.js';
import type {
  CreateProviderPaymentInput,
  CreateProviderPaymentResult,
  PaymentProvider,
  VerifiedWebhookEvent,
} from '../application/ports/payment.provider.js';

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe';
  private readonly stripe: Stripe | null;
  private readonly webhookSecret: string | undefined;

  constructor(private readonly config: ConfigService<Env, true>) {
    const secretKey = this.config.get('STRIPE_SECRET_KEY', { infer: true });
    this.stripe = secretKey ? new Stripe(secretKey) : null;
    this.webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET', {
      infer: true,
    });
  }

  async createPayment(
    input: CreateProviderPaymentInput,
  ): Promise<CreateProviderPaymentResult> {
    if (!this.stripe) {
      throw new ConflictException({
        code: 'STRIPE_NOT_CONFIGURED',
        message: 'Stripe is not configured.',
      });
    }

    const storefrontUrl =
      this.config.get('STOREFRONT_URL', { infer: true }) ??
      'http://localhost:3000';
    const basePath = this.config.get('STOREFRONT_BASE_PATH', { infer: true }) ?? '';

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      input.lineItems.map((line) => ({
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: line.unitAmountMinor,
          product_data: {
            name: line.title,
          },
        },
        quantity: line.quantity,
      }));

    if (input.shippingAmountMinor > 0) {
      lineItems.push({
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: input.shippingAmountMinor,
          product_data: {
            name: input.shippingLabel,
          },
        },
        quantity: 1,
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      ui_mode: 'elements',
      mode: 'payment',
      customer_email: input.email,
      line_items: lineItems,
      return_url: `${storefrontUrl}${basePath}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderReference: input.orderReference,
        orderId: input.orderId,
      },
    });

    return {
      provider: this.name,
      providerPaymentId: session.id,
      clientSecret: session.client_secret,
      checkoutUrl: null,
    };
  }

  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    if (!this.stripe) {
      throw new ConflictException({
        code: 'STRIPE_NOT_CONFIGURED',
        message: 'Stripe is not configured.',
      });
    }

    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async verifyWebhook(
    payload: Buffer,
    signature: string | undefined,
  ): Promise<VerifiedWebhookEvent> {
    if (!this.stripe) {
      throw new BadRequestException({
        code: 'STRIPE_NOT_CONFIGURED',
        message: 'Stripe is not configured.',
      });
    }

    if (!this.webhookSecret) {
      throw new BadRequestException({
        code: 'WEBHOOK_NOT_CONFIGURED',
        message: 'Stripe webhook secret is not configured.',
      });
    }

    if (!signature) {
      throw new BadRequestException({
        code: 'WEBHOOK_SIGNATURE_MISSING',
        message: 'Stripe signature header is required.',
      });
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== 'paid') {
        return {
          providerEventId: event.id,
          providerPaymentId: session.id,
          eventType: 'ignored',
        };
      }

      return {
        providerEventId: event.id,
        providerPaymentId: session.id,
        eventType: 'payment_succeeded',
      };
    }

    if (
      event.type === 'checkout.session.async_payment_failed' ||
      event.type === 'checkout.session.expired'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      return {
        providerEventId: event.id,
        providerPaymentId: session.id,
        eventType: 'payment_failed',
      };
    }

    return {
      providerEventId: event.id,
      providerPaymentId: event.id,
      eventType: 'ignored',
    };
  }
}

export const STRIPE_PAYMENT_PROVIDER = Symbol('STRIPE_PAYMENT_PROVIDER');
