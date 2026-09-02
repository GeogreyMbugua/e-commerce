import { Module } from '@nestjs/common';
import {
  ClaimCustomerOrderUseCase,
  CreateCustomerAddressUseCase,
  DeleteCustomerAddressUseCase,
  GetCustomerProfileUseCase,
  ListCustomerAddressesUseCase,
  ListCustomerOrdersUseCase,
  UpdateCustomerAddressUseCase,
  UpdateCustomerProfileUseCase,
} from './application/customers.use-cases.js';
import { CUSTOMER_REPOSITORY } from './application/ports/customer.repository.js';
import { PrismaCustomerRepository } from './infrastructure/prisma-customer.repository.js';
import { CustomersController } from './presentation/customers.controller.js';
import { OrdersModule } from '../orders/orders.module.js';

@Module({
  imports: [OrdersModule],
  controllers: [CustomersController],
  providers: [
    GetCustomerProfileUseCase,
    UpdateCustomerProfileUseCase,
    ListCustomerAddressesUseCase,
    CreateCustomerAddressUseCase,
    UpdateCustomerAddressUseCase,
    DeleteCustomerAddressUseCase,
    ListCustomerOrdersUseCase,
    ClaimCustomerOrderUseCase,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },
  ],
})
export class CustomersModule {}
