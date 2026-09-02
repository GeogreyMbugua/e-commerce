import { Module } from '@nestjs/common';
import {
  CancelCheckoutSessionUseCase,
  CreateCheckoutSessionUseCase,
  CreateQuoteUseCase,
  GetCheckoutSessionUseCase,
} from './application/checkout.use-cases.js';
import { checkoutRepositoryProvider } from './application/ports/checkout.repository.js';
import { PrismaCheckoutRepository } from './infrastructure/prisma-checkout.repository.js';
import { CheckoutController } from './presentation/checkout.controller.js';

@Module({
  controllers: [CheckoutController],
  providers: [
    PrismaCheckoutRepository,
    checkoutRepositoryProvider,
    CreateQuoteUseCase,
    CreateCheckoutSessionUseCase,
    GetCheckoutSessionUseCase,
    CancelCheckoutSessionUseCase,
  ],
})
export class CheckoutModule {}
