import { Inject, Injectable } from '@nestjs/common';
import type {
  CheckoutSession,
  CreateCheckoutSessionInput,
  CreateQuoteInput,
  Quote,
} from '../../domain/checkout.types.js';
import { PrismaCheckoutRepository } from '../../infrastructure/prisma-checkout.repository.js';

export const CHECKOUT_REPOSITORY = Symbol('CHECKOUT_REPOSITORY');

export interface CheckoutRepository {
  createQuote(input: CreateQuoteInput): Promise<Quote>;
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession>;
  getCheckoutSession(guestToken: string): Promise<CheckoutSession | null>;
  cancelCheckoutSession(guestToken: string): Promise<CheckoutSession>;
}

@Injectable()
export class PrismaCheckoutRepositoryAdapter implements CheckoutRepository {
  constructor(private readonly repository: PrismaCheckoutRepository) {}

  createQuote(input: CreateQuoteInput) {
    return this.repository.createQuote(input);
  }

  createCheckoutSession(input: CreateCheckoutSessionInput) {
    return this.repository.createCheckoutSession(input);
  }

  getCheckoutSession(guestToken: string) {
    return this.repository.getCheckoutSession(guestToken);
  }

  cancelCheckoutSession(guestToken: string) {
    return this.repository.cancelCheckoutSession(guestToken);
  }
}

export const checkoutRepositoryProvider = {
  provide: CHECKOUT_REPOSITORY,
  useClass: PrismaCheckoutRepositoryAdapter,
};
