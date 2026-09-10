import {
  Body,
  Controller,
  ForbiddenException,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../validation/zod-validation.pipe.js';
import { CustomerIdentityService } from './customer-identity.service.js';
import { TokenVerifierService } from './token-verifier.service.js';

const devLoginSchema = z.object({
  email: z.string().trim().email(),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
});

@Controller('auth/dev')
export class DevAuthController {
  constructor(
    private readonly tokenVerifier: TokenVerifierService,
    private readonly customerIdentity: CustomerIdentityService,
  ) {}

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(devLoginSchema))
    body: z.infer<typeof devLoginSchema>,
  ) {
    if (!this.tokenVerifier.isDevAuthEnabled) {
      throw new ForbiddenException({
        code: 'DEV_AUTH_DISABLED',
        message:
          'Email sign-in is disabled. Set ALLOW_DEV_AUTH=true and DEV_JWT_SECRET on the API, or configure OIDC.',
      });
    }

    const subject = `dev_${body.email.toLowerCase()}`;
    const accessToken = await this.tokenVerifier.signDevAccessToken({
      sub: subject,
      email: body.email.toLowerCase(),
      emailVerified: true,
      givenName: body.firstName,
      familyName: body.lastName,
    });

    const customer = await this.customerIdentity.upsertFromClaims({
      sub: subject,
      iss: 'audiovintage-dev',
      email: body.email.toLowerCase(),
      email_verified: true,
      given_name: body.firstName,
      family_name: body.lastName,
    });

    return {
      accessToken,
      customer,
    };
  }
}
