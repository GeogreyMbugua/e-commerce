import type {
  CreateCustomerAddressInput,
  CustomerAddress,
  CustomerProfile,
  UpdateCustomerAddressInput,
  UpdateCustomerProfileInput,
} from '../../domain/customer.types.js';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepository {
  getProfile(customerId: string): Promise<CustomerProfile | null>;
  updateProfile(input: UpdateCustomerProfileInput): Promise<CustomerProfile>;
  listAddresses(customerId: string): Promise<CustomerAddress[]>;
  createAddress(input: CreateCustomerAddressInput): Promise<CustomerAddress>;
  updateAddress(input: UpdateCustomerAddressInput): Promise<CustomerAddress>;
  deleteAddress(customerId: string, addressId: string): Promise<void>;
}
