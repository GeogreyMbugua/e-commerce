import { Inject, Injectable } from '@nestjs/common';
import type { Order } from '../../orders/domain/order.types.js';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../../orders/application/ports/order.repository.js';
import type {
  CreateCustomerAddressInput,
  CustomerAddress,
  CustomerProfile,
  UpdateCustomerAddressInput,
  UpdateCustomerProfileInput,
} from '../domain/customer.types.js';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from './ports/customer.repository.js';

@Injectable()
export class GetCustomerProfileUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepository,
  ) {}

  execute(customerId: string): Promise<CustomerProfile | null> {
    return this.customers.getProfile(customerId);
  }
}

@Injectable()
export class UpdateCustomerProfileUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepository,
  ) {}

  execute(input: UpdateCustomerProfileInput): Promise<CustomerProfile> {
    return this.customers.updateProfile(input);
  }
}

@Injectable()
export class ListCustomerAddressesUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepository,
  ) {}

  execute(customerId: string): Promise<CustomerAddress[]> {
    return this.customers.listAddresses(customerId);
  }
}

@Injectable()
export class CreateCustomerAddressUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepository,
  ) {}

  execute(input: CreateCustomerAddressInput): Promise<CustomerAddress> {
    return this.customers.createAddress(input);
  }
}

@Injectable()
export class UpdateCustomerAddressUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepository,
  ) {}

  execute(input: UpdateCustomerAddressInput): Promise<CustomerAddress> {
    return this.customers.updateAddress(input);
  }
}

@Injectable()
export class DeleteCustomerAddressUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepository,
  ) {}

  execute(customerId: string, addressId: string): Promise<void> {
    return this.customers.deleteAddress(customerId, addressId);
  }
}

@Injectable()
export class ListCustomerOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  execute(customerId: string): Promise<Order[]> {
    return this.orders.listOrdersForCustomer(customerId);
  }
}

@Injectable()
export class ClaimCustomerOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  execute(input: {
    customerId: string;
    customerEmail: string;
    reference: string;
    guestAccessToken?: string;
  }): Promise<Order> {
    return this.orders.claimOrderForCustomer(input);
  }
}
