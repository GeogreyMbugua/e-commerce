export type AuthenticatedCustomer = {
  id: string;
  oidcSubject: string;
  oidcIssuer: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
};

export type AuthClaims = {
  sub: string;
  iss: string;
  email: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
};

export const AUTH_CUSTOMER_KEY = 'authCustomer';
