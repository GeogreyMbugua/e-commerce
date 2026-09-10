import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_REQUIRED_KEY } from './admin-required.decorator.js';
import {
  getRequestCustomer,
  type AuthRequest,
} from './current-customer.decorator.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<boolean>(ADMIN_REQUIRED_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const customer = getRequestCustomer(request);

    if (!customer) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication is required.',
      });
    }

    if (customer.role !== 'ADMIN') {
      throw new ForbiddenException({
        code: 'ADMIN_REQUIRED',
        message: 'Administrator access is required.',
      });
    }

    return true;
  }
}
