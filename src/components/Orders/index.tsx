"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatOrderMoney } from "@/lib/order";
import { fetchCustomerOrders } from "@/lib/auth";
import { orderConfirmationPath } from "@/lib/routes";
import type { Order } from "@/types/order";
import { useAuth } from "@/providers/AuthProvider";

const Orders = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const customerOrders = await fetchCustomerOrders();
        setOrders(customerOrders);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load orders.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">Loading orders…</p>;
  }

  if (!isAuthenticated) {
    return (
      <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
        Sign in to view your order history.
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-9.5 px-4 sm:px-7.5 xl:px-10 text-red-600" role="alert">
        {error}
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
        You don&apos;t have any linked orders yet.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[770px]">
        <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex">
          <div className="min-w-[140px]">
            <p className="text-custom-sm text-dark">Order</p>
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-dark">Date</p>
          </div>
          <div className="min-w-[128px]">
            <p className="text-custom-sm text-dark">Status</p>
          </div>
          <div className="min-w-[213px]">
            <p className="text-custom-sm text-dark">Items</p>
          </div>
          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark">Total</p>
          </div>
          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark">Action</p>
          </div>
        </div>

        {orders.map((order) => (
          <div
            key={order.reference}
            className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex"
          >
            <div className="min-w-[140px]">
              <p className="text-custom-sm text-brand-rust">{order.reference}</p>
            </div>
            <div className="min-w-[175px]">
              <p className="text-custom-sm text-dark">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="min-w-[128px]">
              <p className="inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize text-brand-ink bg-brand-cream/80">
                {order.status.toLowerCase().replace(/_/g, " ")}
              </p>
            </div>
            <div className="min-w-[213px]">
              <p className="text-custom-sm text-dark">
                {order.lines.map((line) => line.title).join(", ")}
              </p>
            </div>
            <div className="min-w-[113px]">
              <p className="text-custom-sm text-dark">
                {formatOrderMoney(order.total)}
              </p>
            </div>
            <div className="min-w-[113px]">
              <Link
                href={`${orderConfirmationPath}?reference=${encodeURIComponent(order.reference)}`}
                className="text-custom-sm text-brand-rust hover:underline"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

      {orders.map((order) => (
        <div key={`${order.reference}-mobile`} className="block md:hidden border-t border-gray-3">
          <div className="py-4.5 px-7.5 space-y-2">
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Order:</span> {order.reference}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Date:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Status:</span>{" "}
              {order.status.toLowerCase().replace(/_/g, " ")}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Total:</span>{" "}
              {formatOrderMoney(order.total)}
            </p>
            <Link
              href={`${orderConfirmationPath}?reference=${encodeURIComponent(order.reference)}`}
              className="inline-block text-custom-sm text-brand-rust hover:underline"
            >
              View order
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
