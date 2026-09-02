"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import { useAppSelector } from "@/redux/store";
import { selectCartItems } from "@/redux/features/cart-slice";
import {
  createCheckoutSession,
  createQuote,
  formatCheckoutMoney,
} from "@/lib/checkout";
import {
  createOrderFromCheckoutSession,
  simulatePaymentCapture,
} from "@/lib/order";
import StripeCheckoutPayment from "./StripeCheckoutPayment";
import { orderConfirmationPath, shopPath } from "@/lib/routes";
import type { CheckoutSession, Quote, ShippingMethodSlug } from "@/types/checkout";
import type { Order } from "@/types/order";
import { SHIPPING_OPTIONS } from "@/types/checkout";

const CheckoutView = () => {
  const router = useRouter();
  const cartItems = useAppSelector(selectCartItems);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodSlug>("standard");
  const [email, setEmail] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(
    null,
  );
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuote = useCallback(async () => {
    if (cartItems.length === 0) {
      setQuote(null);
      return;
    }

    setLoadingQuote(true);
    setError(null);

    try {
      const nextQuote = await createQuote({ shippingMethod });
      setQuote(nextQuote);
    } catch (quoteError) {
      setQuote(null);
      setError(
        quoteError instanceof Error
          ? quoteError.message
          : "Unable to calculate your order total.",
      );
    } finally {
      setLoadingQuote(false);
    }
  }, [cartItems.length, shippingMethod]);

  useEffect(() => {
    void loadQuote();
  }, [loadQuote]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required to place your order.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const session = await createCheckoutSession({
        email: email.trim(),
        shippingMethod,
      });
      setCheckoutSession(session);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to start checkout.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueToPayment = async () => {
    setPaying(true);
    setError(null);

    try {
      const createdOrder = await createOrderFromCheckoutSession();
      setOrder(createdOrder);
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to create your order.",
      );
    } finally {
      setPaying(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!order?.payment) {
      setError("Payment details are unavailable.");
      return;
    }

    setPaying(true);
    setError(null);

    try {
      if (order.payment.checkoutUrl) {
        window.location.href = order.payment.checkoutUrl;
        return;
      }

      if (order.payment.provider === "dev") {
        const paidOrder = await simulatePaymentCapture(order.payment.id);
        router.push(
          `${orderConfirmationPath}?reference=${encodeURIComponent(paidOrder.reference)}`,
        );
        return;
      }

      setError(
        "Card payment requires Stripe configuration. Use the dev environment to test checkout.",
      );
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Payment could not be completed.",
      );
    } finally {
      setPaying(false);
    }
  };

  if (cartItems.length === 0 && !checkoutSession && !order) {
    return (
      <>
        <Breadcrumb title="Checkout" pages={["checkout"]} />
        <section className="overflow-hidden bg-brand-cream/40 py-20">
          <div className="mx-auto w-full max-w-[1170px] px-4 text-center sm:px-8 xl:px-0">
            <h2 className="mb-4 text-2xl font-semibold text-brand-ink">
              Your cart is empty
            </h2>
            <p className="mb-8 text-brand-ink/70">
              Add items before starting checkout.
            </p>
            <Link
              href={shopPath}
              className="inline-flex rounded-md bg-brand-rust px-6 py-3 font-medium text-white hover:bg-brand-ink"
            >
              Browse the shop
            </Link>
          </div>
        </section>
      </>
    );
  }

  if (order) {
    return (
      <>
        <Breadcrumb title="Checkout" pages={["checkout", "payment"]} />
        <section className="overflow-hidden bg-brand-cream/40 py-20">
          <div className="mx-auto w-full max-w-[760px] px-4 sm:px-8 xl:px-0">
            <div className="rounded-[10px] bg-white p-8 shadow-1">
              <h2 className="mb-3 text-2xl font-semibold text-brand-ink">
                Complete payment
              </h2>
              <p className="mb-6 text-brand-ink/80">
                Order <strong>{order.reference}</strong> is ready. Total due:{" "}
                <strong>{formatCheckoutMoney(order.total)}</strong>.
              </p>

              {order.payment?.provider === "dev" && (
                <>
                  <p className="mb-6 text-sm text-brand-ink/60">
                    Development mode — payment is simulated locally without a
                    card.
                  </p>
                  {error && (
                    <p className="mb-4 rounded-md bg-red/10 px-4 py-3 text-sm text-red">
                      {error}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={paying}
                    onClick={() => void handleCompletePayment()}
                    className="inline-flex rounded-md bg-brand-ink px-6 py-3 font-medium text-white hover:bg-brand-rust disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {paying ? "Processing…" : "Pay now"}
                  </button>
                </>
              )}

              {order.payment?.provider === "stripe" &&
                order.payment.clientSecret && (
                  <div className="mb-6">
                    <StripeCheckoutPayment order={order} />
                  </div>
                )}

              {order.payment?.provider === "stripe" && error && (
                <p className="mb-4 rounded-md bg-red/10 px-4 py-3 text-sm text-red">
                  {error}
                </p>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  if (checkoutSession) {
    return (
      <>
        <Breadcrumb title="Checkout" pages={["checkout"]} />
        <section className="overflow-hidden bg-brand-cream/40 py-20">
          <div className="mx-auto w-full max-w-[760px] px-4 sm:px-8 xl:px-0">
            <div className="rounded-[10px] bg-white p-8 shadow-1">
              <h2 className="mb-3 text-2xl font-semibold text-brand-ink">
                Inventory reserved
              </h2>
              <p className="mb-6 text-brand-ink/80">
                Your items are held for{" "}
                {new Date(checkoutSession.expiresAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
                . Your quote is locked at{" "}
                <strong>{formatCheckoutMoney(checkoutSession.total)}</strong>.
              </p>
              <ul className="mb-6 space-y-2 text-brand-ink/80">
                {checkoutSession.reservations.map((reservation) => (
                  <li key={reservation.productSlug}>
                    {reservation.quantity}× {reservation.productSlug} reserved
                    until{" "}
                    {new Date(reservation.expiresAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </li>
                ))}
              </ul>

              {error && (
                <p className="mb-4 rounded-md bg-red/10 px-4 py-3 text-sm text-red">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={paying}
                  onClick={() => void handleContinueToPayment()}
                  className="inline-flex rounded-md bg-brand-ink px-6 py-3 font-medium text-white hover:bg-brand-rust disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paying ? "Creating order…" : "Continue to payment"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(shopPath)}
                  className="inline-flex rounded-md border border-brand-ink/20 px-6 py-3 font-medium text-brand-ink hover:bg-brand-cream/60"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Checkout" pages={["checkout"]} />
      <section className="overflow-hidden bg-brand-cream/40 py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <form onSubmit={(event) => void handleSubmit(event)}>
            <div className="flex flex-col gap-7.5 lg:flex-row xl:gap-11">
              <div className="w-full lg:max-w-[670px]">
                <Login />

                <div className="mt-9">
                  <label
                    htmlFor="checkout-email"
                    className="mb-2.5 block font-medium text-dark"
                  >
                    Email for order confirmation{" "}
                    <span className="text-red">*</span>
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-gray-3 bg-white px-5 py-2.5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-rust/20"
                  />
                </div>

                <Billing />
                <Shipping />

                <div className="mt-7.5 rounded-[10px] bg-white p-4 shadow-1 sm:p-8.5">
                  <label htmlFor="notes" className="mb-2.5 block">
                    Other Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={5}
                    placeholder="Notes about your order, such as delivery instructions."
                    className="w-full rounded-md border border-gray-3 bg-gray-1 p-5 outline-none duration-200 placeholder:text-dark-5 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-rust/20"
                  />
                </div>
              </div>

              <div className="w-full max-w-[455px]">
                <div className="rounded-[10px] bg-white shadow-1">
                  <div className="border-b border-gray-3 px-4 py-5 sm:px-8.5">
                    <h3 className="text-xl font-medium text-dark">Your Order</h3>
                  </div>

                  <div className="px-4 pb-8.5 pt-2.5 sm:px-8.5">
                    <div className="flex items-center justify-between border-b border-gray-3 py-5">
                      <h4 className="font-medium text-dark">Product</h4>
                      <h4 className="text-right font-medium text-dark">
                        Subtotal
                      </h4>
                    </div>

                    {loadingQuote && (
                      <p className="py-5 text-brand-ink/70">
                        Calculating quote…
                      </p>
                    )}

                    {!loadingQuote &&
                      quote?.lines.map((line) => (
                        <div
                          key={line.productSlug}
                          className="flex items-center justify-between border-b border-gray-3 py-5"
                        >
                          <p className="text-dark">
                            {line.title}{" "}
                            <span className="text-brand-ink/60">
                              × {line.quantity}
                            </span>
                          </p>
                          <p className="text-right text-dark">
                            {formatCheckoutMoney(line.lineTotal)}
                          </p>
                        </div>
                      ))}

                    {quote && (
                      <>
                        <div className="flex items-center justify-between border-b border-gray-3 py-5">
                          <p className="text-dark">{quote.shippingLabel}</p>
                          <p className="text-right text-dark">
                            {formatCheckoutMoney(quote.shipping)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-5">
                          <p className="text-lg font-medium text-dark">Total</p>
                          <p className="text-right text-lg font-medium text-dark">
                            {formatCheckoutMoney(quote.total)}
                          </p>
                        </div>

                        <p className="mt-3 text-custom-sm text-brand-ink/60">
                          Quote expires at{" "}
                          {new Date(quote.expiresAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          . Inventory is reserved when you place the order.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <Coupon />

                <div className="mt-7.5 rounded-[10px] bg-white shadow-1">
                  <div className="border-b border-gray-3 px-4 py-5 sm:px-8.5">
                    <h3 className="text-xl font-medium text-dark">
                      Shipping Method
                    </h3>
                  </div>
                  <div className="space-y-4 p-4 sm:p-8.5">
                    {SHIPPING_OPTIONS.map((option) => (
                      <label
                        key={option.slug}
                        className="flex cursor-pointer items-start gap-3.5"
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={option.slug}
                          checked={shippingMethod === option.slug}
                          onChange={() => setShippingMethod(option.slug)}
                          className="mt-1"
                        />
                        <span>
                          <span className="block font-medium text-dark">
                            {option.label}
                          </span>
                          <span className="text-custom-sm text-brand-ink/70">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <PaymentMethod />

                {error && (
                  <p className="mt-4 rounded-md bg-red/10 px-4 py-3 text-sm text-red">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || loadingQuote || !quote}
                  className="mt-7.5 flex w-full justify-center rounded-md bg-brand-ink px-6 py-3 font-medium text-white duration-200 ease-out hover:bg-brand-rust disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Reserving inventory…" : "Place Order"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default CheckoutView;
