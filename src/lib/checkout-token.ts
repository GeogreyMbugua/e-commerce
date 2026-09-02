const CHECKOUT_SESSION_TOKEN_KEY = "audiovintage_checkout_session_token";

export const getCheckoutSessionToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CHECKOUT_SESSION_TOKEN_KEY);
};

export const setCheckoutSessionToken = (token: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHECKOUT_SESSION_TOKEN_KEY, token);
};

export const clearCheckoutSessionToken = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CHECKOUT_SESSION_TOKEN_KEY);
};
