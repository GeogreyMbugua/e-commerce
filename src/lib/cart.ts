import type {
  AddCartLineInput,
  Cart,
  UpdateCartLineInput,
} from "@/types/cart";
import { clearCartToken, getCartToken, setCartToken } from "@/lib/cart-token";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001/api/v1";

const buildUrl = (path: string) => `${apiBaseUrl}${path}`;

type CartRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  idempotencyKey?: string;
  requireToken?: boolean;
};

async function cartFetch<T>(
  path: string,
  options: CartRequestOptions = {},
): Promise<T> {
  const token = getCartToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["X-Cart-Token"] = token;
  } else if (options.requireToken) {
    throw new Error("Cart token is required.");
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

  if (response.status === 404) {
    throw new CartNotFoundError();
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string; code?: string }
      | null;
    throw new Error(
      errorBody?.message ?? `Cart request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export class CartNotFoundError extends Error {
  constructor() {
    super("Cart not found or expired.");
    this.name = "CartNotFoundError";
  }
}

export async function createCart(): Promise<Cart> {
  const cart = await cartFetch<Cart>("/carts", {
    method: "POST",
    body: {},
  });
  setCartToken(cart.guestToken);
  return cart;
}

export async function fetchCurrentCart(): Promise<Cart | null> {
  const token = getCartToken();
  if (!token) {
    return null;
  }

  try {
    return await cartFetch<Cart>("/carts/current", { requireToken: true });
  } catch (error) {
    if (error instanceof CartNotFoundError) {
      clearCartToken();
      return null;
    }

    throw error;
  }
}

export async function ensureCart(): Promise<Cart> {
  const existing = await fetchCurrentCart();
  if (existing) {
    return existing;
  }

  return createCart();
}

export async function addCartLine(input: AddCartLineInput): Promise<Cart> {
  await ensureCart();

  return cartFetch<Cart>("/carts/current/lines", {
    method: "POST",
    body: {
      productSlug: input.productSlug,
      quantity: input.quantity ?? 1,
    },
    idempotencyKey: crypto.randomUUID(),
    requireToken: true,
  });
}

export async function updateCartLine(
  productSlug: string,
  input: UpdateCartLineInput,
): Promise<Cart> {
  return cartFetch<Cart>(`/carts/current/lines/${productSlug}`, {
    method: "PATCH",
    body: input,
    requireToken: true,
  });
}

export async function removeCartLine(productSlug: string): Promise<Cart> {
  return cartFetch<Cart>(`/carts/current/lines/${productSlug}`, {
    method: "DELETE",
    requireToken: true,
  });
}

export async function clearCart(): Promise<Cart> {
  return cartFetch<Cart>("/carts/current", {
    method: "DELETE",
    requireToken: true,
  });
}

export async function mergeGuestCart(
  guestToken: string,
  accessToken: string,
): Promise<Cart> {
  const response = await fetch(buildUrl("/carts/current/merge"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Cart-Token": guestToken,
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(errorBody?.message ?? "Cart merge failed.");
  }

  return response.json() as Promise<Cart>;
}
