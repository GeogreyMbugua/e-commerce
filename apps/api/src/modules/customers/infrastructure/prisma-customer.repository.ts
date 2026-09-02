import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import type {
  CreateCustomerAddressInput,
  CustomerAddress,
  CustomerProfile,
  UpdateCustomerAddressInput,
  UpdateCustomerProfileInput,
} from '../domain/customer.types.js';
import type { CustomerRepository } from '../application/ports/customer.repository.js';

const toProfile = (customer: {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: Date;
}): CustomerProfile => ({
  id: customer.id,
  email: customer.email,
  emailVerified: customer.emailVerified,
  firstName: customer.firstName,
  lastName: customer.lastName,
  phone: customer.phone,
  createdAt: customer.createdAt.toISOString(),
});

const toAddress = (address: {
  id: string;
  label: string | null;
  type: 'SHIPPING' | 'BILLING';
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}): CustomerAddress => ({
  id: address.id,
  label: address.label,
  type: address.type,
  name: address.name,
  line1: address.line1,
  line2: address.line2,
  city: address.city,
  region: address.region,
  postalCode: address.postalCode,
  country: address.country,
  phone: address.phone,
  isDefault: address.isDefault,
});

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(customerId: string): Promise<CustomerProfile | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    return customer ? toProfile(customer) : null;
  }

  async updateProfile(input: UpdateCustomerProfileInput): Promise<CustomerProfile> {
    const customer = await this.prisma.customer.update({
      where: { id: input.customerId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
    });

    return toProfile(customer);
  }

  async listAddresses(customerId: string): Promise<CustomerAddress[]> {
    const addresses = await this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    return addresses.map(toAddress);
  }

  async createAddress(input: CreateCustomerAddressInput): Promise<CustomerAddress> {
    return this.prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId: input.customerId, type: input.type ?? 'SHIPPING' },
          data: { isDefault: false },
        });
      }

      const address = await tx.customerAddress.create({
        data: {
          customerId: input.customerId,
          label: input.label,
          type: input.type ?? 'SHIPPING',
          name: input.name,
          line1: input.line1,
          line2: input.line2,
          city: input.city,
          region: input.region,
          postalCode: input.postalCode,
          country: input.country,
          phone: input.phone,
          isDefault: input.isDefault ?? false,
        },
      });

      return toAddress(address);
    });
  }

  async updateAddress(input: UpdateCustomerAddressInput): Promise<CustomerAddress> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.customerAddress.findFirst({
        where: { id: input.addressId, customerId: input.customerId },
      });

      if (!existing) {
        throw new NotFoundException({
          code: 'ADDRESS_NOT_FOUND',
          message: 'Address not found.',
        });
      }

      if (input.isDefault) {
        await tx.customerAddress.updateMany({
          where: {
            customerId: input.customerId,
            type: input.type ?? existing.type,
            id: { not: input.addressId },
          },
          data: { isDefault: false },
        });
      }

      const address = await tx.customerAddress.update({
        where: { id: input.addressId },
        data: {
          label: input.label,
          type: input.type ?? existing.type,
          name: input.name,
          line1: input.line1,
          line2: input.line2,
          city: input.city,
          region: input.region,
          postalCode: input.postalCode,
          country: input.country,
          phone: input.phone,
          isDefault: input.isDefault ?? existing.isDefault,
        },
      });

      return toAddress(address);
    });
  }

  async deleteAddress(customerId: string, addressId: string): Promise<void> {
    const result = await this.prisma.customerAddress.deleteMany({
      where: { id: addressId, customerId },
    });

    if (result.count === 0) {
      throw new NotFoundException({
        code: 'ADDRESS_NOT_FOUND',
        message: 'Address not found.',
      });
    }
  }
}
