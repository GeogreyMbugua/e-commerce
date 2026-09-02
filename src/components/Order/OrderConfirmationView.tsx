"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import { fetchOrder, formatOrderMoney, syncStripeCheckoutSession } from "@/lib/order";
import { claimCustomerOrder } from "@/lib/auth";
import { useAuth } from "@/providers/AuthProvider";
import {
  clearOrderAccess,
  getStoredOrderReference,
  setOrderAccess,
} from "@/lib/order-token";
import { clearCheckoutSessionToken } from "@/lib/checkout-token";
import { orderStatusPath, shopPath } from "@/lib/routes";
import type { Order } from "@/types/order";

type OrderConfirmationViewProps = {
  reference?: string;
};

const OrderConfirmationView = ({ reference: referenceProp }: OrderConfirmationViewProps = {}) => {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const referenceFromQuery = searchParams.get("reference") ?? undefined;
  const reference = referenceProp ?? referenceFromQuery;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      const sessionId = searchParams.get("session_id");
      const tokenFromQuery = searchParams.get("token") ?? undefined;
      const referenceFromUrl = reference ?? searchParams.get("reference") ?? undefined;
      const orderReference = referenceFromUrl ?? getStoredOrderReference();

      if (tokenFromQuery && referenceFromUrl) {
        setOrderAccess(referenceFromUrl, tokenFromQuery);
      }

      if (sessionId) {
        try {
          const syncedOrder = await syncStripeCheckoutSession(sessionId);
          setOrder(syncedOrder);
          clearCheckoutSessionToken();
        } catch (loadError) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to confirm your payment.",
          );
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!orderReference) {
        setError("No order reference found.");
        setLoading(false);
        return;
      }

      try {
        const loadedOrder = await fetchOrder(orderReference);
        setOrder(loadedOrder);
        clearCheckoutSessionToken();

        if (isAuthenticated) {
          try {
            await claimCustomerOrder(
              loadedOrder.reference,
              loadedOrder.guestAccessToken,
            );
          } catch {
            // Order may already be linked or email mismatch; confirmation still works.
          }
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your order.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [reference, searchParams, isAuthenticated]);

  if (loading) {
    return (
      <>
        <Breadcrumb title="Order Confirmation" pages={["order confirmation"]} />
        <section className="overflow-hidden bg-brand-cream/40 py-20">
          <div className="mx-auto w-full max-w-[760px] px-4 text-center sm:px-8 xl:px-0">
            <p className="text-brand-ink/70">Loading your order…</p>
          </div>
        </section>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Breadcrumb title="Order Confirmation" pages={["order confirmation"]} />
        <section className="overflow-hidden bg-brand-cream/40 py-20">
          <div className="mx-auto w-full max-w-[760px] px-4 text-center sm:px-8 xl:px-0">
            <h2 className="mb-4 text-2xl font-semibold text-brand-ink">
              Order unavailable
            </h2>
            <p className="mb-8 text-brand-ink/70">
              {error ?? "We could not find this order."}
            </p>
            <Link
              href={shopPath}
              className="inline-flex rounded-md bg-brand-rust px-6 py-3 font-medium text-white hover:bg-brand-ink"
            >
              Continue shopping
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Order Confirmation" pages={["order confirmation"]} />
      <section className="overflow-hidden bg-brand-cream/40 py-20">
        <div className="mx-auto w-full max-w-[760px] px-4 sm:px-8 xl:px-0">
          <div className="rounded-[10px] bg-white p-8 shadow-1">
            <h2 className="mb-3 text-2xl font-semibold text-brand-ink">
              {order.status === "PAID" ? "Thank you for your order" : "Order received"}
            </h2>
            <p className="mb-6 text-brand-ink/80">
              Order <strong>{order.reference}</strong> was sent to{" "}
              <strong>{order.email}</strong>.
              {order.status === "PAID"
                ? " Payment is confirmed and your items are being prepared."
                : " Complete payment to finalize your purchase."}
            </p>

            <p className="mb-6 rounded-md bg-brand-cream/70 px-4 py-3 text-sm text-brand-ink/80">
              Fulfillment status:{" "}
              <strong className="text-brand-ink">
                {order.fulfillmentStatus.replace(/_/g, " ").toLowerCase()}
              </strong>
            </p>

            <ul className="mb-6 space-y-3 border-y border-gray-3 py-6">
              {order.lines.map((line) => (
                <li
                  key={line.productSlug}
                  className="flex items-center justify-between text-brand-ink/80"
                >
                  <span>
                    {line.title}{" "}
                    <span className="text-brand-ink/60">× {line.quantity}</span>
                  </span>
                  <span>{formatOrderMoney(line.lineTotal)}</span>
                </li>
              ))}
            </ul>

            <div className="mb-6 flex items-center justify-between text-lg font-medium text-brand-ink">
              <span>Total</span>
              <span>{formatOrderMoney(order.total)}</span>
            </div>

            <p className="mb-8 text-sm text-brand-ink/60">
              A confirmation email has been sent when payment is confirmed. You
              can also look up this order later with your reference and email.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={orderStatusPath}
                className="inline-flex rounded-md border border-brand-ink/15 px-6 py-3 font-medium text-brand-ink hover:bg-brand-cream/60"
              >
                Look up another order
              </Link>
              <Link
                href={shopPath}
                className="inline-flex rounded-md bg-brand-ink px-6 py-3 font-medium text-white hover:bg-brand-rust"
                onClick={() => clearOrderAccess()}
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderConfirmationView;
