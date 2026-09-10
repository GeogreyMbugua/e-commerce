"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ClerkProvider,
  useAuth as useClerkAuth,
  useClerk,
} from "@clerk/react";
import type { AuthSession, CustomerProfile } from "@/types/customer";
import {
  clearAuthSession,
  devSignIn,
  fetchCustomerProfile,
  getAccessToken,
  getStoredCustomer,
  isClerkConfigured,
  mergeGuestCartAfterAuth,
  registerClerkTokenGetter,
  setAuthSession,
} from "@/lib/auth";
import { basePath } from "@/lib/routes";

type AuthContextValue = {
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  clerkEnabled: boolean;
  profileError: string | null;
  signInWithDev: (input: {
    email: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<AuthSession>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || "";

function DevBackedAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setCustomer(null);
      setProfileError(null);
      return;
    }

    try {
      const profile = await fetchCustomerProfile();
      setCustomer(profile);
      setProfileError(null);
      setAuthSession({ accessToken: token, customer: profile });
    } catch (error) {
      clearAuthSession();
      setCustomer(null);
      setProfileError(
        error instanceof Error ? error.message : "Unable to load profile.",
      );
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const storedCustomer = getStoredCustomer();
      const token = getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      setCustomer(storedCustomer);
      await refreshProfile();
      setLoading(false);
    };

    void bootstrap();
  }, [refreshProfile]);

  const signInWithDev = useCallback(
    async (input: {
      email: string;
      firstName?: string;
      lastName?: string;
    }) => {
      const session = await devSignIn(input);
      setCustomer(session.customer);
      setProfileError(null);
      return session;
    },
    [],
  );

  const signOut = useCallback(() => {
    clearAuthSession();
    setCustomer(null);
    setProfileError(null);
  }, []);

  const value = useMemo(
    () => ({
      customer,
      isAuthenticated: Boolean(customer && getAccessToken()),
      loading,
      clerkEnabled: false,
      profileError,
      signInWithDev,
      signOut,
      refreshProfile,
    }),
    [customer, loading, profileError, refreshProfile, signInWithDev, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ClerkBackedAuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const clerk = useClerk();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const mergedCartForSession = useRef<string | null>(null);
  const customerRef = useRef<CustomerProfile | null>(null);

  useEffect(() => {
    customerRef.current = customer;
  }, [customer]);

  useEffect(() => {
    registerClerkTokenGetter(async (options) => {
      if (!isSignedIn) {
        return null;
      }
      return getToken({ skipCache: options?.skipCache });
    });

    return () => {
      registerClerkTokenGetter(null);
    };
  }, [getToken, isSignedIn]);

  const refreshProfile = useCallback(async () => {
    if (!isSignedIn) {
      clearAuthSession();
      setCustomer(null);
      setProfileError(null);
      return;
    }

    const token = await getToken({ skipCache: true });
    if (!token) {
      setProfileError("Clerk session has no access token.");
      return;
    }

    try {
      const profile = await fetchCustomerProfile();
      setCustomer(profile);
      setProfileError(null);
      setAuthSession({ accessToken: token, customer: profile });

      if (mergedCartForSession.current !== profile.id) {
        mergedCartForSession.current = profile.id;
        await mergeGuestCartAfterAuth(token);
      }
    } catch (error) {
      // Keep last known profile so admin idle blips don't hard-kick the user.
      const message =
        error instanceof Error ? error.message : "Unable to load profile.";
      setProfileError(message);
      console.error("[auth] Nest profile sync failed:", message);

      if (!customerRef.current) {
        const stored = getStoredCustomer();
        if (stored) {
          setCustomer(stored);
        }
      }
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const bootstrap = async () => {
      if (!isSignedIn) {
        clearAuthSession();
        setCustomer(null);
        setProfileError(null);
        setLoading(false);
        return;
      }

      setCustomer(getStoredCustomer());
      await refreshProfile();
      setLoading(false);
    };

    void bootstrap();
  }, [isLoaded, isSignedIn, refreshProfile]);

  // Resume after tab idle: refresh Clerk JWT + Nest profile.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    let timer: number | undefined;
    const onResume = () => {
      if (document.visibilityState === "hidden") {
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void refreshProfile();
      }, 350);
    };

    document.addEventListener("visibilitychange", onResume);
    window.addEventListener("focus", onResume);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onResume);
      window.removeEventListener("focus", onResume);
    };
  }, [isLoaded, isSignedIn, refreshProfile]);

  const signInWithDev = useCallback(async () => {
    throw new Error(
      "Dev email login is disabled while Clerk is configured. Use the Clerk sign-in form.",
    );
  }, []);

  const signOut = useCallback(() => {
    clearAuthSession();
    setCustomer(null);
    setProfileError(null);
    mergedCartForSession.current = null;
    void clerk.signOut({ redirectUrl: `${basePath}/home` || "/home" });
  }, [clerk]);

  const value = useMemo(
    () => ({
      customer,
      isAuthenticated: Boolean(isSignedIn),
      loading: loading || !isLoaded,
      clerkEnabled: true,
      profileError,
      signInWithDev,
      signOut,
      refreshProfile,
    }),
    [
      customer,
      isLoaded,
      isSignedIn,
      loading,
      profileError,
      refreshProfile,
      signInWithDev,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  if (!isClerkConfigured() || !clerkPublishableKey) {
    return <DevBackedAuthProvider>{children}</DevBackedAuthProvider>;
  }

  const pathPrefix = basePath || "";
  const withPrefix = (path: string) => {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${pathPrefix}${normalized}`;
  };

  const signInUrl = withPrefix(
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/signin",
  );
  const signUpUrl = withPrefix(
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/signup",
  );
  const signInFallback = withPrefix(
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ||
      "/shop-with-sidebar",
  );
  const signUpFallback = withPrefix(
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ||
      "/shop-with-sidebar",
  );

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={signInFallback}
      signUpFallbackRedirectUrl={signUpFallback}
      afterSignOutUrl={withPrefix("/home")}
    >
      <ClerkBackedAuthProvider>{children}</ClerkBackedAuthProvider>
    </ClerkProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
};
