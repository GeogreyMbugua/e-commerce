import type { CheckoutSession, Quote, ShippingMethodSlug } from "@/types/checkout";
import { getCartToken } from "@/lib/cart-token";
import {
  clearCheckoutSessionToken,
  getCheckoutSessionToken,
  setCheckoutSessionToken,
} from "@/lib/checkout-token";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001/api/v1";

const buildUrl = (path: string) => `${apiBaseUrl}${path}`;

type CheckoutRequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  cartToken?: boolean;
  checkoutToken?: boolean;
  idempotencyKey?: string;
};

async function checkoutFetch<T>(
  path: string,
  options: CheckoutRequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.cartToken) {
    const token = getCartToken();
    if (!token) {
      throw new Error("Cart token is required.");
    }
    headers["X-Cart-Token"] = token;
  }

  if (options.checkoutToken) {
    const token = getCheckoutSessionToken();
    if (!token) {
      throw new Error("Checkout session token is required.");
    }
    headers["X-Checkout-Session-Token"] = token;
  }

  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  const response = await fetch(buildUrl(path), {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string; code?: string; detail?: string }
      | null;
    const error = new Error(
      errorBody?.message ??
        errorBody?.detail ??
        `Checkout request failed with status ${response.status}`,
    );
    (error as Error & { code?: string }).code = errorBody?.code;
    throw error;
  }

  return response.json() as Promise<T>;
}

export async function createQuote(input: {
  shippingMethod?: ShippingMethodSlug;
}): Promise<Quote> {
  return checkoutFetch<Quote>("/quotes", {
    method: "POST",
    body: input,
    cartToken: true,
  });
}

export async function createCheckoutSession(input: {
  email: string;
  shippingMethod?: ShippingMethodSlug;
}): Promise<CheckoutSession> {
  const session = await checkoutFetch<CheckoutSession>("/checkout-sessions", {
    method: "POST",
    body: input,
    cartToken: true,
    idempotencyKey: crypto.randomUUID(),
  });

  setCheckoutSessionToken(session.guestToken);
  return session;
}

export async function fetchCurrentCheckoutSession(): Promise<CheckoutSession | null> {
  const token = getCheckoutSessionToken();
  if (!token) {
    return null;
  }

  try {
    return await checkoutFetch<CheckoutSession>("/checkout-sessions/current", {
      checkoutToken: true,
    });
  } catch {
    clearCheckoutSessionToken();
    return null;
  }
}

export async function cancelCheckoutSession(): Promise<CheckoutSession | null> {
  const token = getCheckoutSessionToken();
  if (!token) {
    return null;
  }

  const session = await checkoutFetch<CheckoutSession>(
    "/checkout-sessions/current",
    {
      method: "DELETE",
      checkoutToken: true,
    },
  );

  clearCheckoutSessionToken();
  return session;
}

export const formatCheckoutMoney = (money: { amountMinor: number; currency: string }) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currency,
  }).format(money.amountMinor / 100);
