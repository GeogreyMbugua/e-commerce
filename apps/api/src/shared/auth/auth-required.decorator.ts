import { SetMetadata } from '@nestjs/common';
import { AUTH_REQUIRED_KEY } from './jwt-auth.guard.js';

export const AuthRequired = () => SetMetadata(AUTH_REQUIRED_KEY, true);
