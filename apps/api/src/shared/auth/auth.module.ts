import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
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
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [TokenVerifierService, CustomerIdentityService, JwtAuthGuard],
})
export class AuthModule {}
