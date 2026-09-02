import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import type { Env } from '../../../shared/config/env.schema.js';
import {
  CapturePaymentUseCase,
  FailPaymentUseCase,
  SimulateDevPaymentUseCase,
  SyncStripeCheckoutSessionUseCase,
} from '../application/orders.use-cases.js';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from '../application/ports/payment.provider.js';

@Controller()
export class PaymentsController {
  constructor(
    private readonly capturePayment: CapturePaymentUseCase,
    private readonly failPayment: FailPaymentUseCase,
    private readonly simulateDevPayment: SimulateDevPaymentUseCase,
    private readonly syncStripeCheckoutSession: SyncStripeCheckoutSessionUseCase,
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: PaymentProvider,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Get('payments/stripe/session-status')
  stripeSessionStatus(@Query('session_id') sessionId: string | undefined) {
    if (!sessionId) {
      throw new NotFoundException({
        code: 'SESSION_ID_REQUIRED',
        message: 'session_id is required.',
      });
    }

    return this.syncStripeCheckoutSession.execute(sessionId);
  }

  @Post('payments/webhooks/:provider')
  async webhook(
    @Param('provider') provider: string,
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') stripeSignature: string | undefined,
  ) {
    if (provider !== 'stripe') {
      throw new BadRequestException({
        code: 'UNSUPPORTED_PAYMENT_PROVIDER',
        message: `Webhook provider "${provider}" is not supported.`,
      });
    }

    const payload = request.rawBody;

    if (!payload) {
      throw new BadRequestException({
        code: 'WEBHOOK_PAYLOAD_MISSING',
        message: 'Webhook payload is required.',
      });
    }

    const event = await this.paymentProvider.verifyWebhook(
      payload,
      stripeSignature,
    );

    if (event.eventType === 'ignored') {
      return { received: true, status: 'ignored' };
    }

    if (event.eventType === 'payment_succeeded') {
      return this.capturePayment.execute({
        providerPaymentId: event.providerPaymentId,
        providerEventId: event.providerEventId,
      });
    }

    await this.failPayment.execute(event.providerPaymentId);
    return { status: 'failed' };
  }

  @Post('payments/:paymentId/simulate-capture')
  simulateCapture(@Param('paymentId') paymentId: string) {
    const nodeEnv = this.config.get('NODE_ENV', { infer: true });

    if (nodeEnv === 'production') {
      throw new ForbiddenException({
        code: 'SIMULATION_DISABLED',
        message: 'Payment simulation is disabled in production.',
      });
    }

    if (this.paymentProvider.name !== 'dev') {
      throw new ForbiddenException({
        code: 'SIMULATION_DISABLED',
        message: 'Payment simulation is only available with the dev provider.',
      });
    }

    return this.simulateDevPayment.execute(paymentId);
  }
}
