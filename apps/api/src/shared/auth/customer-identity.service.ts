import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(CustomerIdentityService.name);

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

    const bySubject = await this.prisma.customer.findUnique({
      where: { oidcSubject: claims.sub },
    });

    if (bySubject) {
      const role = this.resolveRole(email, bySubject.role);
      const customer = await this.prisma.customer.update({
        where: { id: bySubject.id },
        data: {
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

    // Same email may already exist from a previous auth provider (e.g. dev login).
    const byEmail = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (byEmail) {
      this.logger.log(
        `Linking existing customer ${byEmail.id} to new subject ${claims.sub}`,
      );
      const role = this.resolveRole(email, byEmail.role);
      const customer = await this.prisma.customer.update({
        where: { id: byEmail.id },
        data: {
          oidcSubject: claims.sub,
          oidcIssuer: claims.iss,
          emailVerified: claims.email_verified ?? false,
          role,
          firstName: firstName ?? byEmail.firstName,
          lastName: lastName ?? byEmail.lastName,
        },
      });
      return this.toAuthenticatedCustomer(customer);
    }

    const role = this.resolveRole(email);
    const customer = await this.prisma.customer.create({
      data: {
        oidcSubject: claims.sub,
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
