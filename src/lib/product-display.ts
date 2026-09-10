export const conditionLabel = (grade?: string) => {
  if (!grade) return null;
  return grade.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatProductPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
