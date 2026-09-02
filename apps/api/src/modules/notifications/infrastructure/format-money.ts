export const formatMoney = (amountMinor: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amountMinor / 100);
