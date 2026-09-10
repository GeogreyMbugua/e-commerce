"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { adminProductsPath, signInPath } from "@/lib/routes";

export default function AdminGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    customer,
    isAuthenticated,
    loading,
    profileError,
    refreshProfile,
    signOut,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [retrying, setRetrying] = useState(false);

  const isAdmin = Boolean(customer && customer.role === "ADMIN");
  const needsSignIn = !loading && !isAuthenticated;
  const syncPending =
    !loading && isAuthenticated && !isAdmin && Boolean(profileError || !customer);
  const forbidden =
    !loading && isAuthenticated && customer && customer.role !== "ADMIN";

  useEffect(() => {
    if (!needsSignIn) return;

    const search =
      typeof window !== "undefined" ? window.location.search : "";
    const nextPath = `${pathname}${search}`;
    router.replace(
      `${signInPath}?next=${encodeURIComponent(nextPath || adminProductsPath)}`,
    );
  }, [needsSignIn, pathname, router]);

  // After idle resume, give profile sync a moment before treating as failure.
  useEffect(() => {
    if (!syncPending || customer) return;

    const timer = window.setTimeout(() => {
      void refreshProfile();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [syncPending, customer, refreshProfile]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await refreshProfile();
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3efe6] text-sm text-brand-ink/70">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(184,95,45,0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(45,90,90,0.1), transparent)",
          }}
        />
        <p className="relative animate-pulse">Checking admin access…</p>
      </div>
    );
  }

  if (needsSignIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3efe6] text-sm text-brand-ink/70">
        Redirecting to sign in…
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3efe6] px-4">
        <div className="relative max-w-md text-center">
          <p className="text-lg font-semibold text-brand-ink">
            Catalogue access required
          </p>
          <p className="mt-2 text-sm text-brand-ink/65">
            Signed in as {customer.email}, but this account is not on the admin
            allowlist.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={adminProductsPath}
              className="rounded-md bg-brand-ink px-4 py-2 text-sm font-medium text-white"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-md border border-brand-ink/20 px-4 py-2 text-sm font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3efe6] px-4">
        <div className="relative max-w-md text-center">
          <p className="text-lg font-semibold text-brand-ink">
            Reconnecting admin session…
          </p>
          <p className="mt-2 text-sm text-brand-ink/65">
            {profileError ??
              "Refreshing your Clerk session against the API. This can happen after the tab was idle."}
          </p>
          <button
            type="button"
            disabled={retrying}
            onClick={() => void handleRetry()}
            className="mt-6 rounded-md bg-brand-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {retrying ? "Retrying…" : "Retry now"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
