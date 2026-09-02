const ORDER_ACCESS_TOKEN_KEY = "audiovintage_order_access_token";
const ORDER_REFERENCE_KEY = "audiovintage_order_reference";

export const getOrderAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ORDER_ACCESS_TOKEN_KEY);
};

export const setOrderAccess = (reference: string, token: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ORDER_REFERENCE_KEY, reference);
  window.localStorage.setItem(ORDER_ACCESS_TOKEN_KEY, token);
};

export const getStoredOrderReference = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ORDER_REFERENCE_KEY);
};

export const clearOrderAccess = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ORDER_REFERENCE_KEY);
  window.localStorage.removeItem(ORDER_ACCESS_TOKEN_KEY);
};
