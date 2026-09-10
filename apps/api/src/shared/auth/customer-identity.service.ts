import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.schema.js';
import { PrismaService } from '../database/prisma.service.js';
import type {
  AuthClaims,
  AuthenticatedCustomer,
  CustomerRole,
} from './auth.types.js';

@Injectable()
export class CustomerIdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private adminEmails(): Set<string> {
    const raw = this.config.get('ADMIN_EMAILS', { infer: true });
    if (!raw) {
      return new Set();
    }

    return new Set(
      raw
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  private resolveRole(email: string, existing?: CustomerRole): CustomerRole {
    if (this.adminEmails().has(email.toLowerCase())) {
      return 'ADMIN';
    }

    return existing ?? 'CUSTOMER';
  }

  async upsertFromClaims(claims: AuthClaims): Promise<AuthenticatedCustomer> {
    const firstName =
      claims.given_name ?? claims.name?.split(' ')[0] ?? null;
    const lastName =
      claims.family_name ??
      (claims.name?.includes(' ')
        ? claims.name.split(' ').slice(1).join(' ')
        : null);
    const email = claims.email.toLowerCase();

    const existing = await this.prisma.customer.findUnique({
      where: { oidcSubject: claims.sub },
      select: { role: true },
    });

    const role = this.resolveRole(email, existing?.role);

    const customer = await this.prisma.customer.upsert({
      where: { oidcSubject: claims.sub },
      create: {
        oidcSubject: claims.sub,
        oidcIssuer: claims.iss,
        email,
        emailVerified: claims.email_verified ?? false,
        role,
        firstName,
        lastName,
      },
      update: {
        oidcIssuer: claims.iss,
        email,
        emailVerified: claims.email_verified ?? false,
        role,
        firstName,
        lastName,
      },
    });

    return this.toAuthenticatedCustomer(customer);
  }

  toAuthenticatedCustomer(customer: {
    id: string;
    oidcSubject: string;
    oidcIssuer: string;
    email: string;
    emailVerified: boolean;
    role: CustomerRole;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    createdAt: Date;
  }): AuthenticatedCustomer {
    return {
      id: customer.id,
      oidcSubject: customer.oidcSubject,
      oidcIssuer: customer.oidcIssuer,
      email: customer.email,
      emailVerified: customer.emailVerified,
      role: customer.role,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      createdAt: customer.createdAt.toISOString(),
    };
  }
}
