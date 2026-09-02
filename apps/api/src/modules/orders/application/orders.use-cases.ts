import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CapturePaymentInput,
  CreateOrderInput,
  GetOrderInput,
  LookupOrderInput,
  Order,
} from '../domain/order.types.js';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from './ports/order.repository.js';
import { OutboxProcessor } from '../../notifications/infrastructure/outbox.processor.js';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  execute(input: CreateOrderInput): Promise<Order> {
    return this.orders.createOrder(input);
  }
}

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  async execute(input: GetOrderInput): Promise<Order> {
    if (!input.guestAccessToken && !input.customerId) {
      throw new NotFoundException({
        code: 'ORDER_ACCESS_DENIED',
        message: 'Order access token is required.',
      });
    }

    const order = await this.orders.getOrder(input);

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found or access denied.',
      });
    }

    return order;
  }
}

@Injectable()
export class LookupOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  async execute(input: LookupOrderInput): Promise<Order> {
    const order = await this.orders.lookupOrder(input);

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found or access denied.',
      });
    }

    return order;
  }
}

@Injectable()
export class CapturePaymentUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
    private readonly outboxProcessor: OutboxProcessor,
  ) {}

  async execute(input: CapturePaymentInput): Promise<Order> {
    const order = await this.orders.capturePayment(input);
    await this.outboxProcessor.processForAggregate(order.id);
    return order;
  }
}

@Injectable()
export class SyncStripeCheckoutSessionUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
    private readonly outboxProcessor: OutboxProcessor,
  ) {}

  async execute(sessionId: string): Promise<Order> {
    const order = await this.orders.syncStripeCheckoutSession(sessionId);
    await this.outboxProcessor.processForAggregate(order.id);
    return order;
  }
}

@Injectable()
export class SimulateDevPaymentUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
    private readonly outboxProcessor: OutboxProcessor,
  ) {}

  async execute(paymentId: string): Promise<Order> {
    const order = await this.orders.simulateDevCapture(paymentId);
    await this.outboxProcessor.processForAggregate(order.id);
    return order;
  }
}

@Injectable()
export class FailPaymentUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  execute(providerPaymentId: string): Promise<Order | null> {
    return this.orders.failPayment(providerPaymentId);
  }
}
