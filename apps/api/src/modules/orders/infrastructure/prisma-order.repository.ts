import { createHash } from 'node:crypto';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import {
  createOrderGuestAccessToken,
  createOrderReference,
} from '../domain/order.constants.js';
import type {
  CapturePaymentInput,
  CreateOrderInput,
  Money,
  Order,
  OrderLine,
  PaymentSummary,
} from '../domain/order.types.js';
import type { OrderRepository } from '../application/ports/order.repository.js';
import type { PaymentProvider } from '../application/ports/payment.provider.js';
import { PAYMENT_PROVIDER } from '../application/ports/payment.provider.js';
import {
  STRIPE_PAYMENT_PROVIDER,
  StripePaymentProvider,
} from './stripe-payment.provider.js';
import { getShippingLabel } from '../../checkout/domain/checkout.constants.js';

const toMoney = (amountMinor: number, currency: string): Money => ({
  amountMinor,
  currency,
});

const hashOrderRequest = (checkoutSessionId: string) =>
  createHash('sha256').update(checkoutSessionId).digest('hex');

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: PaymentProvider,
    @Inject(STRIPE_PAYMENT_PROVIDER)
    private readonly stripeProvider: StripePaymentProvider,
  ) {}

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const session = await this.prisma.checkoutSession.findUnique({
      where: { guestToken: input.checkoutGuestToken },
      include: {
        lines: true,
        reservations: {
          where: { status: 'ACTIVE' },
        },
        order: {
          include: {
            lines: true,
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException({
        code: 'CHECKOUT_SESSION_NOT_FOUND',
        message: 'Checkout session not found.',
      });
    }

    if (session.status !== 'OPEN' || session.expiresAt <= new Date()) {
      throw new ConflictException({
        code: 'CHECKOUT_SESSION_NOT_OPEN',
        message: 'Checkout session is no longer active.',
      });
    }

    if (!session.email) {
      throw new ConflictException({
        code: 'CHECKOUT_EMAIL_REQUIRED',
        message: 'Email is required before creating an order.',
      });
    }

    if (session.reservations.length === 0) {
      throw new ConflictException({
        code: 'NO_ACTIVE_RESERVATIONS',
        message: 'Checkout session has no active inventory reservations.',
      });
    }

    if (input.idempotencyKey) {
      const existing = await this.prisma.orderIdempotencyKey.findUnique({
        where: {
          checkoutSessionId_key: {
            checkoutSessionId: session.id,
            key: input.idempotencyKey,
          },
        },
      });

      if (existing) {
        if (existing.requestHash !== hashOrderRequest(session.id)) {
          throw new ConflictException({
            code: 'IDEMPOTENCY_KEY_REUSED',
            message: 'Idempotency key was already used with a different request.',
          });
        }

        return existing.responseBody as unknown as Order;
      }
    }

    if (session.order) {
      return this.toOrder(session.order);
    }

    const reference = createOrderReference();
    const guestAccessToken = createOrderGuestAccessToken();

    let linkedCustomerId: string | undefined;

    if (input.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: input.customerId },
      });

      if (
        customer &&
        customer.email.toLowerCase() === session.email!.toLowerCase()
      ) {
        linkedCustomerId = customer.id;
      }
    }

    const providerPayment = await this.paymentProvider.createPayment({
      orderId: session.id,
      orderReference: reference,
      amountMinor: session.totalMinor,
      currency: session.currency,
      email: session.email,
      lineItems: session.lines.map((line) => ({
        title: line.title,
        quantity: line.quantity,
        unitAmountMinor: line.unitPriceMinor,
      })),
      shippingAmountMinor: session.shippingMinor,
      shippingLabel: getShippingLabel(session.shippingMethod),
    });

    const order = await this.prisma.$transaction(async (tx) => {
      const lockedSession = await tx.checkoutSession.findUnique({
        where: { id: session.id },
        include: {
          order: true,
          lines: true,
        },
      });

      if (!lockedSession || lockedSession.status !== 'OPEN') {
        throw new ConflictException({
          code: 'CHECKOUT_SESSION_NOT_OPEN',
          message: 'Checkout session is no longer active.',
        });
      }

      if (lockedSession.order) {
        const existingOrder = await tx.order.findUnique({
          where: { id: lockedSession.order.id },
          include: {
            lines: true,
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });

        return existingOrder!;
      }

      const created = await tx.order.create({
        data: {
          reference,
          guestAccessToken,
          customerId: linkedCustomerId,
          checkoutSessionId: lockedSession.id,
          email: lockedSession.email!,
          status: 'PENDING_PAYMENT',
          fulfillmentStatus: 'PENDING',
          currency: lockedSession.currency,
          shippingMethod: lockedSession.shippingMethod,
          subtotalMinor: lockedSession.subtotalMinor,
          shippingMinor: lockedSession.shippingMinor,
          taxMinor: lockedSession.taxMinor,
          discountMinor: lockedSession.discountMinor,
          totalMinor: lockedSession.totalMinor,
          lines: {
            create: lockedSession.lines.map((line) => ({
              productId: line.productId,
              productSlug: line.productSlug,
              title: line.title,
              conditionGrade: line.conditionGrade,
              quantity: line.quantity,
              unitPriceMinor: line.unitPriceMinor,
              lineTotalMinor: line.lineTotalMinor,
            })),
          },
          payments: {
            create: {
              provider: providerPayment.provider,
              providerPaymentId: providerPayment.providerPaymentId,
              status: 'PENDING',
              amountMinor: lockedSession.totalMinor,
              currency: lockedSession.currency,
              clientSecret: providerPayment.clientSecret,
              checkoutUrl: providerPayment.checkoutUrl,
            },
          },
        },
        include: {
          lines: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      return created;
    });

    const result = this.toOrder(order);

    if (input.idempotencyKey) {
      await this.prisma.orderIdempotencyKey.create({
        data: {
          checkoutSessionId: session.id,
          key: input.idempotencyKey,
          requestHash: hashOrderRequest(session.id),
          responseBody: result as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return result;
  }

  async getOrder(input: {
    reference: string;
    guestAccessToken?: string;
    customerId?: string;
  }): Promise<Order | null> {
    const order = await this.prisma.order.findFirst({
      where: input.customerId
        ? {
            reference: input.reference,
            customerId: input.customerId,
          }
        : {
            reference: input.reference,
            guestAccessToken: input.guestAccessToken,
          },
      include: {
        lines: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      return null;
    }

    return this.toOrder(order);
  }

  async lookupOrder(input: {
    reference: string;
    email: string;
  }): Promise<Order | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        reference: input.reference,
        email: {
          equals: input.email.trim(),
          mode: 'insensitive',
        },
      },
      include: {
        lines: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      return null;
    }

    return this.toOrder(order);
  }

  async listOrdersForCustomer(customerId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        lines: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return orders.map((order) => this.toOrder(order));
  }

  async claimOrderForCustomer(input: {
    customerId: string;
    customerEmail: string;
    reference: string;
    guestAccessToken?: string;
  }): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { reference: input.reference },
      include: {
        lines: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found or access denied.',
      });
    }

    if (order.customerId && order.customerId !== input.customerId) {
      throw new ConflictException({
        code: 'ORDER_ALREADY_CLAIMED',
        message: 'This order is already linked to another account.',
      });
    }

    const tokenMatches =
      input.guestAccessToken &&
      order.guestAccessToken === input.guestAccessToken;
    const emailMatches =
      order.email.toLowerCase() === input.customerEmail.toLowerCase();

    if (!tokenMatches && !emailMatches) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found or access denied.',
      });
    }

    if (order.customerId === input.customerId) {
      return this.toOrder(order);
    }

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { customerId: input.customerId },
      include: {
        lines: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return this.toOrder(updated);
  }

  async syncStripeCheckoutSession(sessionId: string): Promise<Order> {
    const payment = await this.prisma.payment.findUnique({
      where: { providerPaymentId: sessionId },
      include: {
        order: {
          include: {
            lines: true,
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!payment || payment.provider !== 'stripe') {
      throw new NotFoundException({
        code: 'PAYMENT_NOT_FOUND',
        message: 'Stripe checkout session not found.',
      });
    }

    if (payment.status === 'CAPTURED') {
      return this.toOrder(payment.order);
    }

    const session = await this.stripeProvider.retrieveSession(sessionId);

    if (session.payment_status === 'paid') {
      return this.capturePayment({
        providerPaymentId: sessionId,
        providerEventId: `return_${sessionId}`,
      });
    }

    if (session.status === 'expired') {
      const failed = await this.failPayment(sessionId);
      if (failed) {
        return failed;
      }
    }

    return this.toOrder(payment.order);
  }

  async simulateDevCapture(paymentId: string): Promise<Order> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException({
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment not found.',
      });
    }

    if (payment.provider !== 'dev') {
      throw new ConflictException({
        code: 'SIMULATION_DISABLED',
        message: 'Only dev payments can be simulated.',
      });
    }

    return this.capturePayment({
      providerPaymentId: payment.providerPaymentId,
      providerEventId: `dev_evt_${payment.id}`,
    });
  }

  async capturePayment(input: CapturePaymentInput): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      if (input.providerEventId) {
        const existingEvent = await tx.paymentWebhookEvent.findUnique({
          where: { providerEventId: input.providerEventId },
        });

        if (existingEvent?.processedAt) {
          const payment = await tx.payment.findUnique({
            where: { providerPaymentId: input.providerPaymentId },
            include: {
              order: {
                include: {
                  lines: true,
                  payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                  },
                },
              },
            },
          });

          if (!payment) {
            throw new NotFoundException({
              code: 'PAYMENT_NOT_FOUND',
              message: 'Payment not found.',
            });
          }

          return this.toOrder(payment.order);
        }

        await tx.paymentWebhookEvent.upsert({
          where: { providerEventId: input.providerEventId },
          create: {
            provider: 'stripe',
            providerEventId: input.providerEventId,
            payload: {},
            processedAt: new Date(),
          },
          update: {
            processedAt: new Date(),
          },
        });
      }

      const payment = await tx.payment.findUnique({
        where: { providerPaymentId: input.providerPaymentId },
        include: {
          order: {
            include: {
              checkoutSession: {
                include: {
                  reservations: {
                    where: { status: 'ACTIVE' },
                  },
                  cart: true,
                },
              },
              lines: true,
              payments: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      if (!payment) {
        throw new NotFoundException({
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found.',
        });
      }

      if (payment.status === 'CAPTURED') {
        return this.toOrder(payment.order);
      }

      const now = new Date();

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CAPTURED',
          capturedAt: now,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paidAt: now,
        },
      });

      for (const reservation of payment.order.checkoutSession.reservations) {
        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: {
            status: 'CONVERTED',
            releasedAt: now,
          },
        });

        const inventory = await tx.inventoryItem.update({
          where: { id: reservation.inventoryItemId },
          data: {
            quantityAvailable: { decrement: reservation.quantity },
            quantityReserved: { decrement: reservation.quantity },
          },
        });

        await tx.inventoryAdjustment.create({
          data: {
            inventoryItemId: reservation.inventoryItemId,
            delta: -reservation.quantity,
            reason: 'order_paid',
            actorType: 'system',
            actorId: payment.order.reference,
          },
        });

        if (inventory.quantityAvailable <= 0) {
          await tx.inventoryItem.update({
            where: { id: reservation.inventoryItemId },
            data: { status: 'SOLD' },
          });
        }
      }

      await tx.checkoutSession.update({
        where: { id: payment.order.checkoutSessionId },
        data: { status: 'COMPLETED' },
      });

      await tx.cartLine.deleteMany({
        where: { cartId: payment.order.checkoutSession.cartId },
      });

      await tx.outboxEvent.create({
        data: {
          eventName: 'order.paid.v1',
          aggregateId: payment.orderId,
          payload: {
            orderId: payment.orderId,
          },
        },
      });

      const updatedOrder = await tx.order.findUnique({
        where: { id: payment.orderId },
        include: {
          lines: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      return this.toOrder(updatedOrder!);
    });
  }

  async failPayment(providerPaymentId: string): Promise<Order | null> {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { providerPaymentId },
        include: {
          order: {
            include: {
              checkoutSession: {
                include: {
                  reservations: {
                    where: { status: 'ACTIVE' },
                  },
                },
              },
              lines: true,
              payments: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      if (!payment || payment.status === 'CAPTURED') {
        return payment ? this.toOrder(payment.order) : null;
      }

      const now = new Date();

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failedAt: now,
        },
      });

      for (const reservation of payment.order.checkoutSession.reservations) {
        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: {
            status: 'RELEASED',
            releasedAt: now,
          },
        });

        await tx.inventoryItem.update({
          where: { id: reservation.inventoryItemId },
          data: {
            quantityReserved: { decrement: reservation.quantity },
          },
        });
      }

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'CANCELLED' },
      });

      await tx.checkoutSession.update({
        where: { id: payment.order.checkoutSessionId },
        data: { status: 'CANCELLED' },
      });

      const updatedOrder = await tx.order.findUnique({
        where: { id: payment.orderId },
        include: {
          lines: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      return updatedOrder ? this.toOrder(updatedOrder) : null;
    });
  }

  private toOrder(
    order: {
      id: string;
      reference: string;
      guestAccessToken: string;
      email: string;
      status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED';
      fulfillmentStatus:
        | 'PENDING'
        | 'PROCESSING'
        | 'SHIPPED'
        | 'DELIVERED'
        | 'CANCELLED';
      currency: string;
      shippingMethod: string;
      subtotalMinor: number;
      shippingMinor: number;
      taxMinor: number;
      discountMinor: number;
      totalMinor: number;
      paidAt: Date | null;
      createdAt: Date;
      lines: Array<{
        productSlug: string;
        title: string;
        conditionGrade: string;
        quantity: number;
        unitPriceMinor: number;
        lineTotalMinor: number;
      }>;
      payments: Array<{
        id: string;
        provider: string;
        providerPaymentId: string;
        status: PaymentSummary['status'];
        amountMinor: number;
        currency: string;
        clientSecret: string | null;
        checkoutUrl: string | null;
      }>;
    },
  ): Order {
    const lines: OrderLine[] = order.lines.map((line) => ({
      productSlug: line.productSlug,
      title: line.title,
      conditionGrade: line.conditionGrade,
      quantity: line.quantity,
      unitPrice: toMoney(line.unitPriceMinor, order.currency),
      lineTotal: toMoney(line.lineTotalMinor, order.currency),
    }));

    const latestPayment = order.payments[0] ?? null;
    const payment: PaymentSummary | null = latestPayment
      ? {
          id: latestPayment.id,
          provider: latestPayment.provider,
          providerPaymentId: latestPayment.providerPaymentId,
          status: latestPayment.status,
          amount: toMoney(latestPayment.amountMinor, latestPayment.currency),
          clientSecret: latestPayment.clientSecret,
          checkoutUrl: latestPayment.checkoutUrl,
        }
      : null;

    return {
      id: order.id,
      reference: order.reference,
      guestAccessToken: order.guestAccessToken,
      email: order.email,
      status: order.status,
      fulfillmentStatus: order.fulfillmentStatus,
      currency: order.currency,
      shippingMethod: order.shippingMethod,
      lines,
      subtotal: toMoney(order.subtotalMinor, order.currency),
      shipping: toMoney(order.shippingMinor, order.currency),
      tax: toMoney(order.taxMinor, order.currency),
      discount: toMoney(order.discountMinor, order.currency),
      total: toMoney(order.totalMinor, order.currency),
      payment,
      paidAt: order.paidAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
