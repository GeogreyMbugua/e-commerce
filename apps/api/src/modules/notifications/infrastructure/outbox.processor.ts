import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../../shared/config/env.schema.js';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import {
  EMAIL_SENDER,
  type EmailSender,
} from '../application/ports/email.sender.js';
import {
  ORDER_PAID_EVENT,
  type OrderPaidPayload,
} from '../domain/notification.constants.js';
import { formatMoney } from './format-money.js';

@Injectable()
export class OutboxProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) {}

  async processPending(limit = 20): Promise<void> {
    const events = await this.prisma.outboxEvent.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    for (const event of events) {
      await this.processEvent(event.id);
    }
  }

  async processForAggregate(aggregateId: string): Promise<void> {
    const events = await this.prisma.outboxEvent.findMany({
      where: {
        aggregateId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'asc' },
    });

    for (const event of events) {
      await this.processEvent(event.id);
    }
  }

  private async processEvent(eventId: string): Promise<void> {
    const event = await this.prisma.outboxEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || event.status !== 'PENDING') {
      return;
    }

    try {
      if (event.eventName === ORDER_PAID_EVENT) {
        await this.handleOrderPaid(event.payload as OrderPaidPayload);
      }

      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          attempts: { increment: 1 },
        },
      });
    } catch (error) {
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'FAILED',
          attempts: { increment: 1 },
          lastError:
            error instanceof Error ? error.message : 'Unknown notification error',
        },
      });
    }
  }

  private async handleOrderPaid(payload: OrderPaidPayload): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: payload.orderId },
      include: { lines: true },
    });

    if (!order) {
      throw new Error(`Order ${payload.orderId} not found for notification.`);
    }

    const storefrontUrl =
      this.config.get('STOREFRONT_URL', { infer: true }) ??
      'http://localhost:3000';
    const basePath = this.config.get('STOREFRONT_BASE_PATH', { infer: true }) ?? '';
    const orderUrl = new URL(
      `${basePath}/order-confirmation`,
      storefrontUrl,
    );
    orderUrl.searchParams.set('reference', order.reference);
    orderUrl.searchParams.set('token', order.guestAccessToken);

    await this.emailSender.sendOrderConfirmation({
      to: order.email,
      reference: order.reference,
      totalLabel: formatMoney(order.totalMinor, order.currency),
      orderUrl: orderUrl.toString(),
      lines: order.lines.map((line) => ({
        title: line.title,
        quantity: line.quantity,
        lineTotalLabel: formatMoney(line.lineTotalMinor, order.currency),
      })),
    });
  }
}
