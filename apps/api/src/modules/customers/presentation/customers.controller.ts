import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { AuthenticatedCustomer } from '../../../shared/auth/auth.types.js';
import { AuthRequired } from '../../../shared/auth/auth-required.decorator.js';
import { CurrentCustomer } from '../../../shared/auth/current-customer.decorator.js';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe.js';
import {
  ClaimCustomerOrderUseCase,
  CreateCustomerAddressUseCase,
  DeleteCustomerAddressUseCase,
  GetCustomerProfileUseCase,
  ListCustomerAddressesUseCase,
  ListCustomerOrdersUseCase,
  UpdateCustomerAddressUseCase,
  UpdateCustomerProfileUseCase,
} from '../application/customers.use-cases.js';
import {
  addressIdParamSchema,
  claimOrderSchema,
  customerAddressSchema,
  orderReferenceParamSchema,
  updateCustomerProfileSchema,
} from './customers.schemas.js';

@Controller('customers/me')
@AuthRequired()
export class CustomersController {
  constructor(
    private readonly getProfile: GetCustomerProfileUseCase,
    private readonly updateProfile: UpdateCustomerProfileUseCase,
    private readonly listAddresses: ListCustomerAddressesUseCase,
    private readonly createAddress: CreateCustomerAddressUseCase,
    private readonly updateAddress: UpdateCustomerAddressUseCase,
    private readonly deleteAddress: DeleteCustomerAddressUseCase,
    private readonly listOrders: ListCustomerOrdersUseCase,
    private readonly claimOrder: ClaimCustomerOrderUseCase,
  ) {}

  @Get()
  async show(@CurrentCustomer() customer: AuthenticatedCustomer) {
    const profile = await this.getProfile.execute(customer.id);

    if (!profile) {
      throw new NotFoundException({
        code: 'CUSTOMER_NOT_FOUND',
        message: 'Customer profile not found.',
      });
    }

    return profile;
  }

  @Patch()
  update(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Body(new ZodValidationPipe(updateCustomerProfileSchema))
    body: ReturnType<typeof updateCustomerProfileSchema.parse>,
  ) {
    return this.updateProfile.execute({
      customerId: customer.id,
      ...body,
    });
  }

  @Get('addresses')
  addresses(@CurrentCustomer() customer: AuthenticatedCustomer) {
    return this.listAddresses.execute(customer.id);
  }

  @Post('addresses')
  addAddress(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Body(new ZodValidationPipe(customerAddressSchema))
    body: ReturnType<typeof customerAddressSchema.parse>,
  ) {
    return this.createAddress.execute({
      customerId: customer.id,
      ...body,
    });
  }

  @Patch('addresses/:addressId')
  editAddress(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Param(new ZodValidationPipe(addressIdParamSchema))
    params: ReturnType<typeof addressIdParamSchema.parse>,
    @Body(new ZodValidationPipe(customerAddressSchema))
    body: ReturnType<typeof customerAddressSchema.parse>,
  ) {
    return this.updateAddress.execute({
      customerId: customer.id,
      addressId: params.addressId,
      ...body,
    });
  }

  @Delete('addresses/:addressId')
  removeAddress(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Param(new ZodValidationPipe(addressIdParamSchema))
    params: ReturnType<typeof addressIdParamSchema.parse>,
  ) {
    return this.deleteAddress.execute(customer.id, params.addressId);
  }

  @Get('orders')
  orders(@CurrentCustomer() customer: AuthenticatedCustomer) {
    return this.listOrders.execute(customer.id);
  }

  @Post('orders/:reference/claim')
  claim(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Param(new ZodValidationPipe(orderReferenceParamSchema))
    params: ReturnType<typeof orderReferenceParamSchema.parse>,
    @Body(new ZodValidationPipe(claimOrderSchema))
    body: ReturnType<typeof claimOrderSchema.parse>,
  ) {
    return this.claimOrder.execute({
      customerId: customer.id,
      customerEmail: customer.email,
      reference: params.reference,
      guestAccessToken: body.guestAccessToken,
    });
  }
}
