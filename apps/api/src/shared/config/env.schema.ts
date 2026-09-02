import { z } from 'zod';

const logLevelSchema = z.enum([
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
]);

const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: logLevelSchema.default('info'),
  API_PREFIX: z.string().default('api/v1'),
  CORS_ORIGIN: z.string().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().min(1).optional(),
  ),
  STRIPE_WEBHOOK_SECRET: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().min(1).optional(),
  ),
  OIDC_ISSUER: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().url().optional(),
  ),
  OIDC_AUDIENCE: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().min(1).optional(),
  ),
  OIDC_JWKS_URI: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().url().optional(),
  ),
  DEV_JWT_SECRET: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().min(16).optional(),
  ),
  STOREFRONT_URL: z.string().url().optional(),
  STOREFRONT_BASE_PATH: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  THROTTLE_TTL_MS: z.coerce.number().int().positive().default(60_000),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
});

export const envSchema = baseEnvSchema.superRefine((env, context) => {
  if (env.NODE_ENV !== 'test' && !env.DATABASE_URL) {
    context.addIssue({
      code: 'custom',
      message: 'DATABASE_URL is required outside test environments.',
      path: ['DATABASE_URL'],
    });
  }
});

export type Env = z.infer<typeof baseEnvSchema>;

export const validateEnv = (config: Record<string, unknown>): Env =>
  envSchema.parse(config);
