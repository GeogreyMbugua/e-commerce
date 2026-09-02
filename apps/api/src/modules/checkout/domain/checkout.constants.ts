export const QUOTE_TTL_MINUTES = 15;
export const RESERVATION_TTL_MINUTES = 15;

export const SHIPPING_METHODS = {
  standard: {
    slug: 'standard',
    label: 'Standard shipping',
    amountMinor: 1500,
  },
  pickup: {
    slug: 'pickup',
    label: 'Local pickup',
    amountMinor: 0,
  },
} as const;

export type ShippingMethodSlug = keyof typeof SHIPPING_METHODS;

export const DEFAULT_SHIPPING_METHOD: ShippingMethodSlug = 'standard';

export const getShippingAmountMinor = (method: string) => {
  const shippingMethod =
    SHIPPING_METHODS[method as ShippingMethodSlug] ??
    SHIPPING_METHODS[DEFAULT_SHIPPING_METHOD];

  return shippingMethod.amountMinor;
};

export const getShippingLabel = (method: string) => {
  const shippingMethod =
    SHIPPING_METHODS[method as ShippingMethodSlug] ??
    SHIPPING_METHODS[DEFAULT_SHIPPING_METHOD];

  return shippingMethod.label;
};

export const expiresAtFromMinutes = (minutes: number) => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
  return expiresAt;
};
