import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AdminGuard } from './admin.guard.js';
import { CustomerIdentityService } from './customer-identity.service.js';
import { DevAuthController } from './dev-auth.controller.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { TokenVerifierService } from './token-verifier.service.js';

@Global()
@Module({
  controllers: [DevAuthController],
  providers: [
    TokenVerifierService,
    CustomerIdentityService,
    JwtAuthGuard,
    AdminGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
  ],
  exports: [
    TokenVerifierService,
    CustomerIdentityService,
    JwtAuthGuard,
    AdminGuard,
  ],
})
export class AuthModule {}
