import { createHash } from 'node:crypto';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Cart } from '../domain/cart.types.js';
import {
  CART_REPOSITORY,
  type CartRepository,
} from './ports/cart.repository.js';
import { createGuestToken } from '../infrastructure/prisma-cart.repository.js';

@Injectable()
export class CreateCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly carts: CartRepository,
  ) {}

  async execute(input: { currency?: string } = {}): Promise<Cart> {
    return this.carts.createGuestCart({
      guestToken: createGuestToken(),
      currency: input.currency,
    });
  }
}

@Injectable()
export class GetCurrentCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly carts: CartRepository,
  ) {}

  execute(guestToken: string): Promise<Cart | null> {
    return this.carts.findActiveByGuestToken(guestToken);
  }
}

const hashRequest = (productSlug: string, quantity: number) =>
  createHash('sha256')
    .update(`${productSlug}:${quantity}`)
    .digest('hex');

@Injectable()
export class AddCartLineUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly carts: CartRepository,
  ) {}

  async execute(input: {
    guestToken: string;
    productSlug: string;
    quantity: number;
    idempotencyKey?: string;
  }): Promise<Cart> {
    const requestHash = hashRequest(input.productSlug, input.quantity);

    if (input.idempotencyKey) {
      const existingCart = await this.carts.findActiveByGuestToken(
        input.guestToken,
      );

      if (existingCart) {
        const idempotency = await this.carts.findIdempotency(
          existingCart.id,
          input.idempotencyKey,
        );

        if (idempotency) {
          if (idempotency.requestHash !== requestHash) {
            throw new ConflictException({
              code: 'IDEMPOTENCY_CONFLICT',
              message: 'Idempotency key was reused with a different request.',
            });
          }

          return idempotency.responseBody;
        }
      }
    }

    const cart = await this.carts.addOrMergeLine({
      guestToken: input.guestToken,
      productSlug: input.productSlug,
      quantity: input.quantity,
    });

    if (input.idempotencyKey) {
      await this.carts.saveIdempotency(
        cart.id,
        input.idempotencyKey,
        requestHash,
        cart,
      );
    }

    return cart;
  }
}

@Injectable()
export class UpdateCartLineUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly carts: CartRepository,
  ) {}

  execute(input: {
    guestToken: string;
    productSlug: string;
    quantity: number;
  }): Promise<Cart> {
    return this.carts.updateLineQuantity(input);
  }
}

@Injectable()
export class RemoveCartLineUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly carts: CartRepository,
  ) {}

  execute(input: { guestToken: string; productSlug: string }): Promise<Cart> {
    return this.carts.removeLine(input);
  }
}

@Injectable()
export class ClearCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly carts: CartRepository,
  ) {}

  execute(guestToken: string): Promise<Cart> {
    return this.carts.clearCart({ guestToken });
  }
}

@Injectable()
export class MergeGuestCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly carts: CartRepository,
  ) {}

  execute(input: { guestToken: string; customerId: string }): Promise<Cart> {
    return this.carts.mergeGuestCartIntoCustomer(input);
  }
}

@Injectable()
export class GetCustomerCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly carts: CartRepository,
  ) {}

  execute(customerId: string): Promise<Cart | null> {
    return this.carts.findActiveByCustomerId(customerId);
  }
}
