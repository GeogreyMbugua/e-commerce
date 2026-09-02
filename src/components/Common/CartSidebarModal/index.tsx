"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import SingleItem from "./SingleItem";
import EmptyCart from "./EmptyCart";
import { cartPath, checkoutPath } from "@/lib/routes";

const formatCartMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

const CartSidebarModal = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  useEffect(() => {
    closeCartModal();
  }, [pathname, closeCartModal]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element | null)?.closest(".modal-content")) {
        closeCartModal();
      }
    }

    if (isCartModalOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartModalOpen, closeCartModal]);

  const navigateFromDrawer = (path: string) => {
    closeCartModal();
    router.push(path);
  };

  return (
    <div
      className={`fixed inset-0 z-99999 overflow-y-auto no-scrollbar transition-all duration-300 ease-out ${
        isCartModalOpen
          ? "pointer-events-auto visible opacity-100"
          : "pointer-events-none invisible opacity-0"
      }`}
      aria-hidden={!isCartModalOpen}
    >
      <div
        className={`absolute inset-0 bg-brand-ink/60 transition-opacity duration-300 ${
          isCartModalOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-stretch justify-end">
        <div
          className={`modal-content relative flex h-full w-full max-w-[500px] flex-col bg-brand-cream shadow-2 transition-transform duration-300 ease-out ${
            isCartModalOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-ink/10 bg-brand-cream px-4 pb-6 pt-4 sm:px-7.5 sm:pt-7.5 lg:px-11 lg:pt-11">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-rust">
                Cart
              </p>
              <h2 className="mt-1 font-medium text-brand-ink text-lg sm:text-2xl">
                Your selection
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCartModal}
              aria-label="Close cart"
              className="flex items-center justify-center rounded-full p-1 text-brand-ink/70 transition-colors duration-200 hover:bg-brand-ink/5 hover:text-brand-ink"
            >
              <svg
                className="fill-current"
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12.5379 11.2121C12.1718 10.846 11.5782 10.846 11.212 11.2121C10.8459 11.5782 10.8459 12.1718 11.212 12.5379L13.6741 15L11.2121 17.4621C10.846 17.8282 10.846 18.4218 11.2121 18.7879C11.5782 19.154 12.1718 19.154 12.5379 18.7879L15 16.3258L17.462 18.7879C17.8281 19.154 18.4217 19.154 18.7878 18.7879C19.154 18.4218 19.154 17.8282 18.7878 17.462L16.3258 15L18.7879 12.5379C19.154 12.1718 19.154 11.5782 18.7879 11.2121C18.4218 10.846 17.8282 10.846 17.462 11.2121L15 13.6742L12.5379 11.2121Z"
                  fill=""
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15 1.5625C7.57867 1.5625 1.5625 7.57867 1.5625 15C1.5625 22.4213 7.57867 28.4375 15 28.4375C22.4213 28.4375 28.4375 22.4213 28.4375 15C28.4375 7.57867 22.4213 1.5625 15 1.5625ZM3.4375 15C3.4375 8.61421 8.61421 3.4375 15 3.4375C21.3858 3.4375 26.5625 8.61421 26.5625 15C26.5625 21.3858 21.3858 26.5625 15 26.5625C8.61421 26.5625 3.4375 21.3858 3.4375 15Z"
                  fill=""
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-7.5 lg:px-11">
            <div className="flex flex-col gap-6 py-2">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <SingleItem key={item.slug} item={item} />
                ))
              ) : (
                <EmptyCart />
              )}
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-brand-ink/10 bg-brand-cream px-4 pb-4 pt-5 sm:px-7.5 sm:pb-7.5 lg:px-11 lg:pb-11">
            <div className="mb-6 flex items-center justify-between gap-5">
              <p className="font-medium text-brand-ink">Subtotal</p>
              <p className="text-xl font-semibold text-brand-ink">
                {formatCartMoney(totalPrice)}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigateFromDrawer(cartPath)}
                className="flex w-full justify-center rounded-md border border-brand-ink/15 bg-white px-6 py-3 text-sm font-medium text-brand-ink transition-colors duration-200 hover:border-brand-rust hover:text-brand-rust"
              >
                View Cart
              </button>

              <button
                type="button"
                onClick={() => navigateFromDrawer(checkoutPath)}
                disabled={cartItems.length === 0}
                className="flex w-full justify-center rounded-md bg-brand-ink px-6 py-3 text-sm font-medium text-brand-cream transition-colors duration-200 hover:bg-brand-rust disabled:cursor-not-allowed disabled:opacity-50"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebarModal;
