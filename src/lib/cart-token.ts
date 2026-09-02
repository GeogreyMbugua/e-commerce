const CART_TOKEN_STORAGE_KEY = "audiovintage_cart_token";

export const getCartToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CART_TOKEN_STORAGE_KEY);
};

export const setCartToken = (token: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_TOKEN_STORAGE_KEY, token);
};

export const clearCartToken = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CART_TOKEN_STORAGE_KEY);
};
