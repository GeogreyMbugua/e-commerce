import { createClerkClient, type ClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.schema.js';

export const CLERK_CLIENT = Symbol('CLERK_CLIENT');

export const ClerkClientProvider = {
  provide: CLERK_CLIENT,
  useFactory: (config: ConfigService<Env, true>): ClerkClient | null => {
    const secretKey = config.get('CLERK_SECRET_KEY', { infer: true });
    if (!secretKey) {
      return null;
    }

    return createClerkClient({
      secretKey,
      publishableKey: config.get('CLERK_PUBLISHABLE_KEY', { infer: true }),
    });
  },
  inject: [ConfigService],
};
