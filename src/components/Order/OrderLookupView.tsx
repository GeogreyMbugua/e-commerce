"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import { lookupOrder } from "@/lib/order";
import { orderConfirmationPath, shopPath } from "@/lib/routes";

const OrderLookupView = () => {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const order = await lookupOrder(reference.trim(), email.trim());
      router.push(`${orderConfirmationPath}?reference=${encodeURIComponent(order.reference)}`);
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "Unable to find that order.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Order Status" pages={["order status"]} />
      <section className="overflow-hidden bg-brand-cream/40 py-20">
        <div className="mx-auto w-full max-w-[560px] px-4 sm:px-8 xl:px-0">
          <div className="rounded-[10px] bg-white p-8 shadow-1">
            <h2 className="mb-3 text-2xl font-semibold text-brand-ink">
              Find your order
            </h2>
            <p className="mb-6 text-brand-ink/80">
              Enter the order reference from your confirmation email and the
              email address used at checkout.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="order-reference"
                  className="mb-2 block text-sm font-medium text-brand-ink"
                >
                  Order reference
                </label>
                <input
                  id="order-reference"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="AV-20260901-ABC123"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  className="w-full rounded-md border border-gray-3 bg-gray-1 px-5 py-2.5 outline-none duration-200 focus:ring-2 focus:ring-brand-rust/20"
                />
              </div>

              <div>
                <label
                  htmlFor="order-email"
                  className="mb-2 block text-sm font-medium text-brand-ink"
                >
                  Email address
                </label>
                <input
                  id="order-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-md border border-gray-3 bg-gray-1 px-5 py-2.5 outline-none duration-200 focus:ring-2 focus:ring-brand-rust/20"
                />
              </div>

              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full justify-center rounded-md bg-brand-rust px-6 py-3 font-medium text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Looking up order…" : "View order"}
              </button>
            </form>

            <p className="mt-6 text-sm text-brand-ink/60">
              Just placed an order?{" "}
              <Link href={orderConfirmationPath} className="text-brand-rust hover:underline">
                Return to confirmation
              </Link>{" "}
              or{" "}
              <Link href={shopPath} className="text-brand-rust hover:underline">
                continue shopping
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderLookupView;
