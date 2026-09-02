import {
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Post,
  Body,
} from '@nestjs/common';
import {
  CancelCheckoutSessionUseCase,
  CreateCheckoutSessionUseCase,
  CreateQuoteUseCase,
  GetCheckoutSessionUseCase,
} from '../application/checkout.use-cases.js';
import {
  createCheckoutSessionBodySchema,
  createQuoteBodySchema,
} from './checkout.schemas.js';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe.js';

const readCartToken = (headers: Record<string, string | undefined>) => {
  const token = headers['x-cart-token'];

  if (!token) {
    throw new NotFoundException({
      code: 'CART_NOT_FOUND',
      message: 'Cart token is required.',
    });
  }

  return token;
};

const readCheckoutToken = (headers: Record<string, string | undefined>) => {
  const token = headers['x-checkout-session-token'];

  if (!token) {
    throw new NotFoundException({
      code: 'CHECKOUT_SESSION_NOT_FOUND',
      message: 'Checkout session token is required.',
    });
  }

  return token;
};

@Controller()
export class CheckoutController {
  constructor(
    private readonly createQuote: CreateQuoteUseCase,
    private readonly createCheckoutSession: CreateCheckoutSessionUseCase,
    private readonly getCheckoutSession: GetCheckoutSessionUseCase,
    private readonly cancelCheckoutSession: CancelCheckoutSessionUseCase,
  ) {}

  @Post('quotes')
  quote(
    @Headers() headers: Record<string, string | undefined>,
    @Body(new ZodValidationPipe(createQuoteBodySchema))
    body: ReturnType<typeof createQuoteBodySchema.parse>,
  ) {
    return this.createQuote.execute({
      cartGuestToken: readCartToken(headers),
      shippingMethod: body.shippingMethod,
    });
  }

  @Post('checkout-sessions')
  createSession(
    @Headers() headers: Record<string, string | undefined>,
    @Body(new ZodValidationPipe(createCheckoutSessionBodySchema))
    body: ReturnType<typeof createCheckoutSessionBodySchema.parse>,
  ) {
    return this.createCheckoutSession.execute({
      cartGuestToken: readCartToken(headers),
      email: body.email,
      shippingMethod: body.shippingMethod,
      idempotencyKey: headers['idempotency-key'],
    });
  }

  @Get('checkout-sessions/current')
  current(@Headers() headers: Record<string, string | undefined>) {
    return this.getCheckoutSession.execute(readCheckoutToken(headers));
  }

  @Delete('checkout-sessions/current')
  cancel(@Headers() headers: Record<string, string | undefined>) {
    return this.cancelCheckoutSession.execute(readCheckoutToken(headers));
  }
}
