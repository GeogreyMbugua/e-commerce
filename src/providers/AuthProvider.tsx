"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CustomerProfile } from "@/types/customer";
import {
  clearAuthSession,
  devSignIn,
  fetchCustomerProfile,
  getAccessToken,
  getStoredCustomer,
  setAuthSession,
} from "@/lib/auth";

type AuthContextValue = {
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  signInWithDev: (input: {
    email: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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
      signInWithDev,
      signOut,
      refreshProfile,
    }),
    [customer, loading, refreshProfile, signInWithDev, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
};
