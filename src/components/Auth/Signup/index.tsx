"use client";

import Image from "@/components/Common/BrandedImage";
import Link from "next/link";
import React from "react";
import { SignUp } from "@clerk/react";
import { isClerkConfigured } from "@/lib/auth";
import {
  shopPath,
  signInPath,
  withBasePath,
} from "@/lib/routes";

const Signup = () => {
  if (!isClerkConfigured()) {
    return (
      <section className="min-h-[calc(100dvh-4.5rem)] bg-brand-cream/55 px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
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
          <h1 className="mb-3 text-2xl font-semibold tracking-tight text-brand-ink">
            Create an account
          </h1>
          <p className="mb-6 text-sm text-brand-ink/70">
            Clerk is not configured locally. Use sign in with your email to
            create a profile, or set{" "}
            <code className="text-xs">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>.
          </p>
          <Link
            href={signInPath}
            className="inline-flex justify-center bg-brand-ink px-6 py-3 text-sm font-medium text-brand-cream transition-colors hover:bg-brand-rust"
          >
            Continue to sign in
          </Link>
        </div>
      </section>
    );
  }

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
            Join AudioVintage
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl">
            Create an account
          </h1>
        </div>

        <div className="w-full [&_.cl-rootBox]:mx-auto [&_.cl-card]:shadow-none [&_.cl-card]:border [&_.cl-card]:border-brand-ink/10">
          <SignUp
            routing="hash"
            signInUrl={withBasePath(signInPath)}
            forceRedirectUrl={withBasePath(shopPath)}
            fallbackRedirectUrl={withBasePath(shopPath)}
            appearance={{
              variables: {
                colorPrimary: "#8B4513",
                borderRadius: "0px",
              },
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Signup;
