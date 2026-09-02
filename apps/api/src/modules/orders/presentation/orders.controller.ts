import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import {
  CreateOrderUseCase,
  GetOrderUseCase,
  LookupOrderUseCase,
} from '../application/orders.use-cases.js';
import {
  lookupOrderSchema,
  type LookupOrderBody,
} from './orders.schemas.js';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe.js';
import {
  getRequestCustomer,
  type AuthRequest,
} from '../../../shared/auth/current-customer.decorator.js';
import { Body } from '@nestjs/common';

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

const readOrderAccessToken = (headers: Record<string, string | undefined>) => {
  return headers['x-order-access-token'];
};

@Controller()
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly getOrder: GetOrderUseCase,
    private readonly lookupOrder: LookupOrderUseCase,
  ) {}

  @Post('orders')
  create(
    @Headers() headers: Record<string, string | undefined>,
    @Req() request: AuthRequest,
  ) {
    const customer = getRequestCustomer(request);

    return this.createOrder.execute({
      checkoutGuestToken: readCheckoutToken(headers),
      idempotencyKey: headers['idempotency-key'],
      customerId: customer?.id,
    });
  }

  @Post('orders/lookup')
  lookup(
    @Body(new ZodValidationPipe(lookupOrderSchema)) body: LookupOrderBody,
  ) {
    return this.lookupOrder.execute(body);
  }

  @Get('orders/:reference')
  show(
    @Param('reference') reference: string,
    @Headers() headers: Record<string, string | undefined>,
    @Req() request: AuthRequest,
  ) {
    const customer = getRequestCustomer(request);
    const guestAccessToken = readOrderAccessToken(headers);

    return this.getOrder.execute({
      reference,
      guestAccessToken,
      customerId: customer?.id,
    });
  }
}
