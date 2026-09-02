import { Module } from '@nestjs/common';
import {
  AddCartLineUseCase,
  ClearCartUseCase,
  CreateCartUseCase,
  GetCurrentCartUseCase,
  GetCustomerCartUseCase,
  MergeGuestCartUseCase,
  RemoveCartLineUseCase,
  UpdateCartLineUseCase,
} from './application/cart.use-cases.js';
import { CART_REPOSITORY } from './application/ports/cart.repository.js';
import { PrismaCartRepository } from './infrastructure/prisma-cart.repository.js';
import { CartController } from './presentation/cart.controller.js';

@Module({
  controllers: [CartController],
  providers: [
    CreateCartUseCase,
    GetCurrentCartUseCase,
    GetCustomerCartUseCase,
    MergeGuestCartUseCase,
    AddCartLineUseCase,
    UpdateCartLineUseCase,
    RemoveCartLineUseCase,
    ClearCartUseCase,
    {
      provide: CART_REPOSITORY,
      useClass: PrismaCartRepository,
    },
  ],
})
export class CartModule {}
