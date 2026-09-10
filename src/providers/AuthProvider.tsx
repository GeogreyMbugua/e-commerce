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

  const refreshProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setCustomer(null);
      return;
    }

    try {
      const profile = await fetchCustomerProfile();
      setCustomer(profile);
      setAuthSession({ accessToken: token, customer: profile });
    } catch {
      clearAuthSession();
      setCustomer(null);
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
      return session;
    },
    [],
  );

  const signOut = useCallback(() => {
    clearAuthSession();
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({
      customer,
      isAuthenticated: Boolean(customer && getAccessToken()),
      loading,
      clerkEnabled: false,
      signInWithDev,
      signOut,
      refreshProfile,
    }),
    [customer, loading, refreshProfile, signInWithDev, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ClerkBackedAuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const clerk = useClerk();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const mergedCartForSession = useRef<string | null>(null);

  useEffect(() => {
    registerClerkTokenGetter(async () => {
      if (!isSignedIn) {
        return null;
      }
      return getToken();
    });

    return () => {
      registerClerkTokenGetter(null);
    };
  }, [getToken, isSignedIn]);

  const refreshProfile = useCallback(async () => {
    if (!isSignedIn) {
      clearAuthSession();
      setCustomer(null);
      return;
    }

    const token = await getToken();
    if (!token) {
      clearAuthSession();
      setCustomer(null);
      return;
    }

    try {
      const profile = await fetchCustomerProfile();
      setCustomer(profile);
      setAuthSession({ accessToken: token, customer: profile });

      if (mergedCartForSession.current !== profile.id) {
        mergedCartForSession.current = profile.id;
        await mergeGuestCartAfterAuth(token);
      }
    } catch {
      clearAuthSession();
      setCustomer(null);
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
        setLoading(false);
        return;
      }

      setCustomer(getStoredCustomer());
      await refreshProfile();
      setLoading(false);
    };

    void bootstrap();
  }, [isLoaded, isSignedIn, refreshProfile]);

  const signInWithDev = useCallback(async () => {
    throw new Error(
      "Dev email login is disabled while Clerk is configured. Use the Clerk sign-in form.",
    );
  }, []);

  const signOut = useCallback(() => {
    clearAuthSession();
    setCustomer(null);
    mergedCartForSession.current = null;
    void clerk.signOut({ redirectUrl: `${basePath}/home` || "/home" });
  }, [clerk]);

  const value = useMemo(
    () => ({
      customer,
      isAuthenticated: Boolean(isSignedIn && customer),
      loading: loading || !isLoaded,
      clerkEnabled: true,
      signInWithDev,
      signOut,
      refreshProfile,
    }),
    [
      customer,
      isLoaded,
      isSignedIn,
      loading,
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
