import type {
  AddCartLineInput,
  Cart,
  CartTokenInput,
  UpdateCartLineInput,
} from '../../domain/cart.types.js';

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');

export type CreateGuestCartInput = {
  guestToken: string;
  currency?: string;
};

export type IdempotencyRecord = {
  requestHash: string;
  responseBody: Cart;
};

export interface CartRepository {
  createGuestCart(input: CreateGuestCartInput): Promise<Cart>;
  findActiveByGuestToken(guestToken: string): Promise<Cart | null>;
  findActiveByCustomerId(customerId: string): Promise<Cart | null>;
  mergeGuestCartIntoCustomer(input: {
    guestToken: string;
    customerId: string;
  }): Promise<Cart>;
  addOrMergeLine(input: AddCartLineInput): Promise<Cart>;
  updateLineQuantity(input: UpdateCartLineInput): Promise<Cart>;
  removeLine(input: CartTokenInput & { productSlug: string }): Promise<Cart>;
  clearCart(input: CartTokenInput): Promise<Cart>;
  findIdempotency(
    cartId: string,
    key: string,
  ): Promise<IdempotencyRecord | null>;
  saveIdempotency(
    cartId: string,
    key: string,
    requestHash: string,
    responseBody: Cart,
  ): Promise<void>;
}
