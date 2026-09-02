import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import { checkoutPath, shopPath } from "@/lib/routes";

const formatCartMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

const OrderSummary = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="w-full lg:max-w-[455px] lg:shrink-0">
      <div className="overflow-hidden rounded-[10px] border border-brand-ink/10 bg-white shadow-[0_16px_48px_rgba(37,36,42,0.08)]">
        <div className="border-b border-brand-ink/10 bg-brand-ink px-5 py-5 sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">
            Your selection
          </p>
          <h3 className="mt-1.5 font-medium text-xl text-brand-cream">
            Order Summary
          </h3>
          <p className="mt-1 text-sm text-brand-cream/70">
            {itemCount} {itemCount === 1 ? "item" : "items"} ready for checkout
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8">
          <ul className="space-y-4 border-b border-gray-3 pb-5">
            {cartItems.map((item) => (
              <li
                key={item.slug}
                className="flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-brand-ink">{item.title}</p>
                  <p className="mt-0.5 text-xs text-dark-4">
                    Qty {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium text-brand-ink">
                  {formatCartMoney(item.discountedPrice * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between pt-5">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-dark-4">
              Total
            </p>
            <p className="text-2xl font-semibold text-brand-ink">
              {formatCartMoney(totalPrice)}
            </p>
          </div>

          <Link
            href={checkoutPath}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-brand-ink px-6 py-3.5 text-sm font-medium text-brand-cream transition-colors duration-200 hover:bg-brand-rust focus:outline-none focus:ring-2 focus:ring-brand-rust focus:ring-offset-2"
          >
            Proceed to Checkout
            <span aria-hidden="true">→</span>
          </Link>

          <p className="mt-4 text-center text-xs leading-5 text-dark-4">
            Secure checkout · Honest condition · Tested before listing
          </p>

          <Link
            href={shopPath}
            className="mt-5 block text-center text-sm font-medium text-brand-rust transition-colors duration-200 hover:text-brand-ink"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
