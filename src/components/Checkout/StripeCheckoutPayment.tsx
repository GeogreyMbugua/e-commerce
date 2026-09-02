"use client";

import React, { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import type { Order } from "@/types/order";
import { formatOrderMoney } from "@/lib/order";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const checkoutAppearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#8B4513",
    colorBackground: "#ffffff",
    colorText: "#1c1917",
    borderRadius: "6px",
  },
};

type StripeCheckoutPaymentProps = {
  order: Order;
};

const StripePaymentForm = ({ order }: StripeCheckoutPaymentProps) => {
  const checkoutState = useCheckoutElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (checkoutState.type === "loading") {
    return <p className="text-brand-ink/70">Loading payment form…</p>;
  }

  if (checkoutState.type === "error") {
    return (
      <p className="rounded-md bg-red/10 px-4 py-3 text-sm text-red">
        {checkoutState.error.message}
      </p>
    );
  }

  const { checkout } = checkoutState;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const confirmResult = await checkout.confirm();

    if (confirmResult.type === "error") {
      setMessage(confirmResult.error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      {message && (
        <p className="rounded-md bg-red/10 px-4 py-3 text-sm text-red">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full justify-center rounded-md bg-brand-ink px-6 py-3 font-medium text-white hover:bg-brand-rust disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Processing…"
          : `Pay ${formatOrderMoney(order.total)} now`}
      </button>
    </form>
  );
};

const StripeCheckoutPayment = ({ order }: StripeCheckoutPaymentProps) => {
  const clientSecret = order.payment?.clientSecret;

  const options = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            elementsOptions: {
              appearance: checkoutAppearance,
            },
          }
        : null,
    [clientSecret],
  );

  if (!stripePromise) {
    return (
      <p className="rounded-md bg-red/10 px-4 py-3 text-sm text-red">
        Stripe publishable key is not configured.
      </p>
    );
  }

  if (!options) {
    return (
      <p className="rounded-md bg-red/10 px-4 py-3 text-sm text-red">
        Payment session is unavailable. Try refreshing the page.
      </p>
    );
  }

  return (
    <CheckoutElementsProvider stripe={stripePromise} options={options}>
      <StripePaymentForm order={order} />
    </CheckoutElementsProvider>
  );
};

export default StripeCheckoutPayment;
