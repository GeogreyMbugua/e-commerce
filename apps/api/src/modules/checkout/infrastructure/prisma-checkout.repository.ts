import { createHash } from 'node:crypto';
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
  DEFAULT_SHIPPING_METHOD,
  QUOTE_TTL_MINUTES,
  RESERVATION_TTL_MINUTES,
  expiresAtFromMinutes,
  getShippingAmountMinor,
  getShippingLabel,
} from '../domain/checkout.constants.js';
import type {
  CheckoutSession,
  CreateCheckoutSessionInput,
  CreateQuoteInput,
  Money,
  Quote,
  QuoteLine,
} from '../domain/checkout.types.js';

type CartWithLines = Prisma.CartGetPayload<{
  include: {
    lines: {
      include: {
        product: {
          include: {
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
          inventory: true,
        },
      },
    },
  },
} as const;

const toMoney = (amountMinor: number, currency: string): Money => ({
  amountMinor,
  currency,
});

const buildQuoteLines = (cart: CartWithLines): QuoteLine[] =>
  cart.lines.map((line) => {
    const sellableQuantity = getSellableQuantity(line.product.inventory);
    const lineTotalMinor = line.product.priceMinor * line.quantity;

    return {
      productSlug: line.product.slug,
      title: line.product.title,
      conditionGrade: line.product.conditionGrade,
      quantity: line.quantity,
      unitPrice: toMoney(line.product.priceMinor, line.product.currency),
      lineTotal: toMoney(lineTotalMinor, line.product.currency),
      isAvailable:
        line.product.status === 'ACTIVE' &&
        !line.product.archivedAt &&
        sellableQuantity > 0,
      sellableQuantity,
      isUniqueItem: line.product.isUniqueItem,
    };
  });

const calculateTotals = (
  lines: QuoteLine[],
  currency: string,
  shippingMethod: string,
) => {
  const subtotalMinor = lines.reduce(
    (total, line) => total + line.lineTotal.amountMinor,
    0,
  );
  const shippingMinor = getShippingAmountMinor(shippingMethod);
  const taxMinor = 0;
  const discountMinor = 0;
  const totalMinor = subtotalMinor + shippingMinor + taxMinor - discountMinor;
  const itemCount = lines.reduce((count, line) => count + line.quantity, 0);

  return {
    subtotalMinor,
    shippingMinor,
    taxMinor,
    discountMinor,
    totalMinor,
    itemCount,
    subtotal: toMoney(subtotalMinor, currency),
    shipping: toMoney(shippingMinor, currency),
    tax: toMoney(taxMinor, currency),
    discount: toMoney(discountMinor, currency),
    total: toMoney(totalMinor, currency),
  };
};

const assertCartReadyForCheckout = (cart: CartWithLines | null, token: string) => {
  if (!cart || cart.expiresAt <= new Date()) {
    throw new NotFoundException({
      code: 'CART_NOT_FOUND',
      message: 'Cart not found or expired.',
      guestToken: token,
    });
  }

  if (cart.lines.length === 0) {
    throw new ConflictException({
      code: 'CART_EMPTY',
      message: 'Cart is empty and cannot be quoted.',
    });
  }
};

const validateQuoteLines = (lines: QuoteLine[]) => {
  const stockIssues = lines.filter(
    (line) => !line.isAvailable || line.sellableQuantity < line.quantity,
  );

  if (stockIssues.length > 0) {
    throw new ConflictException({
      code: 'STOCK_CHANGED',
      message: 'One or more items in your cart are no longer available.',
      lines: stockIssues.map((line) => ({
        productSlug: line.productSlug,
        requestedQuantity: line.quantity,
        sellableQuantity: line.sellableQuantity,
      })),
    });
  }

  const uniqueIssues = lines.filter(
    (line) => line.isUniqueItem && line.quantity > 1,
  );

  if (uniqueIssues.length > 0) {
    throw new ConflictException({
      code: 'UNIQUE_ITEM_LIMIT',
      message: 'Unique items can only be purchased one at a time.',
    });
  }
};

@Injectable()
export class PrismaCheckoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async releaseExpiredReservations() {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const expiredReservations = await tx.inventoryReservation.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: { lte: now },
        },
      });

      for (const reservation of expiredReservations) {
        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: {
            status: 'EXPIRED',
            releasedAt: now,
          },
        });

        await tx.inventoryItem.update({
          where: { id: reservation.inventoryItemId },
          data: {
            quantityReserved: {
              decrement: reservation.quantity,
            },
          },
        });
      }

      await tx.checkoutSession.updateMany({
        where: {
          status: 'OPEN',
          expiresAt: { lte: now },
        },
        data: {
          status: 'EXPIRED',
        },
      });
    });
  }

  async createQuote(input: CreateQuoteInput): Promise<Quote> {
    await this.releaseExpiredReservations();

    const cart = await this.prisma.cart.findUnique({
      where: { guestToken: input.cartGuestToken },
      include: cartInclude,
    });

    assertCartReadyForCheckout(cart, input.cartGuestToken);

    const shippingMethod = input.shippingMethod ?? DEFAULT_SHIPPING_METHOD;
    const lines = buildQuoteLines(cart!);
    validateQuoteLines(lines);

    const totals = calculateTotals(lines, cart!.currency, shippingMethod);

    return {
      currency: cart!.currency,
      expiresAt: expiresAtFromMinutes(QUOTE_TTL_MINUTES).toISOString(),
      shippingMethod,
      shippingLabel: getShippingLabel(shippingMethod),
      lines,
      ...totals,
    };
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSession> {
    await this.releaseExpiredReservations();

    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { guestToken: input.cartGuestToken },
        include: cartInclude,
      });

      assertCartReadyForCheckout(cart, input.cartGuestToken);

      const shippingMethod = input.shippingMethod ?? DEFAULT_SHIPPING_METHOD;
      const lines = buildQuoteLines(cart!);
      validateQuoteLines(lines);
      const totals = calculateTotals(lines, cart!.currency, shippingMethod);
      const reservationExpiresAt = expiresAtFromMinutes(
        RESERVATION_TTL_MINUTES,
      );
      const sessionExpiresAt = reservationExpiresAt;

      await tx.checkoutSession.updateMany({
        where: {
          cartId: cart!.id,
          status: 'OPEN',
        },
        data: {
          status: 'CANCELLED',
        },
      });

      const openReservations = await tx.inventoryReservation.findMany({
        where: {
          checkoutSession: {
            cartId: cart!.id,
            status: 'OPEN',
          },
          status: 'ACTIVE',
        },
      });

      for (const reservation of openReservations) {
        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: {
            status: 'RELEASED',
            releasedAt: new Date(),
          },
        });

        await tx.inventoryItem.update({
          where: { id: reservation.inventoryItemId },
          data: {
            quantityReserved: {
              decrement: reservation.quantity,
            },
          },
        });
      }

      const session = await tx.checkoutSession.create({
        data: {
          guestToken: `checkout_${randomUUID()}`,
          cartId: cart!.id,
          status: 'OPEN',
          currency: cart!.currency,
          email: input.email,
          shippingMethod,
          subtotalMinor: totals.subtotalMinor,
          shippingMinor: totals.shippingMinor,
          taxMinor: totals.taxMinor,
          discountMinor: totals.discountMinor,
          totalMinor: totals.totalMinor,
          expiresAt: sessionExpiresAt,
          lines: {
            create: cart!.lines.map((line) => ({
              productId: line.productId,
              productSlug: line.product.slug,
              title: line.product.title,
              conditionGrade: line.product.conditionGrade,
              quantity: line.quantity,
              unitPriceMinor: line.product.priceMinor,
              lineTotalMinor: line.product.priceMinor * line.quantity,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      const reservations = [];

      for (const line of cart!.lines) {
        const inventory = line.product.inventory;

        if (!inventory) {
          throw new ConflictException({
            code: 'PRODUCT_UNAVAILABLE',
            message: 'Product inventory is unavailable.',
            productSlug: line.product.slug,
          });
        }

        const sellableQuantity = getSellableQuantity(inventory);

        if (sellableQuantity < line.quantity) {
          throw new ConflictException({
            code: 'STOCK_CHANGED',
            message: 'Inventory changed during checkout.',
            productSlug: line.product.slug,
          });
        }

        const updatedInventory = await tx.inventoryItem.updateMany({
          where: {
            id: inventory.id,
            quantityAvailable: {
              gte: inventory.quantityReserved + line.quantity,
            },
          },
          data: {
            quantityReserved: {
              increment: line.quantity,
            },
          },
        });

        if (updatedInventory.count !== 1) {
          throw new ConflictException({
            code: 'STOCK_CHANGED',
            message: 'Inventory changed during checkout.',
            productSlug: line.product.slug,
          });
        }

        const reservation = await tx.inventoryReservation.create({
          data: {
            checkoutSessionId: session.id,
            inventoryItemId: inventory.id,
            productId: line.productId,
            quantity: line.quantity,
            status: 'ACTIVE',
            expiresAt: reservationExpiresAt,
          },
        });

        reservations.push({
          productSlug: line.product.slug,
          quantity: reservation.quantity,
          expiresAt: reservation.expiresAt.toISOString(),
        });
      }

      return this.toCheckoutSession(session, lines, reservations, totals);
    });
  }

  async getCheckoutSession(guestToken: string): Promise<CheckoutSession | null> {
    await this.releaseExpiredReservations();

    const session = await this.prisma.checkoutSession.findUnique({
      where: { guestToken },
      include: {
        lines: true,
        reservations: {
          where: { status: 'ACTIVE' },
          include: {
            product: true,
          },
        },
      },
    });

    if (!session || session.status !== 'OPEN' || session.expiresAt <= new Date()) {
      return null;
    }

    const lines: QuoteLine[] = session.lines.map((line) => ({
      productSlug: line.productSlug,
      title: line.title,
      conditionGrade: line.conditionGrade,
      quantity: line.quantity,
      unitPrice: toMoney(line.unitPriceMinor, session.currency),
      lineTotal: toMoney(line.lineTotalMinor, session.currency),
      isAvailable: true,
      sellableQuantity: line.quantity,
      isUniqueItem: false,
    }));

    const totals = calculateTotals(lines, session.currency, session.shippingMethod);

    return this.toCheckoutSession(
      session,
      lines,
      session.reservations.map((reservation) => ({
        productSlug: reservation.product.slug,
        quantity: reservation.quantity,
        expiresAt: reservation.expiresAt.toISOString(),
      })),
      totals,
    );
  }

  async cancelCheckoutSession(guestToken: string): Promise<CheckoutSession> {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.checkoutSession.findUnique({
        where: { guestToken },
        include: {
          lines: true,
          reservations: {
            where: { status: 'ACTIVE' },
            include: { product: true },
          },
        },
      });

      if (!session) {
        throw new NotFoundException({
          code: 'CHECKOUT_SESSION_NOT_FOUND',
          message: 'Checkout session not found.',
        });
      }

      if (session.status !== 'OPEN') {
        throw new ConflictException({
          code: 'CHECKOUT_SESSION_NOT_OPEN',
          message: 'Checkout session is no longer active.',
        });
      }

      for (const reservation of session.reservations) {
        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: {
            status: 'RELEASED',
            releasedAt: new Date(),
          },
        });

        await tx.inventoryItem.update({
          where: { id: reservation.inventoryItemId },
          data: {
            quantityReserved: {
              decrement: reservation.quantity,
            },
          },
        });
      }

      const cancelled = await tx.checkoutSession.update({
        where: { id: session.id },
        data: { status: 'CANCELLED' },
        include: { lines: true },
      });

      const lines: QuoteLine[] = cancelled.lines.map((line) => ({
        productSlug: line.productSlug,
        title: line.title,
        conditionGrade: line.conditionGrade,
        quantity: line.quantity,
        unitPrice: toMoney(line.unitPriceMinor, cancelled.currency),
        lineTotal: toMoney(line.lineTotalMinor, cancelled.currency),
        isAvailable: true,
        sellableQuantity: line.quantity,
        isUniqueItem: false,
      }));

      const totals = calculateTotals(
        lines,
        cancelled.currency,
        cancelled.shippingMethod,
      );

      return this.toCheckoutSession(cancelled, lines, [], totals, 'CANCELLED');
    });
  }

  private toCheckoutSession(
    session: {
      id: string;
      guestToken: string;
      status: 'OPEN' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';
      currency: string;
      email: string | null;
      shippingMethod: string;
      expiresAt: Date;
    },
    lines: QuoteLine[],
    reservations: Array<{
      productSlug: string;
      quantity: number;
      expiresAt: string;
    }>,
    totals: ReturnType<typeof calculateTotals>,
    status?: CheckoutSession['status'],
  ): CheckoutSession {
    return {
      id: session.id,
      guestToken: session.guestToken,
      status: status ?? (session.status as CheckoutSession['status']),
      email: session.email,
      currency: session.currency,
      expiresAt: session.expiresAt.toISOString(),
      shippingMethod: session.shippingMethod,
      shippingLabel: getShippingLabel(session.shippingMethod),
      lines,
      reservations,
      ...totals,
    };
  }
}

export const hashCheckoutRequest = (email: string, shippingMethod: string) =>
  createHash('sha256').update(`${email}:${shippingMethod}`).digest('hex');

export const createCheckoutGuestToken = () => `checkout_${randomUUID()}`;
