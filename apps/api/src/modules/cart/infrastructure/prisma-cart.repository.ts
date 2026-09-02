import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import { getSellableQuantity } from '../../../shared/inventory/inventory.utils.js';
import {
  CART_TTL_DAYS,
  DEFAULT_CART_CURRENCY,
} from '../domain/cart.constants.js';
import type {
  AddCartLineInput,
  Cart,
  CartLine,
  CartTokenInput,
  Money,
  UpdateCartLineInput,
} from '../domain/cart.types.js';
import type {
  CartRepository,
  CreateGuestCartInput,
  IdempotencyRecord,
} from '../application/ports/cart.repository.js';

type CartWithLines = Prisma.CartGetPayload<{
  include: {
    lines: {
      include: {
        product: {
          include: {
            media: true;
            inventory: true;
          };
        };
      };
    };
  };
}>;

const cartInclude = {
  lines: {
    orderBy: { id: 'asc' as const },
    include: {
      product: {
        include: {
          media: true,
          inventory: true,
        },
      },
    },
  },
};

const expiresAtFromNow = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CART_TTL_DAYS);
  return expiresAt;
};

const toMoney = (amountMinor: number, currency: string): Money => ({
  amountMinor,
  currency,
});

const toCartLine = (line: CartWithLines['lines'][number]): CartLine => {
  const sellableQuantity = getSellableQuantity(line.product.inventory);
  const primaryMedia =
    line.product.media.find((media) => media.isPrimary) ??
    line.product.media[0] ??
    null;
  const lineTotalMinor = line.product.priceMinor * line.quantity;

  return {
    productSlug: line.product.slug,
    title: line.product.title,
    conditionGrade: line.product.conditionGrade,
    quantity: line.quantity,
    unitPrice: toMoney(line.product.priceMinor, line.product.currency),
    lineTotal: toMoney(lineTotalMinor, line.product.currency),
    isAvailable: line.product.status === 'ACTIVE' && sellableQuantity > 0,
    availableQuantity: sellableQuantity,
    isUniqueItem: line.product.isUniqueItem,
    primaryImage: primaryMedia
      ? {
          url: primaryMedia.url,
          altText: primaryMedia.altText,
        }
      : null,
  };
};

const toCart = (cart: CartWithLines): Cart => {
  const lines = cart.lines.map(toCartLine);
  const subtotalMinor = lines.reduce(
    (total, line) => total + line.lineTotal.amountMinor,
    0,
  );
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);

  return {
    id: cart.id,
    guestToken: cart.guestToken,
    currency: cart.currency,
    version: cart.version,
    expiresAt: cart.expiresAt.toISOString(),
    lines,
    subtotal: toMoney(subtotalMinor, cart.currency),
    itemCount,
  };
};

const assertCartActive = (cart: CartWithLines | null, guestToken: string) => {
  if (!cart || cart.expiresAt <= new Date()) {
    throw new NotFoundException({
      code: 'CART_NOT_FOUND',
      message: 'Cart not found or expired.',
      guestToken,
    });
  }

  return cart;
};

const assertProductPurchasable = (
  product: CartWithLines['lines'][number]['product'],
  requestedQuantity: number,
) => {
  if (product.status !== 'ACTIVE' || product.archivedAt) {
    throw new ConflictException({
      code: 'PRODUCT_UNAVAILABLE',
      message: 'Product is not available for purchase.',
      productSlug: product.slug,
    });
  }

  const sellableQuantity = getSellableQuantity(product.inventory);

  if (sellableQuantity <= 0) {
    throw new ConflictException({
      code: 'PRODUCT_UNAVAILABLE',
      message: 'Product is out of stock.',
      productSlug: product.slug,
    });
  }

  if (product.isUniqueItem && requestedQuantity > 1) {
    throw new ConflictException({
      code: 'UNIQUE_ITEM_LIMIT',
      message: 'Unique items can only be purchased one at a time.',
      productSlug: product.slug,
    });
  }

  if (requestedQuantity > sellableQuantity) {
    throw new ConflictException({
      code: 'QUANTITY_EXCEEDS_STOCK',
      message: 'Requested quantity exceeds available stock.',
      productSlug: product.slug,
      availableQuantity: sellableQuantity,
    });
  }
};

