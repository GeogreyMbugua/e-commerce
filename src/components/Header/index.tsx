"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { menuData } from "./menuData";
import { useAppSelector } from "@/redux/store";
import { selectCartItemCount, selectTotalPrice } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Image from "@/components/Common/BrandedImage";
import { adminProductsPath, myAccountPath, shopPath, signInPath } from "@/lib/routes";
import { formatProductPrice } from "@/lib/product-display";
import { useAuth } from "@/providers/AuthProvider";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { customer, isAuthenticated, profileError } = useAuth();
  const isAdmin = isAuthenticated && customer?.role === "ADMIN";
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const { openCartModal } = useCartModalContext();
  const cartCount = useAppSelector(selectCartItemCount);
  const totalPrice = useAppSelector(selectTotalPrice);
  const isShopPage = pathname === shopPath;

  const openShopControls = () => {
    window.dispatchEvent(new Event("shop:open-controls"));
  };

  const ShopControlButtons = () =>
    isShopPage ? (
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={openShopControls}
          className="flex h-10 w-10 items-center justify-center border border-brand-ink/15 bg-white text-brand-ink transition-colors hover:border-brand-rust hover:text-brand-rust"
          aria-label="Open shop filters and sorting"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M2.5 4.5h13M4.5 9h9M6.5 13.5h5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    ) : null;

  useEffect(() => {
    const handleStickyMenu = () => {
      setStickyMenu(window.scrollY >= 40);
    };

    handleStickyMenu();
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  useEffect(() => {
    if (!navigationOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavigationOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigationOpen]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedSearch = searchQuery.trim();
    const params = new URLSearchParams();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    const query = params.toString();
    router.push(query ? `${shopPath}?${query}` : shopPath);
    setNavigationOpen(false);
  };

  const SearchForm = ({
    id,
    className = "",
    placeholder = "Search vintage audio, vinyl, speakers...",
  }: {
    id: string;
    className?: string;
    placeholder?: string;
  }) => (
    <form onSubmit={handleSearchSubmit} className={className} role="search">
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <div className="relative">
        <input
          id={id}
          type="search"
          name="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full border border-brand-ink/15 bg-white py-2.5 pl-10 pr-4 text-sm text-brand-ink outline-none placeholder:text-brand-ink/45 focus:border-brand-rust focus:ring-1 focus:ring-brand-rust/20"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-rust"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M17.2687 15.6656L12.6281 11.8969C14.5406 9.28123 14.3437 5.5406 11.9531 3.1781C10.6875 1.91248 8.99995 1.20935 7.19995 1.20935C5.39995 1.20935 3.71245 1.91248 2.44683 3.1781C-0.168799 5.79373 -0.168799 10.0687 2.44683 12.6844C3.71245 13.95 5.39995 14.6531 7.19995 14.6531C8.91558 14.6531 10.5187 14.0062 11.7843 12.8531L16.4812 16.65C16.5937 16.7344 16.7343 16.7906 16.875 16.7906C17.0718 16.7906 17.2406 16.7062 17.3531 16.5656C17.5781 16.2844 17.55 15.8906 17.2687 15.6656ZM7.19995 13.3875C5.73745 13.3875 4.38745 12.825 3.34683 11.7844C1.20933 9.64685 1.20933 6.18748 3.34683 4.0781C4.38745 3.03748 5.73745 2.47498 7.19995 2.47498C8.66245 2.47498 10.0125 3.03748 11.0531 4.0781C13.1906 6.2156 13.1906 9.67498 11.0531 11.7844C10.0406 12.825 8.66245 13.3875 7.19995 13.3875Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </form>
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-brand-ink/10 bg-brand-cream/90 backdrop-blur-md transition-shadow duration-300 ${
        stickyMenu ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-7.5 xl:px-0">
        {/* Mobile compact bar */}
        <div className="flex items-center justify-between gap-3 py-3 lg:hidden">
          <Link href="/home" className="shrink-0">
            <Image
              src="/images/logo/vintage-one.png"
              alt="AudioVintage"
              width={552}
              height={402}
              className="w-[96px] object-contain sm:w-[120px]"
              style={{ height: "auto" }}
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCartModal}
              className="relative flex h-10 w-10 items-center justify-center border border-brand-ink/10 bg-white text-brand-rust"
              aria-label={`Open cart, ${cartCount} items`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-semibold text-brand-ink">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={navigationOpen}
              aria-controls="site-navigation"
              className="flex h-10 w-10 items-center justify-center border border-brand-ink/10 bg-white text-brand-ink"
              onClick={() => setNavigationOpen((open) => !open)}
            >
              <span className="sr-only">Menu</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                {navigationOpen ? (
                  <path
                    d="M4 4l10 10M14 4 4 14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 5h12M3 9h12M3 13h12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="flex items-center gap-2 pb-3 lg:hidden">
          <SearchForm id="mobile-search" className="min-w-0 flex-1" />
          <ShopControlButtons />
        </div>

        {/* Desktop header */}
        <div className="hidden items-center gap-6 py-4 lg:flex xl:gap-8">
          <Link href="/home" className="shrink-0">
            <Image
              src="/images/logo/vintage-one.png"
              alt="AudioVintage"
              width={552}
              height={402}
              className="w-[150px] object-contain xl:w-[170px]"
              style={{ height: "auto" }}
              priority
            />
          </Link>

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-6">
              {menuData.map((menuItem) => (
                <li key={menuItem.id}>
                  <Link
                    href={menuItem.path}
                    className="text-sm font-medium text-brand-ink transition-colors hover:text-brand-rust"
                  >
                    {menuItem.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SearchForm id="desktop-search" className="min-w-0 flex-1" placeholder="Search the shop..." />
            <ShopControlButtons />
          </div>

          <div className="flex shrink-0 items-center gap-4">
            {isAdmin ? (
              <Link
                href={adminProductsPath}
                className="hidden text-sm font-medium text-brand-rust transition-colors hover:text-brand-ink xl:inline"
              >
                Manage catalogue
              </Link>
            ) : null}
            <Link
              href={isAuthenticated ? myAccountPath : signInPath}
              className="hidden text-sm font-medium text-brand-ink transition-colors hover:text-brand-rust xl:inline"
            >
              {isAuthenticated ? "Account" : "Sign in"}
            </Link>
            <button
              type="button"
              onClick={openCartModal}
              className="inline-flex items-center gap-2 border border-brand-ink/10 bg-white px-3 py-2 text-sm font-medium text-brand-ink transition-colors hover:border-brand-rust/40"
              aria-label={`Open cart, ${cartCount} items`}
            >
              <span className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6.5 8.5h11l-1 10.5H7.5l-1-10.5Z"
                    stroke="#B85F2D"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
                    stroke="#B85F2D"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute -right-2 -top-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-semibold text-brand-ink">
                  {cartCount}
                </span>
              </span>
              <span className="hidden xl:inline">{formatProductPrice(totalPrice)}</span>
            </button>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={navigationOpen}
              aria-controls="site-navigation"
              className="xl:hidden"
              onClick={() => setNavigationOpen((open) => !open)}
            >
              <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M3 5h12M3 9h12M3 13h12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible nav for tablet/mobile */}
      <div
        id="site-navigation"
        className={`fixed inset-0 top-[104px] z-40 xl:hidden lg:top-[73px] ${
          navigationOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setNavigationOpen(false)}
          className={`absolute inset-0 bg-brand-ink/45 transition-opacity duration-200 ${
            navigationOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <nav
          className={`absolute inset-x-0 top-0 max-h-[calc(100dvh-104px)] overflow-y-auto border-t border-brand-ink/10 bg-brand-cream px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 shadow-2 transition-transform duration-300 ease-out sm:px-7.5 ${
            navigationOpen ? "translate-y-0" : "-translate-y-3"
          }`}
        >
          <ul className="mx-auto flex max-w-[1360px] flex-col gap-1">
            {menuData.map((menuItem) => (
              <li key={menuItem.id}>
                <Link
                  href={menuItem.path}
                  onClick={() => setNavigationOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-brand-ink hover:bg-white hover:text-brand-rust"
                >
                  {menuItem.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/wishlist"
                onClick={() => setNavigationOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-brand-ink hover:bg-white hover:text-brand-rust"
              >
                Wishlist
              </Link>
            </li>
            <li>
              <Link
                href={isAuthenticated ? myAccountPath : signInPath}
                onClick={() => setNavigationOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-brand-ink hover:bg-white hover:text-brand-rust"
              >
                {isAuthenticated ? "Account" : "Sign in"}
              </Link>
            </li>
            {isAdmin ? (
              <li>
                <Link
                  href={adminProductsPath}
                  onClick={() => setNavigationOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-brand-rust hover:bg-white"
                >
                  Manage catalogue
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>

      {/* Desktop secondary nav strip for lg without xl */}
      <div className="hidden border-t border-brand-ink/10 lg:block xl:hidden">
        <div className="mx-auto flex max-w-[1360px] items-center gap-6 px-4 py-2.5 sm:px-7.5">
          {menuData.map((menuItem) => (
            <Link
              key={menuItem.id}
              href={menuItem.path}
              className="text-sm font-medium text-brand-ink hover:text-brand-rust"
            >
              {menuItem.title}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
