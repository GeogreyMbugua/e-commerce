import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedCustomer } from './auth.types.js';

export type AuthRequest = {
  headers: Record<string, string | undefined>;
  authCustomer?: AuthenticatedCustomer;
};

export const CurrentCustomer = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedCustomer => {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const customer = request.authCustomer;

    if (!customer) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication is required.',
      });
    }

    return customer;
  },
);

export const getRequestCustomer = (
  request: AuthRequest,
): AuthenticatedCustomer | undefined => request.authCustomer;

export const attachRequestCustomer = (
  request: AuthRequest,
  customer: AuthenticatedCustomer,
) => {
  request.authCustomer = customer;
};
