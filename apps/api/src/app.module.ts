import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppConfigModule } from './shared/config/app-config.module.js';
import type { Env } from './shared/config/env.schema.js';
import { HealthModule } from './shared/health/health.module.js';
import { PrismaModule } from './shared/database/prisma.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { CheckoutModule } from './modules/checkout/checkout.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { CustomersModule } from './modules/customers/customers.module.js';
import { AuthModule } from './shared/auth/auth.module.js';

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    PrismaModule,
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      providers: [],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL', { infer: true }),
          transport:
            config.get('NODE_ENV', { infer: true }) !== 'production'
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                  },
                }
              : undefined,
          redact: ['req.headers.authorization', 'req.headers.cookie'],
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        throttlers: [
          {
            ttl: config.get('THROTTLE_TTL_MS', { infer: true }),
            limit: config.get('THROTTLE_LIMIT', { infer: true }),
          },
        ],
      }),
    }),
    HealthModule,
    CatalogModule,
    CartModule,
    CheckoutModule,
    OrdersModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
