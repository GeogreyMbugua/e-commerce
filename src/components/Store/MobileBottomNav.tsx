"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { selectCartItemCount } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { shopPath } from "@/lib/routes";

const navItems = [
  {
    id: "home",
    label: "Home",
    href: "/home",
    match: (pathname: string) => pathname === "/home",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4.5 10.5 12 4l7.5 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5.5a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "listening-room",
    label: "Listening Room",
    href: "/blogs/blog-grid",
    match: (pathname: string) => pathname.startsWith("/blogs"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 18.5V6.75a1.75 1.75 0 0 1 2.5-1.58l9 4.25A1.75 1.75 0 0 1 17.5 11v7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5 18.5a3 3 0 1 0 3-3v-9M17.5 18.5a3 3 0 1 0 3-3v-4.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "shop",
    label: "Shop",
    href: shopPath,
    match: (pathname: string) => pathname.startsWith("/shop"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    ),
  },
] as const;

const MobileBottomNav = () => {
  const pathname = usePathname();
  const cartCount = useAppSelector(selectCartItemCount);
  const { openCartModal } = useCartModalContext();

  return (
    <nav
      aria-label="Mobile shopping navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-ink/10 bg-brand-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid min-h-16 max-w-[1170px] grid-cols-4 px-1">
        {navItems.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium ${
                  active ? "text-brand-rust" : "text-brand-ink/65"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li>
          <button
            type="button"
            onClick={openCartModal}
            className="relative flex min-h-16 w-full flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium text-brand-ink/65"
            aria-label={`Cart, ${cartCount} items`}
          >
            <span className="relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6.5 8.5h11l-1 10.5H7.5l-1-10.5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              {cartCount > 0 ? (
                <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-semibold text-brand-ink">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </span>
            <span>Cart</span>
          </button>
        </li>

      </ul>
    </nav>
  );
};

export default MobileBottomNav;
