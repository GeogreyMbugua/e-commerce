import { randomBytes, randomUUID } from 'node:crypto';

export const createOrderReference = () => {
  const date = new Date();
  const ymd = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('');
  const suffix = randomBytes(3).toString('hex').toUpperCase();

  return `AV-${ymd}-${suffix}`;
};

export const createOrderGuestAccessToken = () => `order_${randomUUID()}`;

export const createDevProviderPaymentId = () => `dev_pay_${randomUUID()}`;
