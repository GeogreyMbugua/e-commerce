export type CustomerProfile = {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
};

export type CustomerAddress = {
  id: string;
  label: string | null;
  type: 'SHIPPING' | 'BILLING';
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
};

export type UpdateCustomerProfileInput = {
  customerId: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
};

export type CreateCustomerAddressInput = {
  customerId: string;
  label?: string;
  type?: 'SHIPPING' | 'BILLING';
  name: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
};

export type UpdateCustomerAddressInput = CreateCustomerAddressInput & {
  addressId: string;
};
