import type { Order } from "@/types/order";
import { getCheckoutSessionToken } from "@/lib/checkout-token";
import {
  getOrderAccessToken,
  setOrderAccess,
} from "@/lib/order-token";
import { formatCheckoutMoney } from "@/lib/checkout";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001/api/v1";

const buildUrl = (path: string) => `${apiBaseUrl}${path}`;

type OrderRequestOptions = {
  method?: "GET" | "POST";
  checkoutToken?: boolean;
  orderToken?: boolean;
  idempotencyKey?: string;
};

async function orderFetch<T>(
  path: string,
  options: OrderRequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const accessToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("audiovintage_access_token")
      : null;

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (options.checkoutToken) {
    const token = getCheckoutSessionToken();
    if (!token) {
      throw new Error("Checkout session token is required.");
    }
    headers["X-Checkout-Session-Token"] = token;
  }

  if (options.orderToken) {
    const token = getOrderAccessToken();
    if (!token && !accessToken) {
      throw new Error("Order access token is required.");
    }
    if (token) {
      headers["X-Order-Access-Token"] = token;
    }
  }

  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  const response = await fetch(buildUrl(path), {
    method: options.method ?? "GET",
    headers,
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
        `Order request failed with status ${response.status}`,
    );
    (error as Error & { code?: string }).code = errorBody?.code;
    throw error;
  }

  return response.json() as Promise<T>;
}

export async function createOrderFromCheckoutSession(): Promise<Order> {
  const order = await orderFetch<Order>("/orders", {
    method: "POST",
    checkoutToken: true,
    idempotencyKey: crypto.randomUUID(),
  });

  setOrderAccess(order.reference, order.guestAccessToken);
  return order;
}

export async function fetchOrder(reference: string): Promise<Order> {
  return orderFetch<Order>(`/orders/${encodeURIComponent(reference)}`, {
    orderToken: true,
  });
}

export async function lookupOrder(
  reference: string,
  email: string,
): Promise<Order> {
  const response = await fetch(buildUrl('/orders/lookup'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({ reference, email }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string; code?: string }
      | null;
    const error = new Error(
      errorBody?.message ?? `Order lookup failed with status ${response.status}`,
    );
    (error as Error & { code?: string }).code = errorBody?.code;
    throw error;
  }

  const order = (await response.json()) as Order;
  setOrderAccess(order.reference, order.guestAccessToken);
  return order;
}

export async function syncStripeCheckoutSession(sessionId: string): Promise<Order> {
  const response = await fetch(
    buildUrl(`/payments/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`),
    {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(errorBody?.message ?? "Unable to verify payment status.");
  }

  const order = (await response.json()) as Order;
  setOrderAccess(order.reference, order.guestAccessToken);
  return order;
}

export async function simulatePaymentCapture(paymentId: string): Promise<Order> {
  const response = await fetch(buildUrl(`/payments/${paymentId}/simulate-capture`), {
    method: "POST",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(errorBody?.message ?? "Payment simulation failed.");
  }

  return response.json() as Promise<Order>;
}

export { formatCheckoutMoney as formatOrderMoney };
