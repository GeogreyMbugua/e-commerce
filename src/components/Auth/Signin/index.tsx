"use client";

import Image from "@/components/Common/BrandedImage";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { adminPath, adminProductsPath, shopPath } from "@/lib/routes";

const fieldClassName =
  "w-full border border-brand-ink/15 bg-brand-cream/45 px-4 py-3 text-sm text-brand-ink outline-none transition-[border-color,box-shadow] placeholder:text-brand-ink/45 focus:border-brand-rust focus:ring-2 focus:ring-brand-rust/15";

function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const { signInWithDev } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : null;
  const isAdminFlow = Boolean(safeNext?.startsWith("/admin"));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await signInWithDev({
        email: email.trim(),
      });

      const wantsAdmin = Boolean(
        safeNext?.startsWith(adminPath) || safeNext?.startsWith("/admin"),
      );
      const isAdmin = session.customer.role === "ADMIN";

      if (wantsAdmin && !isAdmin) {
        setError("This account does not have admin access.");
        return;
      }

      // Admins land in catalogue management unless a non-admin destination was requested.
      if (isAdmin && (!safeNext || safeNext.startsWith("/admin"))) {
        router.push(safeNext ?? adminProductsPath);
        return;
      }

      router.push(safeNext ?? shopPath);
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100dvh-4.5rem)] bg-brand-cream/55 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <Link href="/home" className="mb-8 inline-flex items-center">
          <Image
            src="/images/logo/vintage.png"
            alt="AudioVintage"
            width={180}
            height={32}
            className="h-auto w-40 object-contain"
            priority
          />
        </Link>

        <div className="mb-7 text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-rust">
            {isAdminFlow ? "Catalogue access" : "Welcome back"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl">
            Sign in to AudioVintage
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-brand-ink"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={
                isAdminFlow ? "admin@audiovintage.local" : "you@example.com"
              }
              className={fieldClassName}
            />
          </div>

          {error ? (
            <p
              className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-ink px-6 py-3.5 text-sm font-medium text-brand-cream transition-colors hover:bg-brand-rust disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 border-t border-brand-ink/10 pt-5 text-center">
          <Link
            href={shopPath}
            className="text-sm font-medium text-brand-rust hover:text-brand-ink"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

const Signin = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-brand-ink text-sm text-white/50">
          Loading…
        </div>
      }
    >
      <SigninForm />
    </Suspense>
  );
};

export default Signin;
