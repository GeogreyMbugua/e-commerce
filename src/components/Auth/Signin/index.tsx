"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { myAccountPath, shopPath } from "@/lib/routes";

const Signin = () => {
  const router = useRouter();
  const { signInWithDev } = useAuth();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithDev({
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      router.push(myAccountPath);
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
    <>
      <Breadcrumb title={"Signin"} pages={["Signin"]} />
      <section className="overflow-hidden bg-brand-cream/40 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Sign In to Your Account
              </h2>
              <p>
                Local development uses secure API-backed sign in. Production
                will use your configured OIDC provider.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 placeholder:text-dark-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-rust/20"
                />
              </div>

              <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block mb-2.5">
                    First name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 placeholder:text-dark-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-rust/20"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block mb-2.5">
                    Last name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 placeholder:text-dark-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-rust/20"
                  />
                </div>
              </div>

              {error ? (
                <p className="mb-4 text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-brand-ink px-6 py-3 font-medium text-white ease-out duration-200 hover:bg-brand-rust mt-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in to account"}
              </button>

              <p className="text-center mt-6 text-sm text-brand-ink/70">
                Password recovery and social login are handled by the OIDC
                provider in production.
              </p>

              <p className="text-center mt-4">
                Prefer guest checkout?{" "}
                <Link
                  href={shopPath}
                  className="text-brand-rust hover:underline"
                >
                  Continue shopping
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