@Injectable()
export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createGuestCart(input: CreateGuestCartInput): Promise<Cart> {
    const cart = await this.prisma.cart.create({
      data: {
        guestToken: input.guestToken,
        currency: input.currency ?? DEFAULT_CART_CURRENCY,
        expiresAt: expiresAtFromNow(),
      },
      include: cartInclude,
    });

    return toCart(cart);
  }

  async findActiveByGuestToken(guestToken: string): Promise<Cart | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { guestToken },
      include: cartInclude,
    });

    if (!cart || cart.expiresAt <= new Date()) {
      return null;
    }

    return toCart(cart);
  }

  async findActiveByCustomerId(customerId: string): Promise<Cart | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: cartInclude,
    });

    if (!cart || cart.expiresAt <= new Date()) {
      return null;
    }

    return toCart(cart);
  }

  async mergeGuestCartIntoCustomer(input: {
    guestToken: string;
    customerId: string;
  }): Promise<Cart> {
    return this.prisma.$transaction(async (tx) => {
      const guestCart = assertCartActive(
        await tx.cart.findUnique({
          where: { guestToken: input.guestToken },
          include: cartInclude,
        }),
        input.guestToken,
      );

      if (guestCart.customerId && guestCart.customerId !== input.customerId) {
        throw new ConflictException({
          code: 'CART_OWNERSHIP_CONFLICT',
          message: 'Guest cart belongs to another customer.',
        });
      }

      let customerCart = await tx.cart.findUnique({
        where: { customerId: input.customerId },
        include: cartInclude,
      });

      if (!customerCart || customerCart.expiresAt <= new Date()) {
        if (customerCart) {
          await tx.cart.update({
            where: { id: customerCart.id },
            data: { customerId: null },
          });
        }

        customerCart = await tx.cart.create({
          data: {
            guestToken: createGuestToken(),
            customerId: input.customerId,
            currency: guestCart.currency,
            expiresAt: expiresAtFromNow(),
          },
          include: cartInclude,
        });
      }

      for (const guestLine of guestCart.lines) {
        const existingLine = customerCart.lines.find(
          (line) => line.productId === guestLine.productId,
        );
        const nextQuantity = (existingLine?.quantity ?? 0) + guestLine.quantity;

        assertProductPurchasable(guestLine.product, nextQuantity);

        if (existingLine) {
          await tx.cartLine.update({
            where: { id: existingLine.id },
            data: { quantity: nextQuantity },
          });
        } else {
          await tx.cartLine.create({
            data: {
              cartId: customerCart.id,
              productId: guestLine.productId,
              quantity: guestLine.quantity,
            },
          });
        }
      }

      await tx.cartLine.deleteMany({ where: { cartId: guestCart.id } });
      await tx.cart.delete({ where: { id: guestCart.id } });

      const updatedCart = await tx.cart.update({
        where: { id: customerCart.id },
        data: {
          version: { increment: 1 },
          expiresAt: expiresAtFromNow(),
        },
        include: cartInclude,
      });

      return toCart(updatedCart);
    });
  }

  async addOrMergeLine(input: AddCartLineInput): Promise<Cart> {
    return this.prisma.$transaction(async (tx) => {
      const cartRecord = assertCartActive(
        await tx.cart.findUnique({
          where: { guestToken: input.guestToken },
          include: cartInclude,
        }),
        input.guestToken,
      );

      const product = await tx.product.findUnique({
        where: { slug: input.productSlug },
        include: {
          media: true,
          inventory: true,
        },
      });

      if (!product) {
        throw new NotFoundException({
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found.',
          productSlug: input.productSlug,
        });
      }

      const existingLine = cartRecord.lines.find(
        (line) => line.productId === product.id,
      );
      const nextQuantity = (existingLine?.quantity ?? 0) + input.quantity;

      assertProductPurchasable(product, nextQuantity);

      if (existingLine) {
        await tx.cartLine.update({
          where: { id: existingLine.id },
          data: { quantity: nextQuantity },
        });
      } else {
        await tx.cartLine.create({
          data: {
            cartId: cartRecord.id,
            productId: product.id,
            quantity: input.quantity,
          },
        });
      }

      const updatedCart = await tx.cart.update({
        where: { id: cartRecord.id },
        data: {
          version: { increment: 1 },
          expiresAt: expiresAtFromNow(),
        },
        include: cartInclude,
      });

      return toCart(updatedCart);
    });
  }

  async updateLineQuantity(input: UpdateCartLineInput): Promise<Cart> {
    if (input.quantity < 1) {
      throw new ConflictException({
        code: 'VALIDATION_ERROR',
        message: 'Quantity must be at least 1.',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const cartRecord = assertCartActive(
        await tx.cart.findUnique({
          where: { guestToken: input.guestToken },
          include: cartInclude,
        }),
        input.guestToken,
      );

      const line = cartRecord.lines.find(
        (entry) => entry.product.slug === input.productSlug,
      );

      if (!line) {
        throw new NotFoundException({
          code: 'CART_LINE_NOT_FOUND',
          message: 'Cart line not found.',
          productSlug: input.productSlug,
        });
      }

      assertProductPurchasable(line.product, input.quantity);

      await tx.cartLine.update({
        where: { id: line.id },
        data: { quantity: input.quantity },
      });

      const updatedCart = await tx.cart.update({
        where: { id: cartRecord.id },
        data: {
          version: { increment: 1 },
          expiresAt: expiresAtFromNow(),
        },
        include: cartInclude,
      });

      return toCart(updatedCart);
    });
  }

  async removeLine(
    input: CartTokenInput & { productSlug: string },
  ): Promise<Cart> {
    return this.prisma.$transaction(async (tx) => {
      const cartRecord = assertCartActive(
        await tx.cart.findUnique({
          where: { guestToken: input.guestToken },
          include: cartInclude,
        }),
        input.guestToken,
      );

      const line = cartRecord.lines.find(
        (entry) => entry.product.slug === input.productSlug,
      );

      if (line) {
        await tx.cartLine.delete({ where: { id: line.id } });
      }

      const updatedCart = await tx.cart.update({
        where: { id: cartRecord.id },
        data: {
          version: { increment: 1 },
          expiresAt: expiresAtFromNow(),
        },
        include: cartInclude,
      });

      return toCart(updatedCart);
    });
  }

  async clearCart(input: CartTokenInput): Promise<Cart> {
    return this.prisma.$transaction(async (tx) => {
      const cartRecord = assertCartActive(
        await tx.cart.findUnique({
          where: { guestToken: input.guestToken },
          include: cartInclude,
        }),
        input.guestToken,
      );

      await tx.cartLine.deleteMany({ where: { cartId: cartRecord.id } });

      const updatedCart = await tx.cart.update({
        where: { id: cartRecord.id },
        data: {
          version: { increment: 1 },
          expiresAt: expiresAtFromNow(),
        },
        include: cartInclude,
      });

      return toCart(updatedCart);
    });
  }

  async findIdempotency(
    cartId: string,
    key: string,
  ): Promise<IdempotencyRecord | null> {
    const record = await this.prisma.cartIdempotencyKey.findUnique({
      where: {
        cartId_key: {
          cartId,
          key,
        },
      },
    });

    if (!record) {
      return null;
    }

    return {
      requestHash: record.requestHash,
      responseBody: record.responseBody as Cart,
    };
  }

  async saveIdempotency(
    cartId: string,
    key: string,
    requestHash: string,
    responseBody: Cart,
  ): Promise<void> {
    await this.prisma.cartIdempotencyKey.create({
      data: {
        cartId,
        key,
        requestHash,
        responseBody,
      },
    });
  }
}

export const createGuestToken = () => `cart_${randomUUID()}`;
