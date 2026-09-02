import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CheckoutSession,
  CreateCheckoutSessionInput,
  CreateQuoteInput,
  Quote,
} from '../domain/checkout.types.js';
import {
  CHECKOUT_REPOSITORY,
  type CheckoutRepository,
} from './ports/checkout.repository.js';

@Injectable()
export class CreateQuoteUseCase {
  constructor(
    @Inject(CHECKOUT_REPOSITORY)
    private readonly checkout: CheckoutRepository,
  ) {}

  execute(input: CreateQuoteInput): Promise<Quote> {
    return this.checkout.createQuote(input);
  }
}

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject(CHECKOUT_REPOSITORY)
    private readonly checkout: CheckoutRepository,
  ) {}

  execute(input: CreateCheckoutSessionInput): Promise<CheckoutSession> {
    return this.checkout.createCheckoutSession(input);
  }
}

@Injectable()
export class GetCheckoutSessionUseCase {
  constructor(
    @Inject(CHECKOUT_REPOSITORY)
    private readonly checkout: CheckoutRepository,
  ) {}

  async execute(guestToken: string): Promise<CheckoutSession> {
    const session = await this.checkout.getCheckoutSession(guestToken);

    if (!session) {
      throw new NotFoundException({
        code: 'CHECKOUT_SESSION_NOT_FOUND',
        message: 'Checkout session not found or expired.',
      });
    }

    return session;
  }
}

@Injectable()
export class CancelCheckoutSessionUseCase {
  constructor(
    @Inject(CHECKOUT_REPOSITORY)
    private readonly checkout: CheckoutRepository,
  ) {}

  execute(guestToken: string): Promise<CheckoutSession> {
    return this.checkout.cancelCheckoutSession(guestToken);
  }
}
