"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { adminProductsPath, signInPath } from "@/lib/routes";

export default function AdminGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customer, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const isAdmin = isAuthenticated && customer?.role === "ADMIN";

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.replace(
        `${signInPath}?next=${encodeURIComponent(adminProductsPath)}`,
      );
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream/50 text-sm text-brand-ink/70">
        Checking admin access…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream/50 text-sm text-brand-ink/70">
        Redirecting to sign in…
      </div>
    );
  }

  return <>{children}</>;
}
