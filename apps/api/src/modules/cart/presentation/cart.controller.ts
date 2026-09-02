import {
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Body,
  Req,
} from '@nestjs/common';
import {
  AddCartLineUseCase,
  ClearCartUseCase,
  CreateCartUseCase,
  GetCurrentCartUseCase,
  GetCustomerCartUseCase,
  MergeGuestCartUseCase,
  RemoveCartLineUseCase,
  UpdateCartLineUseCase,
} from '../application/cart.use-cases.js';
import { AuthRequired } from '../../../shared/auth/auth-required.decorator.js';
import { CurrentCustomer, getRequestCustomer, type AuthRequest } from '../../../shared/auth/current-customer.decorator.js';
import type { AuthenticatedCustomer } from '../../../shared/auth/auth.types.js';
import {
  cartLineBodySchema,
  cartProductSlugParamSchema,
  createCartBodySchema,
  updateCartLineBodySchema,
} from './cart.schemas.js';
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

@Controller('carts')
export class CartController {
  constructor(
    private readonly createCart: CreateCartUseCase,
    private readonly getCurrentCart: GetCurrentCartUseCase,
    private readonly getCustomerCart: GetCustomerCartUseCase,
    private readonly mergeGuestCart: MergeGuestCartUseCase,
    private readonly addCartLine: AddCartLineUseCase,
    private readonly updateCartLine: UpdateCartLineUseCase,
    private readonly removeCartLine: RemoveCartLineUseCase,
    private readonly clearCart: ClearCartUseCase,
  ) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createCartBodySchema))
    body: ReturnType<typeof createCartBodySchema.parse>,
  ) {
    return this.createCart.execute(body);
  }

  @Get('current')
  async current(
    @Headers() headers: Record<string, string | undefined>,
    @Req() request: AuthRequest,
  ) {
    const authenticatedCustomer = getRequestCustomer(request);

    if (authenticatedCustomer) {
      const customerCart = await this.getCustomerCart.execute(
        authenticatedCustomer.id,
      );

      if (customerCart) {
        return customerCart;
      }
    }

    const guestToken = headers['x-cart-token'];

    if (!guestToken) {
      throw new NotFoundException({
        code: 'CART_NOT_FOUND',
        message: 'Cart not found or expired.',
      });
    }

    const cart = await this.getCurrentCart.execute(guestToken);

    if (!cart) {
      throw new NotFoundException({
        code: 'CART_NOT_FOUND',
        message: 'Cart not found or expired.',
      });
    }

    return cart;
  }

  @Post('current/merge')
  @AuthRequired()
  merge(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Headers() headers: Record<string, string | undefined>,
  ) {
    const guestToken = readCartToken(headers);

    return this.mergeGuestCart.execute({
      guestToken,
      customerId: customer.id,
    });
  }

  @Post('current/lines')
  addLine(
    @Headers() headers: Record<string, string | undefined>,
    @Body(new ZodValidationPipe(cartLineBodySchema))
    body: ReturnType<typeof cartLineBodySchema.parse>,
  ) {
    const guestToken = readCartToken(headers);

    return this.addCartLine.execute({
      guestToken,
      productSlug: body.productSlug,
      quantity: body.quantity,
      idempotencyKey: headers['idempotency-key'],
    });
  }

  @Patch('current/lines/:productSlug')
  updateLine(
    @Headers() headers: Record<string, string | undefined>,
    @Param(new ZodValidationPipe(cartProductSlugParamSchema))
    params: ReturnType<typeof cartProductSlugParamSchema.parse>,
    @Body(new ZodValidationPipe(updateCartLineBodySchema))
    body: ReturnType<typeof updateCartLineBodySchema.parse>,
  ) {
    const guestToken = readCartToken(headers);

    return this.updateCartLine.execute({
      guestToken,
      productSlug: params.productSlug,
      quantity: body.quantity,
    });
  }

  @Delete('current/lines/:productSlug')
  removeLine(
    @Headers() headers: Record<string, string | undefined>,
    @Param(new ZodValidationPipe(cartProductSlugParamSchema))
    params: ReturnType<typeof cartProductSlugParamSchema.parse>,
  ) {
    const guestToken = readCartToken(headers);

    return this.removeCartLine.execute({
      guestToken,
      productSlug: params.productSlug,
    });
  }

  @Delete('current')
  clear(@Headers() headers: Record<string, string | undefined>) {
    const guestToken = readCartToken(headers);
    return this.clearCart.execute(guestToken);
  }
}
