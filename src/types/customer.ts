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
  type: "SHIPPING" | "BILLING";
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

export type AuthSession = {
  accessToken: string;
  customer: CustomerProfile;
};
