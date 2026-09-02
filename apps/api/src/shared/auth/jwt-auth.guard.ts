import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  attachRequestCustomer,
  getRequestCustomer,
  type AuthRequest,
} from './current-customer.decorator.js';
import { CustomerIdentityService } from './customer-identity.service.js';
import { TokenVerifierService } from './token-verifier.service.js';

export const AUTH_REQUIRED_KEY = 'authRequired';

const readBearerToken = (headers: Record<string, string | undefined>) => {
  const authorization = headers.authorization ?? headers.Authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenVerifier: TokenVerifierService,
    private readonly customerIdentity: CustomerIdentityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required =
      this.reflector.getAllAndOverride<boolean>(AUTH_REQUIRED_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    const request = context.switchToHttp().getRequest<AuthRequest>();

    if (getRequestCustomer(request)) {
      return true;
    }

    const token = readBearerToken(request.headers);

    if (!token) {
      if (required) {
        throw new UnauthorizedException({
          code: 'AUTH_REQUIRED',
          message: 'Authentication is required.',
        });
      }

      return true;
    }

    try {
      const claims = await this.tokenVerifier.verifyAccessToken(token);
      const customer = await this.customerIdentity.upsertFromClaims(claims);
      attachRequestCustomer(request, customer);
      return true;
    } catch {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID',
        message: 'Access token is invalid or expired.',
      });
    }
  }
}
