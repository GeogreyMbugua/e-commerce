import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SignJWT,
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
} from 'jose';
import type { Env } from '../config/env.schema.js';
import type { AuthClaims } from './auth.types.js';

const DEV_ISSUER = 'audiovintage-dev';

@Injectable()
export class TokenVerifierService {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet> | null;
  private readonly oidcIssuer?: string;
  private readonly oidcAudience?: string;
  private readonly devJwtSecret?: string;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.oidcIssuer = this.config.get('OIDC_ISSUER', { infer: true });
    this.oidcAudience = this.config.get('OIDC_AUDIENCE', { infer: true });
    const jwksUri = this.config.get('OIDC_JWKS_URI', { infer: true });

    this.jwks = jwksUri ? createRemoteJWKSet(new URL(jwksUri)) : null;
    this.devJwtSecret = this.config.get('DEV_JWT_SECRET', { infer: true });
  }

  get isOidcConfigured(): boolean {
    return Boolean(this.oidcIssuer && this.oidcAudience && this.jwks);
  }

  get isDevAuthEnabled(): boolean {
    const nodeEnv = this.config.get('NODE_ENV', { infer: true });
    return nodeEnv !== 'production' && Boolean(this.devJwtSecret);
  }

  async verifyAccessToken(token: string): Promise<AuthClaims> {
    if (this.isOidcConfigured) {
      const { payload } = await jwtVerify(token, this.jwks!, {
        issuer: this.oidcIssuer,
        audience: this.oidcAudience,
      });

      return this.toClaims(payload, this.oidcIssuer!);
    }

    if (!this.isDevAuthEnabled || !this.devJwtSecret) {
      throw new Error('Authentication is not configured.');
    }

    const secret = new TextEncoder().encode(this.devJwtSecret);
    const { payload } = await jwtVerify(token, secret, {
      issuer: DEV_ISSUER,
      audience: 'audiovintage-api',
    });

    return this.toClaims(payload, DEV_ISSUER);
  }

  async signDevAccessToken(input: {
    sub: string;
    email: string;
    emailVerified?: boolean;
    givenName?: string;
    familyName?: string;
  }): Promise<string> {
    if (!this.devJwtSecret) {
      throw new Error('DEV_JWT_SECRET is not configured.');
    }

    const secret = new TextEncoder().encode(this.devJwtSecret);
    const now = Math.floor(Date.now() / 1000);

    return new SignJWT({
      email: input.email,
      email_verified: input.emailVerified ?? true,
      given_name: input.givenName,
      family_name: input.familyName,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(input.sub)
      .setIssuer(DEV_ISSUER)
      .setAudience('audiovintage-api')
      .setIssuedAt(now)
      .setExpirationTime(now + 60 * 60 * 8)
      .sign(secret);
  }

  private toClaims(payload: JWTPayload, issuer: string): AuthClaims {
    const email = typeof payload.email === 'string' ? payload.email : undefined;

    if (!payload.sub || !email) {
      throw new Error('Token is missing required claims.');
    }

    return {
      sub: payload.sub,
      iss: issuer,
      email,
      email_verified:
        typeof payload.email_verified === 'boolean'
          ? payload.email_verified
          : undefined,
      given_name:
        typeof payload.given_name === 'string' ? payload.given_name : undefined,
      family_name:
        typeof payload.family_name === 'string'
          ? payload.family_name
          : undefined,
      name: typeof payload.name === 'string' ? payload.name : undefined,
    };
  }
}
