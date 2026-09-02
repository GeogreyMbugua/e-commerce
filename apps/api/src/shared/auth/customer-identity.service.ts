import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { AuthClaims, AuthenticatedCustomer } from './auth.types.js';

@Injectable()
export class CustomerIdentityService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertFromClaims(claims: AuthClaims): Promise<AuthenticatedCustomer> {
    const firstName =
      claims.given_name ??
      claims.name?.split(' ')[0] ??
      null;
    const lastName =
      claims.family_name ??
      (claims.name?.includes(' ')
        ? claims.name.split(' ').slice(1).join(' ')
        : null);

    const customer = await this.prisma.customer.upsert({
      where: { oidcSubject: claims.sub },
      create: {
        oidcSubject: claims.sub,
        oidcIssuer: claims.iss,
        email: claims.email.toLowerCase(),
        emailVerified: claims.email_verified ?? false,
        firstName,
        lastName,
      },
      update: {
        oidcIssuer: claims.iss,
        email: claims.email.toLowerCase(),
        emailVerified: claims.email_verified ?? false,
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
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      createdAt: customer.createdAt.toISOString(),
    };
  }
}
