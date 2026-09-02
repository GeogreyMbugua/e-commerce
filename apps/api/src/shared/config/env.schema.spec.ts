import { describe, expect, it } from 'vitest';
import { envSchema } from './env.schema.js';

describe('envSchema', () => {
  it('applies defaults for a minimal environment', () => {
    expect(
      envSchema.parse({
        NODE_ENV: 'test',
      }),
    ).toEqual({
      NODE_ENV: 'test',
      PORT: 3000,
      LOG_LEVEL: 'info',
      API_PREFIX: 'api/v1',
      THROTTLE_TTL_MS: 60_000,
      THROTTLE_LIMIT: 100,
    });
  });

  it('rejects invalid log levels', () => {
    expect(() =>
      envSchema.parse({
        LOG_LEVEL: 'verbose',
      }),
    ).toThrow();
  });

  it('requires DATABASE_URL outside test environments', () => {
    expect(() =>
      envSchema.parse({
        NODE_ENV: 'development',
      }),
    ).toThrow();
  });
});
