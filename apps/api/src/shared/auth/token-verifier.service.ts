import {
  createClerkClient,
  verifyToken,
  type ClerkClient,
} from '@clerk/backend';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SignJWT,
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
} from 'jose';
import type { Env } from '../config/env.schema.js';
import type { AuthClaims } from './auth.types.js';
import { CLERK_CLIENT } from './clerk-client.provider.js';

const DEV_ISSUER = 'audiovintage-dev';

@Injectable()
export class TokenVerifierService {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet> | null;
  private readonly oidcIssuer?: string;
  private readonly oidcAudience?: string;
  private readonly devJwtSecret?: string;
  private readonly clerkSecretKey?: string;

  constructor(
    private readonly config: ConfigService<Env, true>,
    @Optional()
    @Inject(CLERK_CLIENT)
    private readonly clerkClient: ClerkClient | null,
  ) {
    this.oidcIssuer = this.config.get('OIDC_ISSUER', { infer: true });
    this.oidcAudience = this.config.get('OIDC_AUDIENCE', { infer: true });
    const jwksUri = this.config.get('OIDC_JWKS_URI', { infer: true });

    this.jwks = jwksUri ? createRemoteJWKSet(new URL(jwksUri)) : null;
    this.devJwtSecret = this.config.get('DEV_JWT_SECRET', { infer: true });
    this.clerkSecretKey = this.config.get('CLERK_SECRET_KEY', { infer: true });
  }

  get isClerkConfigured(): boolean {
    return Boolean(this.clerkSecretKey);
  }

  get isOidcConfigured(): boolean {
    return Boolean(this.oidcIssuer && this.oidcAudience && this.jwks);
  }

  get isDevAuthEnabled(): boolean {
    const nodeEnv = this.config.get('NODE_ENV', { infer: true });
    const allowDevAuth = this.config.get('ALLOW_DEV_AUTH', { infer: true });
    const hasSecret = Boolean(this.devJwtSecret);

    if (!hasSecret) {
      return false;
    }

    return nodeEnv !== 'production' || allowDevAuth === true;
  }

  async verifyAccessToken(token: string): Promise<AuthClaims> {
    if (this.isClerkConfigured) {
      return this.verifyClerkToken(token);
    }

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

  private authorizedParties(): string[] | undefined {
    const raw = this.config.get('CLERK_AUTHORIZED_PARTIES', { infer: true });
    if (!raw) {
      return undefined;
    }

    const parties = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    return parties.length > 0 ? parties : undefined;
  }

  private async verifyClerkToken(token: string): Promise<AuthClaims> {
    const secretKey = this.clerkSecretKey!;
    const authorizedParties = this.authorizedParties();
    const payload = await verifyToken(token, {
      secretKey,
      ...(authorizedParties ? { authorizedParties } : {}),
    });

    const issuer =
      typeof payload.iss === 'string' ? payload.iss : 'https://clerk.com';

    let email =
      typeof payload.email === 'string' ? payload.email : undefined;
    let emailVerified =
      typeof payload.email_verified === 'boolean'
        ? payload.email_verified
        : undefined;
    let givenName =
      typeof payload.given_name === 'string' ? payload.given_name : undefined;
    let familyName =
      typeof payload.family_name === 'string' ? payload.family_name : undefined;
    let name = typeof payload.name === 'string' ? payload.name : undefined;

    // Session tokens often omit email — load profile from Clerk Backend API.
    if ((!email || !givenName) && payload.sub) {
      const client =
        this.clerkClient ??
        createClerkClient({
          secretKey,
          publishableKey: this.config.get('CLERK_PUBLISHABLE_KEY', {
            infer: true,
          }),
        });

      const user = await client.users.getUser(payload.sub);
      const primary =
        user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId) ??
        user.emailAddresses[0];

      email = email ?? primary?.emailAddress;
      emailVerified =
        emailVerified ??
        (primary ? primary.verification?.status === 'verified' : undefined);
      givenName = givenName ?? user.firstName ?? undefined;
      familyName = familyName ?? user.lastName ?? undefined;
      name =
        name ??
        ([user.firstName, user.lastName].filter(Boolean).join(' ') || undefined);
    }

    if (!payload.sub || !email) {
      throw new Error('Clerk token is missing required subject or email.');
    }

    return {
      sub: payload.sub,
      iss: issuer,
      email,
      email_verified: emailVerified,
      given_name: givenName,
      family_name: familyName,
      name,
    };
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
