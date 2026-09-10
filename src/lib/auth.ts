import type { AuthSession, CustomerProfile } from "@/types/customer";
import { getCartToken, setCartToken } from "@/lib/cart-token";
import { mergeGuestCart } from "@/lib/cart";

const AUTH_TOKEN_KEY = "audiovintage_access_token";
const AUTH_CUSTOMER_KEY = "audiovintage_customer";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001/api/v1";

const buildUrl = (path: string) => `${apiBaseUrl}${path}`;

export const isClerkConfigured = (): boolean =>
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim());

type TokenGetter = () => Promise<string | null>;

let clerkTokenGetter: TokenGetter | null = null;

/** Register Clerk `getToken` so API calls always use a fresh session JWT. */
export const registerClerkTokenGetter = (getter: TokenGetter | null) => {
  clerkTokenGetter = getter;
};

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getAccessTokenAsync = async (): Promise<string | null> => {
  if (clerkTokenGetter) {
    try {
      const token = await clerkTokenGetter();
      if (token) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(AUTH_TOKEN_KEY, token);
        }
        return token;
      }
    } catch {
      // Fall through to stored token / null.
    }
  }

  return getAccessToken();
};

export const getStoredCustomer = (): CustomerProfile | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_CUSTOMER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CustomerProfile;
  } catch {
    return null;
  }
};

export const setAuthSession = (session: AuthSession) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(
    AUTH_CUSTOMER_KEY,
    JSON.stringify(session.customer),
  );
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_CUSTOMER_KEY);
};

export async function authFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessTokenAsync();
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string | string[]; code?: string }
      | null;
    const message = errorBody?.message;
    const text = Array.isArray(message)
      ? message.join(", ")
      : typeof message === "string"
        ? message
        : null;
    throw new Error(text ?? `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function mergeGuestCartAfterAuth(accessToken: string) {
  const guestCartToken = getCartToken();
  if (!guestCartToken) {
    return;
  }

  try {
    const mergedCart = await mergeGuestCart(guestCartToken, accessToken);
    setCartToken(mergedCart.guestToken);
  } catch {
    // Guest cart may already be empty or expired; auth still succeeds.
  }
}

export async function devSignIn(input: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthSession> {
  const response = await fetch(buildUrl("/auth/dev/login"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(errorBody?.message ?? "Sign in failed.");
  }

  const session = (await response.json()) as AuthSession;
  setAuthSession(session);
  await mergeGuestCartAfterAuth(session.accessToken);
  return session;
}

export async function fetchCustomerProfile(): Promise<CustomerProfile> {
  return authFetch<CustomerProfile>("/customers/me");
}

export async function updateCustomerProfile(input: {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}): Promise<CustomerProfile> {
  const profile = await authFetch<CustomerProfile>("/customers/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const token = (await getAccessTokenAsync()) ?? "";
  setAuthSession({
    accessToken: token,
    customer: profile,
  });
  return profile;
}

export async function fetchCustomerAddresses() {
  return authFetch<import("@/types/customer").CustomerAddress[]>(
    "/customers/me/addresses",
  );
}

export async function createCustomerAddress(
  input: Omit<import("@/types/customer").CustomerAddress, "id">,
) {
  return authFetch<import("@/types/customer").CustomerAddress>(
    "/customers/me/addresses",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

export async function fetchCustomerOrders() {
  return authFetch<import("@/types/order").Order[]>("/customers/me/orders");
}

export async function claimCustomerOrder(
  reference: string,
  guestAccessToken?: string,
) {
  return authFetch<import("@/types/order").Order>(
    `/customers/me/orders/${encodeURIComponent(reference)}/claim`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestAccessToken }),
    },
  );
}

export function signOut() {
  clearAuthSession();
}
