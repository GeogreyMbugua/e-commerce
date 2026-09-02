import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../shared/config/env.schema.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import {
  CapturePaymentUseCase,
  CreateOrderUseCase,
  FailPaymentUseCase,
  GetOrderUseCase,
  LookupOrderUseCase,
  SimulateDevPaymentUseCase,
  SyncStripeCheckoutSessionUseCase,
} from './application/orders.use-cases.js';
import { ORDER_REPOSITORY } from './application/ports/order.repository.js';
import { PAYMENT_PROVIDER } from './application/ports/payment.provider.js';
import { DevPaymentProvider } from './infrastructure/dev-payment.provider.js';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository.js';
import {
  STRIPE_PAYMENT_PROVIDER,
  StripePaymentProvider,
} from './infrastructure/stripe-payment.provider.js';
import { OrdersController } from './presentation/orders.controller.js';
import { PaymentsController } from './presentation/payments.controller.js';

@Module({
  imports: [NotificationsModule],
  controllers: [OrdersController, PaymentsController],
  providers: [
    CreateOrderUseCase,
    GetOrderUseCase,
    LookupOrderUseCase,
    CapturePaymentUseCase,
    FailPaymentUseCase,
    SimulateDevPaymentUseCase,
    SyncStripeCheckoutSessionUseCase,
    DevPaymentProvider,
    StripePaymentProvider,
    {
      provide: STRIPE_PAYMENT_PROVIDER,
      useExisting: StripePaymentProvider,
    },
    {
      provide: PAYMENT_PROVIDER,
      useFactory: (
        config: ConfigService<Env, true>,
        devProvider: DevPaymentProvider,
        stripeProvider: StripePaymentProvider,
      ) => {
        const stripeKey = config.get('STRIPE_SECRET_KEY', { infer: true });
        return stripeKey ? stripeProvider : devProvider;
      },
      inject: [ConfigService, DevPaymentProvider, StripePaymentProvider],
    },
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersModule {}
